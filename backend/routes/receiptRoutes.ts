import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import Receipt from '../models/Receipt';
import PDFDocument from 'pdfkit';

const router = Router();

router.use(protect);

// Generate bulk PDF receipts
router.post('/bulk-pdf', async (req: any, res) => {
  try {
    const { receiptIds } = req.body;
    
    const receipts = await Receipt.find({
      _id: { $in: receiptIds },
      organizationId: req.user.organizationId
    }).populate('organizationId', 'name');

    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=bulk-receipts.pdf');
    
    doc.pipe(res);

    receipts.forEach((receipt, index) => {
      if (index > 0) doc.addPage();
      
      const orgName = (receipt.organizationId as any)?.name || 'Property Management';
      
      // Header with gradient-like effect
      doc.rect(0, 0, 612, 120).fill('#2563eb');
      doc.fontSize(28).font('Helvetica-Bold').fillColor('white')
         .text(orgName, 50, 30, { align: 'center', width: 512 });
      doc.fontSize(16).font('Helvetica').fillColor('white')
         .text('PAYMENT RECEIPT', 50, 70, { align: 'center', width: 512 });
      doc.fontSize(12).fillColor('white')
         .text(`Receipt Date: ${receipt.paymentDate.toLocaleDateString()}`, 50, 95, { align: 'center', width: 512 });
      
      // Reset color for body
      doc.fillColor('black');
      
      // Receipt number section
      doc.rect(50, 140, 512, 40).fill('#f8fafc').stroke('#e2e8f0');
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e293b')
         .text('Receipt Information', 70, 150);
      doc.fontSize(11).font('Helvetica').fillColor('#475569')
         .text(`Receipt #: ${receipt.receiptNumber}`, 70, 165);
      if (receipt.handwrittenReceiptNumber) {
        doc.text(`Manual Receipt #: ${receipt.handwrittenReceiptNumber}`, 300, 165);
      }
      
      // Tenant details section
      doc.fillColor('black');
      doc.fontSize(14).font('Helvetica-Bold')
         .text('Tenant Details', 70, 200);
      
      const tenantBox = 220;
      doc.rect(50, tenantBox, 250, 120).stroke('#e2e8f0');
      doc.fontSize(11).font('Helvetica')
         .text(`Name: ${receipt.tenantName}`, 70, tenantBox + 15)
         .text(`Property: ${receipt.propertyName}`, 70, tenantBox + 35)
         .text(`Unit: ${receipt.unitNumber}`, 70, tenantBox + 55)
         .text(`Rent Month: ${receipt.rentMonth || 'N/A'}`, 70, tenantBox + 75)
         .text(`Payment Method: ${receipt.paymentMethod}`, 70, tenantBox + 95);
      
      // Amount section (highlighted)
      const amountBox = tenantBox;
      doc.rect(320, amountBox, 242, 120).fill('#dcfce7').stroke('#16a34a');
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#15803d')
         .text('Payment Summary', 340, amountBox + 15);
      doc.fontSize(24).font('Helvetica-Bold').fillColor('#15803d')
         .text(`$${receipt.amount.toFixed(2)}`, 340, amountBox + 50);
      doc.fontSize(11).font('Helvetica').fillColor('#166534')
         .text('Amount Received', 340, amountBox + 80)
         .text('Status: PAID', 340, amountBox + 95);
      
      // Footer section
      doc.fillColor('#64748b');
      doc.rect(50, 700, 512, 60).fill('#f1f5f9').stroke('#cbd5e1');
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#334155')
         .text('Thank you for your payment!', 50, 720, { align: 'center', width: 512 });
      doc.fontSize(9).font('Helvetica').fillColor('#64748b')
         .text('This receipt serves as proof of payment. Please retain for your records.', 50, 735, { align: 'center', width: 512 })
         .text('Powered by HNV Property Management Solutions', 50, 745, { align: 'center', width: 512 });
    });

    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate PDF' });
  }
});

// Generate thermal print HTML
router.post('/thermal-print', async (req: any, res) => {
  try {
    const { receiptIds } = req.body;
    
    const receipts = await Receipt.find({
      _id: { $in: receiptIds },
      organizationId: req.user.organizationId
    }).populate('organizationId', 'name');

    // Generate thermal printer compatible HTML
    const thermalHTML = receipts.map(receipt => {
      const orgName = (receipt.organizationId as any)?.name || 'Property Management';
      
      return `
        <div class="receipt" style="width: 80mm; font-family: monospace; font-size: 12px; margin-bottom: 20px; page-break-after: always;">
          <div style="text-align: center; font-weight: bold; margin-bottom: 5px; font-size: 14px;">
            ${orgName}
          </div>
          <div style="text-align: center; font-weight: bold; margin-bottom: 10px;">
            PAYMENT RECEIPT
          </div>
          <div style="border-bottom: 1px dashed #000; margin-bottom: 10px;"></div>
          <div>Receipt #: ${receipt.receiptNumber}</div>
          ${receipt.handwrittenReceiptNumber ? `<div>Manual #: ${receipt.handwrittenReceiptNumber}</div>` : ''}
          <div>Date: ${receipt.paymentDate.toLocaleDateString()}</div>
          <div style="border-bottom: 1px dashed #000; margin: 10px 0;"></div>
          <div>Tenant: ${receipt.tenantName}</div>
          <div>Property: ${receipt.propertyName}</div>
          <div>Unit: ${receipt.unitNumber}</div>
          <div style="border-bottom: 1px dashed #000; margin: 10px 0;"></div>
          <div>Rent Month: ${receipt.rentMonth || 'N/A'}</div>
          <div>Payment Method: ${receipt.paymentMethod}</div>
          <div style="font-weight: bold; font-size: 14px; margin-top: 10px;">
            Amount: $${receipt.amount.toFixed(2)}
          </div>
          <div style="border-bottom: 1px dashed #000; margin: 10px 0;"></div>
          <div style="text-align: center; font-size: 10px;">
            Thank you for your payment!
          </div>
          <div style="text-align: center; font-size: 8px; margin-top: 5px;">
            Powered by HNV Property Management Solutions
          </div>
        </div>
      `;
    }).join('');
    
    const fullHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Thermal Print Receipts</title>
        <style>
          @media print {
            body { margin: 0; }
            .receipt { page-break-after: always; }
          }
        </style>
      </head>
      <body>${thermalHTML}</body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(fullHTML);
  } catch (error) {
    console.error('Thermal print error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate print format' });
  }
});

export default router;