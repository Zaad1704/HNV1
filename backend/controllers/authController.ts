// backend/controllers/authController.ts
// ...
import User from '../models/User';
import Organization from '../models/Organization'; // Make sure Organization is imported
import Subscription from '../models/Subscription'; // Make sure Subscription is imported
import Plan from '../models/Plan'; // Make sure Plan is imported

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    // Populate organizationId and its subscription for immediate status check
    const user = await User.findOne({ email }).select('+password').populate({
        path: 'organizationId',
        populate: {
            path: 'subscription',
            populate: { path: 'planId', model: 'Plan' } // Populate plan details if needed
        }
    });

    if (user && user.password && (await user.matchPassword(password))) {
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '30d' });

        // Determine effective status for redirection logic
        let redirectStatus = 'active'; // Default
        let message = 'Login successful';

        const userOrg = user.organizationId as any; // Type assertion for populated data

        if (user.status && user.status !== 'active') {
            redirectStatus = 'account_inactive';
            message = `Your account is ${user.status}.`;
        } else if (userOrg && user.role !== 'Super Admin' && userOrg.subscription) {
            const subscription = userOrg.subscription as any; // Type assertion for populated data
            if (subscription.status !== 'active' && !subscription.isLifetime) {
                redirectStatus = 'subscription_inactive';
                message = 'Organization subscription is inactive.';
            }
        }

        res.json({
            success: true,
            token,
            userStatus: redirectStatus, // Indicate if redirection is needed
            message // Optional message
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});
// ...
