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

        totalCollected += payment.amount;
      } else if (daysLate > 0) {
        status = 'overdue';
        pendingCount++;
        pendingAmount += rentDue + lateFees;
      } else {
        pendingCount++;
        pendingAmount += rentDue;

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

      });

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

      },
      tenants: tenantData
    });

    await period.save();
    return period;

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

  async generateCollectionSheet(periodId: string, options: any): Promise<string> {
    const period = await RentCollectionPeriod.findById(periodId);
    if (!period) throw new Error('Collection period not found');

    const fileName = `collection_sheet_${period.period.year}_${period.period.month}_${Date.now()}.pdf
      doc.fontSize(16).text(`${this.getMonthName(period.period.month)} ${period.period.year}
        .text(`Total Units: ${period.summary.totalUnits}
        .text(`Expected: $${period.summary.expectedRent.toFixed(2)}
        .text(`Collected: $${period.summary.collectedRent.toFixed(2)}
        .text(`Outstanding: $${period.summary.outstandingRent.toFixed(2)}
        doc.fontSize(12).fillColor('#333').text(`${property}:
            `$${tenant.rentDue.toFixed(2)}
            `$${tenant.lateFees.toFixed(2)}
            `$${tenant.totalOwed.toFixed(2)}
          `$${tenant.rentDue.toFixed(2)}
          `$${tenant.lateFees.toFixed(2)}
          `$${tenant.totalOwed.toFixed(2)}
        .text(`Total Expected: $${period.summary.expectedRent.toFixed(2)}
        .text(`Total Outstanding: $${period.summary.outstandingRent.toFixed(2)}