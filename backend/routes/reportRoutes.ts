import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import PDFDocument from 'pdfkit';
import { Parser } from 'json2csv';

const router = Router();

// Monthly collection sheet endpoint
router.get('/monthly-collection', protect, async (req, res) => {
  try {
    const { month, year } = req.query;
    
    // Mock data - replace with actual database query
    const collectionData = [
      {
        _id: '1',
        tenantName: 'John Doe',
        unitNo: 'A101',
        rentAmount: 1200,
        rentStartMonth: `${month}/${year}`,
        overdueMonths: [],
        isCollected: false,
        propertyName: 'Sunset Apartments'
      }
    ];

    res.json({ success: true, data: collectionData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch collection data' });
  }
});

// Universal export endpoint
router.post('/export', protect, async (req, res) => {
  try {
    const { section, dateRange, format, startDate, endDate } = req.body;
    
    // Mock data - replace with actual queries based on section
    const data = [
      { name: 'Sample Data', date: new Date().toISOString(), amount: 1000 }
    ];

    if (format === 'csv') {
      const parser = new Parser();
      const csv = parser.parse(data);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${section}-export.csv"`);
      res.send(csv + '\n\nPowered by HNV Property Management Solutions');
    } else if (format === 'pdf') {
      const doc = new PDFDocument();
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${section}-export.pdf"`);
      
      doc.pipe(res);
      doc.fontSize(20).text(`${section.toUpperCase()} Export`, 100, 100);
      doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, 100, 130);
      
      // Add data
      let yPosition = 160;
      data.forEach((item, index) => {
        doc.text(`${index + 1}. ${JSON.stringify(item)}`, 100, yPosition);
        yPosition += 20;
      });
      
      // Add branding
      doc.fontSize(10).text('Powered by HNV Property Management Solutions', 100, doc.page.height - 50);
      doc.end();
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Export failed' });
  }
});

export default router;