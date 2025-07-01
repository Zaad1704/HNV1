import RentCollectionPeriod, { IRentCollectionPeriod } from '../models/RentCollectionPeriod';
import CollectionAction from '../models/CollectionAction';
import CollectionSheet from '../models/CollectionSheet';
import Tenant from '../models/Tenant';
import Property from '../models/Property';
import Payment from '../models/Payment';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

class RentCollectionService {
  private uploadsDir = path.join(__dirname, '../uploads/collections');

  constructor() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async generateCollectionPeriod(organizationId: string, year: number, month: number): Promise<any> {
    // Check if period already exists
    let period = await RentCollectionPeriod.findOne({
      organizationId,
      'period.year': year,
      'period.month': month
    });

    if (period) {
      // Update existing period
      await this.updateCollectionPeriod(period);
      return period;
    }

    // Create new period
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Get all active tenants for the organization
    const tenants = await Tenant.find({
      organizationId,
      status: 'active'
    }).populate('propertyId', 'name address');

    const tenantData = [];
    let totalExpected = 0;
    let totalCollected = 0;
    let onTimeCount = 0;
    let onTimeAmount = 0;
    let lateCount = 0;
    let lateAmount = 0;
    let pendingCount = 0;
    let pendingAmount = 0;

    for (const tenant of tenants) {
      const rentDue = tenant.rentAmount || 0;
      const dueDate = new Date(year, month - 1, tenant.rentDueDay || 1);
      
      // Calculate late fees
      const today = new Date();
      const daysLate = Math.max(0, Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
      const lateFees = daysLate > 3 ? Math.min(daysLate * 5, rentDue * 0.1) : 0;
      
      // Check payment status
      const payment = await Payment.findOne({
        tenantId: tenant._id,
        paymentDate: { $gte: startDate, $lte: endDate },
        status: 'completed'
      });

      let status: 'paid' | 'overdue' | 'pending' = 'pending';
      if (payment) {
        status = 'paid';
        const paymentDate = new Date(payment.paymentDate);
        if (paymentDate <= dueDate) {
          onTimeCount++;
          onTimeAmount += payment.amount;
        } else {
          lateCount++;
          lateAmount += payment.amount;
        }
        totalCollected += payment.amount;
      } else if (daysLate > 0) {
        status = 'overdue';
        pendingCount++;
        pendingAmount += rentDue + lateFees;
      } else {
        pendingCount++;
        pendingAmount += rentDue;
      }

      // Get payment history
      const paymentHistory = await Payment.find({
        tenantId: tenant._id,
        status: 'completed'
      }).sort({ paymentDate: -1 }).limit(12);

      const averageDaysLate = paymentHistory.length > 0 
        ? paymentHistory.reduce((sum, p) => {
            const pDue = new Date(p.paymentDate.getFullYear(), p.paymentDate.getMonth(), tenant.rentDueDay || 1);
            const late = Math.max(0, Math.floor((p.paymentDate.getTime() - pDue.getTime()) / (1000 * 60 * 60 * 24)));
            return sum + late;
          }, 0) / paymentHistory.length
        : 0;

      const missedPayments = await Payment.countDocuments({
        tenantId: tenant._id,
        status: 'failed'
      });

      totalExpected += rentDue + lateFees;

      tenantData.push({
        tenantId: tenant._id,
        name: tenant.name,
        property: (tenant.propertyId as any)?.name || 'Unknown',
        unit: tenant.unitNumber || tenant.unit || 'N/A',
        rentDue,
        lateFees,
        totalOwed: rentDue + lateFees,
        dueDate,
        daysLate,
        status,
        contact: {
          phone: tenant.phone || '',
          email: tenant.email || '',
          preferredMethod: tenant.preferredContactMethod || 'phone'
        },
        paymentHistory: {
          lastPayment: paymentHistory[0]?.paymentDate,
          averageDaysLate: Math.round(averageDaysLate),
          missedPayments
        }
      });
    }

    const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

    period = new RentCollectionPeriod({
      organizationId,
      period: { month, year },
      summary: {
        totalUnits: tenants.length,
        occupiedUnits: tenants.length,
        expectedRent: totalExpected,
        collectedRent: totalCollected,
        outstandingRent: totalExpected - totalCollected,
        collectionRate: Math.round(collectionRate * 100) / 100,
        breakdown: {
          onTime: { count: onTimeCount, amount: onTimeAmount },
          late: { count: lateCount, amount: lateAmount },
          pending: { count: pendingCount, amount: pendingAmount }
        }
      },
      tenants: tenantData
    });

    await period.save();
    return period;
  }

  async updateCollectionPeriod(period: IRentCollectionPeriod): Promise<void> {
    // Refresh the data for existing period
    const { year, month } = period.period;
    const updatedPeriod = await this.generateCollectionPeriod(
      period.organizationId.toString(),
      year,
      month
    );
    
    // Update the existing period with new data
    period.summary = updatedPeriod.summary;
    period.tenants = updatedPeriod.tenants;
    period.lastUpdated = new Date();
    
    await period.save();
  }

  async generateCollectionSheet(periodId: string, options: any): Promise<string> {
    const period = await RentCollectionPeriod.findById(periodId);
    if (!period) throw new Error('Collection period not found');

    const fileName = `collection_sheet_${period.period.year}_${period.period.month}_${Date.now()}.pdf`;
    const filePath = path.join(this.uploadsDir, fileName);

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    doc.pipe(fs.createWriteStream(filePath));

    // Header
    if (options.sections?.header?.showLogo) {
      doc.fontSize(24).text('RENT COLLECTION SHEET', 40, 40, { align: 'center' });
    }
    
    if (options.sections?.header?.showPeriod) {
      doc.fontSize(16).text(`${this.getMonthName(period.period.month)} ${period.period.year}`, 40, 80, { align: 'center' });
    }

    if (options.sections?.header?.showSummary) {
      doc.fontSize(12)
        .text(`Total Units: ${period.summary.totalUnits}`, 40, 120)
        .text(`Expected: $${period.summary.expectedRent.toFixed(2)}`, 200, 120)
        .text(`Collected: $${period.summary.collectedRent.toFixed(2)}`, 350, 120)
        .text(`Outstanding: $${period.summary.outstandingRent.toFixed(2)}`, 500, 120);
    }

    // Table headers
    let yPos = 160;
    doc.fontSize(10).fillColor('#000');
    
    const headers = ['☐', 'Tenant', 'Property', 'Unit', 'Rent Due', 'Late Fees', 'Total', 'Phone', 'Notes'];
    const colWidths = [30, 100, 80, 40, 60, 60, 60, 80, 100];
    let xPos = 40;

    headers.forEach((header, i) => {
      doc.text(header, xPos, yPos, { width: colWidths[i] });
      xPos += colWidths[i];
    });

    // Draw header line
    yPos += 15;
    doc.moveTo(40, yPos).lineTo(550, yPos).stroke();
    yPos += 10;

    // Sort tenants based on options
    let sortedTenants = [...period.tenants];
    if (options.sections?.tenantList?.sortBy === 'name') {
      sortedTenants.sort((a, b) => a.name.localeCompare(b.name));
    } else if (options.sections?.tenantList?.sortBy === 'amount') {
      sortedTenants.sort((a, b) => b.totalOwed - a.totalOwed);
    } else if (options.sections?.tenantList?.sortBy === 'dueDate') {
      sortedTenants.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }

    // Group by property if requested
    if (options.format?.groupBy === 'property') {
      const grouped = sortedTenants.reduce((acc, tenant) => {
        if (!acc[tenant.property]) acc[tenant.property] = [];
        acc[tenant.property].push(tenant);
        return acc;
      }, {} as Record<string, any[]>);

      for (const [property, tenants] of Object.entries(grouped)) {
        // Property header
        if (yPos > 700) {
          doc.addPage();
          yPos = 40;
        }
        
        doc.fontSize(12).fillColor('#333').text(`${property}:`, 40, yPos);
        yPos += 20;

        // Tenants in this property
        for (const tenant of tenants) {
          if (yPos > 720) {
            doc.addPage();
            yPos = 40;
          }

          xPos = 40;
          const rowData = [
            '☐',
            tenant.name.substring(0, 15),
            '',
            tenant.unit,
            `$${tenant.rentDue.toFixed(2)}`,
            `$${tenant.lateFees.toFixed(2)}`,
            `$${tenant.totalOwed.toFixed(2)}`,
            tenant.contact.phone,
            tenant.notes?.substring(0, 15) || ''
          ];

          doc.fontSize(9).fillColor('#000');
          rowData.forEach((data, i) => {
            doc.text(data, xPos, yPos, { width: colWidths[i] });
            xPos += colWidths[i];
          });

          yPos += 18;
        }
        yPos += 10;
      }
    } else {
      // Regular list
      for (const tenant of sortedTenants) {
        if (yPos > 720) {
          doc.addPage();
          yPos = 40;
        }

        xPos = 40;
        const rowData = [
          '☐',
          tenant.name.substring(0, 15),
          tenant.property.substring(0, 12),
          tenant.unit,
          `$${tenant.rentDue.toFixed(2)}`,
          `$${tenant.lateFees.toFixed(2)}`,
          `$${tenant.totalOwed.toFixed(2)}`,
          tenant.contact.phone,
          tenant.notes?.substring(0, 15) || ''
        ];

        doc.fontSize(9).fillColor('#000');
        rowData.forEach((data, i) => {
          doc.text(data, xPos, yPos, { width: colWidths[i] });
          xPos += colWidths[i];
        });

        yPos += 18;
      }
    }

    // Footer
    if (options.sections?.footer?.showTotals) {
      yPos += 20;
      doc.fontSize(12).fillColor('#000')
        .text(`Total Expected: $${period.summary.expectedRent.toFixed(2)}`, 40, yPos)
        .text(`Total Outstanding: $${period.summary.outstandingRent.toFixed(2)}`, 300, yPos);
    }

    if (options.sections?.footer?.showSignature) {
      yPos += 40;
      doc.text('Collected by: ________________________', 40, yPos)
        .text('Date: ________________________', 300, yPos);
    }

    doc.end();

    return new Promise((resolve, reject) => {
      doc.on('end', () => resolve(filePath));
      doc.on('error', reject);
    });
  }

  async recordCollectionAction(data: any): Promise<void> {
    const action = new CollectionAction(data);
    await action.save();

    // Update tenant notes if provided
    if (data.details.notes && data.tenantId) {
      const period = await RentCollectionPeriod.findById(data.periodId);
      if (period) {
        const tenant = period.tenants.find(t => t.tenantId.toString() === data.tenantId);
        if (tenant) {
          tenant.notes = data.details.notes;
          await period.save();
        }
      }
    }
  }

  async getCollectionAnalytics(organizationId: string, startDate: Date, endDate: Date): Promise<any> {
    const periods = await RentCollectionPeriod.find({
      organizationId,
      generatedAt: { $gte: startDate, $lte: endDate }
    }).sort({ 'period.year': -1, 'period.month': -1 });

    if (periods.length === 0) return null;

    const totalExpected = periods.reduce((sum, p) => sum + p.summary.expectedRent, 0);
    const totalCollected = periods.reduce((sum, p) => sum + p.summary.collectedRent, 0);
    const averageCollectionRate = periods.reduce((sum, p) => sum + p.summary.collectionRate, 0) / periods.length;

    // Get problem tenants (consistently late)
    const allTenants = periods.flatMap(p => p.tenants);
    const tenantStats = allTenants.reduce((acc, tenant) => {
      const key = tenant.tenantId.toString();
      if (!acc[key]) {
        acc[key] = {
          name: tenant.name,
          property: tenant.property,
          totalOwed: 0,
          appearances: 0,
          totalDaysLate: 0
        };
      }
      acc[key].totalOwed += tenant.totalOwed;
      acc[key].appearances++;
      acc[key].totalDaysLate += tenant.daysLate;
      return acc;
    }, {} as Record<string, any>);

    const problemTenants = Object.values(tenantStats)
      .filter((t: any) => t.totalDaysLate / t.appearances > 5)
      .sort((a: any, b: any) => b.totalOwed - a.totalOwed)
      .slice(0, 10);

    return {
      performance: {
        collectionRate: Math.round(averageCollectionRate * 100) / 100,
        totalCollected,
        totalOutstanding: totalExpected - totalCollected,
        periodsAnalyzed: periods.length
      },
      breakdown: {
        byMonth: periods.map(p => ({
          month: p.period.month,
          year: p.period.year,
          collectionRate: p.summary.collectionRate,
          collected: p.summary.collectedRent,
          outstanding: p.summary.outstandingRent
        }))
      },
      problemTenants
    };
  }

  private getMonthName(month: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  }
}

export default new RentCollectionService();