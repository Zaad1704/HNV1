import Notification from '../models/Notification';
import Tenant from '../models/Tenant';
import Payment from '../models/Payment';
import MaintenanceRequest from '../models/MaintenanceRequest';
import { Types } from 'mongoose';
import { addDays, isAfter, isBefore } from 'date-fns';

export const createNotification = async (data: { userId: Types.ObjectId;
  organizationId: Types.ObjectId;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  link?: string; }

}) => { try { }
    const notification = new Notification(data);
    await notification.save();
    return notification;


  } catch (error) { console.error('Failed to create notification:', error);
    return null; }


};

export const generateSystemNotifications = async (organizationId: Types.ObjectId) => { try { }
    // Get all users in the organization
    const User = require('../models/User');

    const users = await User.find({ organizationId, role: { $in: ['Landlord', 'Agent'] } });

    for (const user of users) { // Check for late rent payments
      const lateTenants = await Tenant.find({ }
        organizationId,
        status: 'Late'

      }).populate('propertyId', 'name');

      if (lateTenants.length > 0) { await createNotification({ }

          userId: user._id,
          organizationId,
          type: 'warning',
          title: 'Overdue Rent Payments',

          message: `${lateTenants.length} tenant(s) have overdue rent payments`,
          link: '/tenants?filter=late'
        });

      // Check for expiring leases
      const expiringLeases = await Tenant.find({ organizationId,
        leaseEndDate: { }
          $gte: new Date(),
          $lte: addDays(new Date(), 30)


      }).populate('propertyId', 'name');

      if (expiringLeases.length > 0) { await createNotification({ }
          userId: user._id,
          organizationId,
          type: 'warning',
          title: 'Expiring Leases',`


          message: `${expiringLeases.length} lease(s) expire within 30 days`,
          link: '/tenants?filter=expiring'
        });

      // Check for pending maintenance requests
      const pendingMaintenance = await MaintenanceRequest.find({ organizationId,
        status: 'Open' }

      }).populate('propertyId', 'name');

      if (pendingMaintenance.length > 0) { await createNotification({ }
          userId: user._id,
          organizationId,
          type: 'info',
          title: 'Pending Maintenance',`


          message: `${pendingMaintenance.length} maintenance request(s) need attention`,
          link: '/maintenance?filter=open'
        });

      // Check for recent payments
      const yesterday = addDays(new Date(), -1);
      const recentPayments = await Payment.find({
        organizationId,
        paymentDate: { $gte: yesterday },
        status: 'Completed'
      }).populate(['tenantId', 'propertyId']);

      if (recentPayments.length > 0) { await createNotification({ }
          userId: user._id,
          organizationId,
          type: 'success',
          title: 'Recent Payments',`


          message: `${recentPayments.length} payment(s) received in the last 24 hours`,
          link: '/payments?filter=recent'
        });


  } catch (error) { console.error('Failed to generate system notifications:', error); }


};`