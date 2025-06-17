import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import MaintenanceRequest from '../models/MaintenanceRequest';
import Tenant from '../models/Tenant';
import User from '../models/User'; // <-- Import User model
import notificationService from '../services/notificationService'; // <-- Import Notification service

export const createMaintenanceRequest = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });

    const { category, description, imageUrl } = req.body;
    // ... (validation logic) ...

    try {
        const tenant = await Tenant.findOne({ email: req.user.email, /*...*/ });
        if (!tenant) return res.status(404).json({ success: false, message: 'Tenant profile not found.' });
        
        const newRequest = await MaintenanceRequest.create({ /* ... */ });

        // --- NEW: TRIGGER NOTIFICATION ---
        // Find all Landlords and Agents in the organization to notify them.
        const usersToNotify = await User.find({
            organizationId: req.user.organizationId,
            role: { $in: ['Landlord', 'Agent'] }
        });

        for (const adminUser of usersToNotify) {
            await notificationService.createNotification(
                adminUser._id,
                req.user.organizationId,
                `New maintenance request from ${tenant.name} for ${description.substring(0, 20)}...`,
                `/dashboard/maintenance` // Link to the page where they can see the request
            );
        }
        // -----------------------------

        res.status(201).json({ success: true, data: newRequest });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// ... (other functions in the controller)
