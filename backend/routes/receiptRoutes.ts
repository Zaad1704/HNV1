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
      
      // Header with organization name
      doc.fontSize(24).font('Helvetica-Bold').text(orgName, 50, 50, { align: 'center' });
      doc.fontSize(18).font('Helvetica-Bold').text('PAYMENT RECEIPT', 50, 90, { align: 'center' });
      
      // Receipt details box
      doc.rect(50, 130, 500, 200).stroke();
      
      // Receipt information
      doc.fontSize(12).font('Helvetica');
      doc.text(`Receipt Number: ${receipt.receiptNumber}`, 70, 150);
      if (receipt.handwrittenReceiptNumber) {
        doc.text(`Handwritten Receipt #: ${receipt.handwrittenReceiptNumber}`, 70, 170);
      }
      doc.text(`Date: ${receipt.paymentDate.toLocaleDateString()}`, 70, receipt.handwrittenReceiptNumber ? 190 : 170);
      
      // Tenant and property details
      const detailsY = receipt.handwrittenReceiptNumber ? 220 : 200;
      doc.text(`Tenant Name: ${receipt.tenantName}`, 70, detailsY);
      doc.text(`Property: ${receipt.propertyName}`, 70, detailsY + 20);
      doc.text(`Unit Number: ${receipt.unitNumber}`, 70, detailsY + 40);
      doc.text(`Rent Month: ${receipt.rentMonth || 'N/A'}`, 70, detailsY + 60);
      doc.text(`Payment Method: ${receipt.paymentMethod}`, 70, detailsY + 80);
      
      // Amount (highlighted)
      doc.fontSize(16).font('Helvetica-Bold');
      doc.text(`Amount Paid: $${receipt.amount.toFixed(2)}`, 70, detailsY + 110);
      
      // Footer
      doc.fontSize(10).font('Helvetica').text('Thank you for your payment!', 50, 400, { align: 'center' });
      doc.text('Powered by HNV Property Management Solutions', 50, 420, { align: 'center' });
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