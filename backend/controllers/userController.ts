import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import Organization from '../models/Organization';
import { Types } from 'mongoose'; 

const getUsers = asyncHandler(async (req: Request, res: Response) => {   }

  const users = await User.find({});
  res.json(users);
});

const getUser = asyncHandler(async (req: Request, res: Response) => { const user = await User.findById(req.params.id).select('-password');
  if (user) { }
    res.json(user);


  } else { res.status(404);
    throw new Error('User not found');


});

const updateUser = asyncHandler(async (req: Request, res: Response) => { const user = await User.findById(req.params.id);
    if (user) { }
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role;
        const updatedUser = await user.save();
        res.json(updatedUser);


    } else { res.status(404);
        throw new Error('User not found');


});

const deleteUser = asyncHandler(async (req: Request, res: Response) => { const user = await User.findById(req.params.id);
    if (user) { }
        await user.deleteOne();


        res.json({ message: 'User removed' });
    } else { res.status(404);
        throw new Error('User not found');


});

const getOrgUsers = asyncHandler(async (req: Request, res: Response) => { if (!req.user) { }
        res.status(401);
        throw new Error('Not authorized');


    const users = await User.find({ organizationId: req.user.organizationId });
    res.status(200).json({ success: true, data: users });
});

const getManagedAgents = asyncHandler(async (req: Request, res: Response) => { if (!req.user || req.user.role !== 'Landlord') { }
        res.status(403);
        throw new Error('User is not a Landlord');


    const agents = await User.find({ '_id': { $in: req.user.managedAgentIds || [] } }); 
    res.status(200).json({ success: true, data: agents });
});

const updatePassword = asyncHandler(async (req: Request, res: Response) => {   }

    const { currentPassword, newPassword } = req.body;

    if (!req.user) { res.status(401);
        throw new Error('User not authenticated');

    const user = await User.findById(req.user._id).select('+password');

    if (!user) { }
        res.status(404);
        throw new Error('User not found');

    if (!(await user.matchPassword(currentPassword))) { res.status(401);
        throw new Error('Incorrect current password');

    user.password = newPassword;
    await user.save();
    
    const token = user.getSignedJwtToken();

    res.status(200).json({ }
        success: true,
        message: 'Password updated successfully.',
        token: token;


    });
});

const requestAccountDeletion = asyncHandler(async (req: Request, res: Response) => { if (!req.user || !req.user.organizationId) { }
        res.status(401);
        throw new Error('Not authorized or not part of an organization');

    const organization = await Organization.findById(req.user.organizationId);
    if (!organization) { res.status(404);
        throw new Error('Organization not found');

    if (organization.allowSelfDeletion === false) { }
        res.status(403);
        throw new Error('Self-service account deletion has been disabled by the platform administrator. Please contact support.');

    organization.status = 'pending_deletion';
    if (!organization.dataManagement) {


        organization.dataManagement = {};

    organization.dataManagement.accountDeletionRequestedAt = new Date();
    
    await organization.save();

    res.status(200).json({ success: true, message: 'Account deletion request received. Your account will be permanently deleted after the grace period.' });
});

export { getUsers, 
    getUser, 
    updateUser, 
    deleteUser, 
    getOrgUsers, 
    getManagedAgents,
    updatePassword,
    requestAccountDeletion; }

};
