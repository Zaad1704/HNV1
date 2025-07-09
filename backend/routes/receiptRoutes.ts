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
    });

    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=bulk-receipts.pdf');
    
    doc.pipe(res);

    receipts.forEach((receipt, index) => {
      if (index > 0) doc.addPage();
      
      // Receipt header
      doc.fontSize(20).text('PAYMENT RECEIPT', 50, 50);
      doc.fontSize(12).text(`Receipt #: ${receipt.receiptNumber}`, 50, 80);
      doc.text(`Date: ${receipt.paymentDate.toLocaleDateString()}`, 50, 100);
      
      // Tenant details
      doc.text(`Tenant: ${receipt.tenantName}`, 50, 140);
      doc.text(`Property: ${receipt.propertyName}`, 50, 160);
      doc.text(`Unit: ${receipt.unitNumber}`, 50, 180);
      
      // Payment details
      doc.text(`Rent Month: ${receipt.rentMonth || 'N/A'}`, 50, 220);
      doc.text(`Payment Method: ${receipt.paymentMethod}`, 50, 240);
      doc.fontSize(16).text(`Amount: $${receipt.amount.toFixed(2)}`, 50, 280);
      
      // Footer
      doc.fontSize(10).text('Thank you for your payment!', 50, 350);
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
    });

    // Generate thermal printer compatible HTML
    const thermalHTML = receipts.map(receipt => `
      <div class="receipt" style="width: 80mm; font-family: monospace; font-size: 12px; margin-bottom: 20px; page-break-after: always;">
        <div style="text-align: center; font-weight: bold; margin-bottom: 10px;">
          PAYMENT RECEIPT
        </div>
        <div style="border-bottom: 1px dashed #000; margin-bottom: 10px;"></div>
        <div>Receipt #: ${receipt.receiptNumber}</div>
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
      </div>
    `).join('');
    
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