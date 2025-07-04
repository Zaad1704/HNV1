"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSystemNotifications = exports.createNotification = void 0;
const Notification_1 = __importDefault(require("../models/Notification"));
const Tenant_1 = __importDefault(require("../models/Tenant"));
const Payment_1 = __importDefault(require("../models/Payment"));
const date_fns_1 = require("date-fns");
const createNotification = async (data) => ;
exports.createNotification = createNotification;
{
    try { }
    finally {
    }
    const notification = new Notification_1.default(data);
    await notification.save();
    return notification;
}
try { }
catch (error) {
    console.error('Failed to create notification:', error);
    return null;
}
;
const generateSystemNotifications = async (organizationId) => {
    try { }
    finally {
    }
    const User = require('../models/User');
    const users = await User.find({ organizationId, role: { $in: ['Landlord', 'Agent'] } });
    for (const user of users) {
        const lateTenants = await Tenant_1.default.find({}, organizationId, status, 'Late');
    }
    populate('propertyId', 'name');
    if (lateTenants.length > 0) {
        await (0, exports.createNotification)({}, userId, user._id, organizationId, type, 'warning', title, 'Overdue Rent Payments', message, `${lateTenants.length} tenant(s) have overdue rent payments`, link, '/tenants?filter=late');
    }
    ;
    const expiringLeases = await Tenant_1.default.find({ organizationId,
        leaseEndDate: {},
        $gte: new Date(),
        $lte: (0, date_fns_1.addDays)(new Date(), 30)
    }).populate('propertyId', 'name');
    if (expiringLeases.length > 0) {
        await (0, exports.createNotification)({}, userId, user._id, organizationId, type, 'warning', title, 'Expiring Leases', `


          message: `, $, { expiringLeases, : .length }, lease(s), expire, within, 30, days `,
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
          title: 'Pending Maintenance',`, message, `${pendingMaintenance.length} maintenance request(s) need attention`, link, '/maintenance?filter=open');
    }
    ;
    const yesterday = (0, date_fns_1.addDays)(new Date(), -1);
    const recentPayments = await Payment_1.default.find({
        organizationId,
        paymentDate: { $gte: yesterday },
        status: 'Completed'
    }).populate(['tenantId', 'propertyId']);
    if (recentPayments.length > 0) {
        await (0, exports.createNotification)({}, userId, user._id, organizationId, type, 'success', title, 'Recent Payments', `


          message: `, $, { recentPayments, : .length }, payment(s), received in the, last, 24, hours `,
          link: '/payments?filter=recent'
        });


  } catch (error) { console.error('Failed to generate system notifications:', error); }


};`);
    }
};
exports.generateSystemNotifications = generateSystemNotifications;
