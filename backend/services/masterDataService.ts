import Plan from '../models/Plan';
import SiteSettings from '../models/SiteSettings';
import User from '../models/User';
import Organization from '../models/Organization';
import Subscription from '../models/Subscription';

class MasterDataService {
  // Initialize default system data
  async initializeSystemData(): Promise<void> {
    await this.createDefaultPlans();
    await this.createDefaultSiteSettings();
    await this.ensureSuperAdmin();
  }

  // Create default plans if they don't exist
  private async createDefaultPlans(): Promise<void> {
    const existingPlans = await Plan.countDocuments();
    if (existingPlans === 0) {
      const defaultPlans = [
        {
          name: 'Free Trial',
          price: 0,
          duration: 'monthly',
          features: ['Up to 2 properties', 'Basic tenant management', 'Email support'],
          limits: { maxProperties: 2, maxTenants: 10, maxAgents: 0 },
          isPublic: false
        },
        {
          name: 'Starter',
          price: 2900, // $29.00 in cents
          duration: 'monthly',
          features: ['Up to 10 properties', 'Tenant management', 'Payment tracking', 'Email support'],
          limits: { maxProperties: 10, maxTenants: 50, maxAgents: 2 },
          isPublic: true
        },
        {
          name: 'Professional',
          price: 7900, // $79.00 in cents
          duration: 'monthly',
          features: ['Up to 50 properties', 'Advanced analytics', 'Rent collection', 'Priority support', 'Agent management'],
          limits: { maxProperties: 50, maxTenants: 250, maxAgents: 10 },
          isPublic: true
        },
        {
          name: 'Enterprise',
          price: 19900, // $199.00 in cents
          duration: 'monthly',
          features: ['Unlimited properties', 'White-label solution', '24/7 phone support', 'Custom integrations', 'Multi-location'],
          limits: { maxProperties: -1, maxTenants: -1, maxAgents: -1 }, // -1 means unlimited
          isPublic: true
        }
      ];

      await Plan.insertMany(defaultPlans);

    }
  }

  // Create default site settings
  private async createDefaultSiteSettings(): Promise<void> {
    const existingSettings = await SiteSettings.findOne();
    if (!existingSettings) {
      const defaultSettings = {
        siteName: 'HNV Property Management',
        siteDescription: 'Professional Property Management Solutions',
        contactEmail: 'support@hnvpm.com',
        maintenanceMode: false,
        logos: {
          companyName: 'HNV Solutions',
          navbarLogoUrl: '/logo-min.png',
          footerLogoUrl: '/logo-min.png',
          faviconUrl: '/favicon.ico'
        },
        heroSection: {
          title: 'The All-in-One Platform for Modern Property Management',
          subtitle: 'Streamline your property management with our comprehensive solution. Manage tenants, track payments, and grow your portfolio.',
          ctaText: 'Start Your Free Trial',
          backgroundImageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop'
        },
        landscapeSection: {
          title: 'Transform Your Property Management',
          subtitle: 'From small portfolios to large enterprises, our platform scales with your business.',
          features: [
            {
              title: 'Tenant Management',
              description: 'Comprehensive tenant profiles, lease tracking, and communication tools.',
              icon: 'users'
            },
            {
              title: 'Payment Processing',
              description: 'Automated rent collection, online payments, and financial reporting.',
              icon: 'credit-card'
            },
            {
              title: 'Maintenance Tracking',
              description: 'Streamlined maintenance requests and vendor management.',
              icon: 'wrench'
            }
          ]
        },
        aboutSection: {
          title: 'About HNV Property Management',
          description: 'We are dedicated to providing the most comprehensive property management solution for landlords, agents, and property managers worldwide.',
          mission: 'To simplify property management through innovative technology and exceptional service.',
          vision: 'To be the leading property management platform globally.',
          values: ['Innovation', 'Reliability', 'Customer Success', 'Transparency']
        },
        leadershipSection: {
          title: 'Our Leadership Team',
          subtitle: 'Meet the experts behind our success',
          leaders: [
            {
              name: 'John Smith',
              position: 'CEO & Founder',
              bio: 'Over 15 years of experience in property management and technology.',
              imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
              linkedin: '#',
              twitter: '#'
            },
            {
              name: 'Sarah Johnson',
              position: 'CTO',
              bio: 'Technology leader with expertise in scalable SaaS platforms.',
              imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
              linkedin: '#',
              twitter: '#'
            }
          ]
        },
        contactSection: {
          title: 'Get in Touch',
          subtitle: 'Ready to transform your property management? Contact us today.',
          email: 'contact@hnvpm.com',
          phone: '+1 (555) 123-4567',
          address: '123 Business Ave, Suite 100, City, State 12345',
          socialLinks: {
            facebook: '#',
            twitter: '#',
            linkedin: '#',
            instagram: '#'
          }
        }
      };

      await SiteSettings.create(defaultSettings);

    }
  }

