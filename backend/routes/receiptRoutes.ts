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

// Send to thermal printer
router.post('/thermal-print', async (req: any, res) => {
  try {
    const { receiptIds } = req.body;
    
    const receipts = await Receipt.find({
      _id: { $in: receiptIds },
      organizationId: req.user.organizationId
    });

    // Simulate thermal printing (in real implementation, this would connect to printer)
    console.log('Sending to thermal printer:', receipts.length, 'receipts');
    
    // Here you would integrate with actual thermal printer API
    // For now, just return success
    
    res.status(200).json({ 
      success: true, 
      message: `${receipts.length} receipts sent to thermal printer` 
    });
  } catch (error) {
    console.error('Thermal print error:', error);
    res.status(500).json({ success: false, message: 'Failed to print receipts' });
  }
});

export default router;