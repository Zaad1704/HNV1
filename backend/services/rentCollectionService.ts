import Tenant from '../models/Tenant';
import Payment from '../models/Payment';
import Property from '../models/Property';

class RentCollectionService { async getCollectionSummary(organizationId: string): Promise<any> { }
    try { const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      const nextMonth = new Date(currentMonth);
      nextMonth.setMonth(nextMonth.getMonth() + 1); }


      const totalTenants = await Tenant.countDocuments({ organizationId });
      
      const paidTenants = await Payment.distinct('tenantId', {
        organizationId,
        paymentDate: { $gte: currentMonth, $lt: nextMonth },
        status: 'completed'
      });

      const totalRentExpected = await Tenant.aggregate([
        { $match: { organizationId } },
        { $group: { _id: null, total: { $sum: '$rentAmount' } } }
      ]);

      const totalRentCollected = await Payment.aggregate([
        { $match: { }

            organizationId,
            paymentDate: { $gte: currentMonth, $lt: nextMonth },
            status: 'completed'

        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      return { totalTenants,
        paidTenants: paidTenants.length,
        unpaidTenants: totalTenants - paidTenants.length,
        collectionRate: totalTenants > 0 ? (paidTenants.length / totalTenants) * 100 : 0,
        totalExpected: totalRentExpected[0]?.total || 0,
        totalCollected: totalRentCollected[0]?.total || 0; }

      };
    } catch (error) { console.error('Collection summary error:', error);
      throw error; }



  async getOverdueTenants(organizationId: string): Promise<any[]> { try { }
      const today = new Date();
      
      const overdueTenants = await Tenant.find({

        organizationId,
        rentDueDate: { $lt: today },
        status: 'active'
      }).populate('propertyId', 'name address');

      return overdueTenants;
    } catch (error) { console.error('Overdue tenants error:', error);
      throw error; }



  async sendRentReminders(organizationId: string, tenantIds: string[]): Promise<any> { try { }
      const results = { success: 0,
        failed: 0,
        errors: [] }

      };

      for (const tenantId of tenantIds) { try { }
          const tenant = await Tenant.findById(tenantId).populate('propertyId');
          if (tenant) { // Send reminder logic here
            results.success++; }



        } catch (error) { results.failed++; }

          results.errors.push(`Failed to send reminder to tenant ${tenantId}`);


      return results;
    } catch (error) { console.error('Send reminders error:', error);
      throw error; }




export default new RentCollectionService();`