  // Ensure super admin exists
  private async ensureSuperAdmin(): Promise<void> {
    const superAdmin = await User.findOne({ role: 'Super Admin' });
    if (!superAdmin) {
      // Create super admin organization
      const superAdminOrg = await Organization.create({
        name: 'HNV Administration',
        status: 'active'
      });

      // Create super admin user
      const adminUser = await User.create({
        name: 'Super Administrator',
        email: 'admin@hnvpm.com',
        password: 'SuperAdmin123!',
        role: 'Super Admin',
        organizationId: superAdminOrg._id,
        status: 'active',
        isEmailVerified: true
      });

      // Update organization owner
      superAdminOrg.owner = adminUser._id;
      superAdminOrg.members = [adminUser._id];
      await superAdminOrg.save();

      // Create lifetime subscription for super admin
      await Subscription.create({
        organizationId: superAdminOrg._id,
        planId: (await Plan.findOne({ name: 'Enterprise' }))!._id,
        status: 'active',
        isLifetime: true
      });

    }
  }

  // Get all system data for Super Admin dashboard
  async getSystemOverview(): Promise<any> {
    const [
      totalUsers,
      totalOrganizations,
      activeSubscriptions,
      totalRevenue,
      plans,
      recentUsers
    ] = await Promise.all([
      User.countDocuments(),
      Organization.countDocuments(),
      Subscription.countDocuments({ status: 'active' }),
      this.calculateTotalRevenue(),
      Plan.find({ isPublic: true }),
      User.find().sort({ createdAt: -1 }).limit(5).populate('organizationId', 'name')
    ]);

    return {
      stats: {
        totalUsers,
        totalOrganizations,
        activeSubscriptions,
        totalRevenue
      },
      plans,
      recentUsers,
      systemHealth: {
        status: 'healthy',
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage()
      }
    };
  }

  private async calculateTotalRevenue(): Promise<number> {
    const activeSubscriptions = await Subscription.find({ status: 'active' }).populate('planId');
    return activeSubscriptions.reduce((total, sub: any) => {
      return total + (sub.planId?.price || 0);
    }, 0) / 100; // Convert from cents to dollars
  }

  // Update site content (Super Admin only)
  async updateSiteContent(section: string, data: any): Promise<any> {
    const updateData = { [section]: data };
    return await SiteSettings.findOneAndUpdate({}, updateData, { 
      new: true, 
      upsert: true 
    });
  }

  // Manage plans (Super Admin only)
  async createPlan(planData: any): Promise<any> {
    return await Plan.create(planData);
  }

  async updatePlan(planId: string, planData: any): Promise<any> {
    return await Plan.findByIdAndUpdate(planId, planData, { new: true });
  }

  async deletePlan(planId: string): Promise<void> {
    await Plan.findByIdAndDelete(planId);
  }

  // Get landing page data (public)
  async getLandingPageData(): Promise<any> {
    const [siteSettings, publicPlans, stats] = await Promise.all([
      SiteSettings.findOne(),
      Plan.find({ isPublic: true }).sort({ price: 1 }),
      this.getPublicStats()
    ]);

    return {
      siteSettings,
      plans: publicPlans,
      stats
    };
  }

  private async getPublicStats(): Promise<any> {
    const totalProperties = await this.getRandomStat(2500, 3000);
    const totalUsers = await User.countDocuments();
    const countriesServed = 47;
    const uptimeGuarantee = 99.9;

    return {
      totalProperties,
      totalUsers,
      countriesServed,
      uptimeGuarantee
    };
  }

  private getRandomStat(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

export default new MasterDataService();