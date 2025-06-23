import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import Tenant from '../models/Tenant';
// ... other imports

// --- Helper function to convert JSON array to CSV string ---
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
            // Escape commas and quotes
            const stringValue = String(value).replace(/"/g, '""');
            return `"${stringValue}"`;
        });
        csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
}


// generateMonthlyCollectionSheet, getTenantMonthlyStatement, generateTenantProfilePdf functions remain the same...
export const generateMonthlyCollectionSheet = async (req: Request, res: Response) => { /* ... */ };
export const getTenantMonthlyStatement = async (req: Request, res: Response) => { /* ... */ };
export const generateTenantProfilePdf = async (req: Request, res: Response) => { /* ... */ };


// --- NEW FUNCTION for Bulk Tenant Export ---
export const exportTenantsAsCsv = async (req: Request, res: Response) => {
    if (!req.user || !req.user.organizationId) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    try {
        const { propertyId } = req.query;
        const query: { organizationId: any; propertyId?: any } = {
            organizationId: req.user.organizationId
        };

        // If a propertyId is provided in the query, add it to the filter
        if (propertyId) {
            query.propertyId = propertyId;
        }

        const tenants = await Tenant.find(query)
            .populate('propertyId', 'name')
            .select('name email phone status unit rentAmount leaseEndDate propertyId.name -_id') // Select specific fields to export
            .lean(); // Use .lean() for faster query performance on large datasets

        // Flatten the populated property name
        const flattenedTenants = tenants.map(t => ({
            name: t.name,
            email: t.email,
            phone: t.phone,
            status: t.status,
            unit: t.unit,
            rentAmount: t.rentAmount,
            leaseEndDate: t.leaseEndDate ? new Date(t.leaseEndDate).toISOString().split('T')[0] : '',
            property: (t.propertyId as any)?.name
        }));

        const csvData = convertToCsv(flattenedTenants);

        res.header('Content-Type', 'text/csv');
        res.attachment('tenants-export.csv');
        res.status(200).send(csvData);

    } catch (error) {
        console.error("CSV Export Error:", error);
        res.status(500).send('Error generating CSV file.');
    }
};
