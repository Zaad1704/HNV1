import { Response } from 'express';
import PDFDocument from 'pdfkit';
import Tenant from '../models/Tenant';
import Invoice from '../models/Invoice';
import Payment from '../models/Payment';
import Expense from '../models/Expense'; // Import Expense model
import Lease from '../models/Lease';
import { format, subMonths, getDaysInMonth, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

// Helper function to convert JSON array to CSV string
function convertToCsv(data: any[]): string {
    if (data.length === 0) {
        return '';
    }
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
        const values = headers.map(header => {
            let value = row[header];
            if (value === null || value === undefined) {
                value = '';
            } else if (typeof value === 'object') {
                value = JSON.stringify(value);
            }
            const stringValue = String(value).replace(/"/g, '""');
            return `"${stringValue}"`;
        });
        csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
}

// All existing report controller functions remain here...
export const generateMonthlyCollectionSheet = async (req: AuthenticatedRequest, res: Response) => { /* ... */ };
export const getTenantMonthlyStatement = async (req: AuthenticatedRequest, res: Response) => { /* ... */ };
export const generateTenantProfilePdf = async (req: AuthenticatedRequest, res: Response) => { /* ... */ };
export const exportTenantsAsCsv = async (req: AuthenticatedRequest, res: Response) => { /* ... */ };


/**
 * @desc    Generate a CSV export of filtered expenses
 * @route   GET /api/reports/expenses/export
 * @access  Private
 */
export const exportExpensesAsCsv = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || !req.user.organizationId) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    try {
        const { propertyId, agentId, startDate, endDate } = req.query;
        const query: any = { organizationId: req.user.organizationId };

        if (propertyId) query.propertyId = propertyId;
        if (agentId) query.paidToAgentId = agentId;
        if (startDate && endDate) {
            query.date = { $gte: new Date(startDate as string), $lte: new Date(endDate as string) };
        }

        const expenses = await Expense.find(query)
            .populate('propertyId', 'name')
            .populate('paidToAgentId', 'name')
            .sort({ date: -1 })
            .lean();

        const flattenedExpenses = expenses.map(e => ({
            date: new Date(e.date).toISOString().split('T')[0],
            description: e.description,
            category: e.category,
            amount: e.amount,
            property: (e.propertyId as any)?.name,
            paidToAgent: (e.paidToAgentId as any)?.name || '',
        }));
        
        const csvData = convertToCsv(flattenedExpenses);

        res.header('Content-Type', 'text/csv');
        res.attachment('expenses-export.csv');
        res.status(200).send(csvData);

    } catch (error) {
        console.error("CSV Export Error:", error);
        res.status(500).send('Error generating CSV file.');
    }
};
