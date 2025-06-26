import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      'header.login': 'Login',
      'header.get_started': 'Get Started',
      'nav.home': 'Home',
      'nav.about': 'About',
      'nav.login': 'Login',
      'nav.pricing': 'Pricing',
      'nav.contact': 'Contact',
      'dashboard.overview': 'Overview',
      'dashboard.properties': 'Properties',
      'dashboard.tenants': 'Tenants',
      'dashboard.expenses': 'Expenses',
      'dashboard.maintenance': 'Maintenance',
      'dashboard.cash_flow': 'Cash Flow',
      'dashboard.reminders': 'Reminders',
      'dashboard.approvals': 'Approvals',
      'dashboard.users_invites': 'Users & Invites',
      'dashboard.billing': 'Billing',
      'dashboard.audit_log': 'Audit Log',
      'dashboard.admin_panel': 'Admin Panel',
      'dashboard.settings': 'Settings',
      'dashboard.logout': 'Logout',
      'dashboard.monthly_revenue': 'Monthly Revenue',
      'dashboard.total_properties': 'Total Properties',
      'dashboard.active_tenants': 'Active Tenants',
      'dashboard.occupancy_rate': 'Occupancy Rate',
      'dashboard.financials_chart_title': 'Financial Overview',
      'dashboard.rent_status_chart_title': 'Rent Status',
      'dashboard.overdue_rent_reminders': 'Overdue Rent Reminders',
      'dashboard.send_reminder': 'Send Reminder',
      'dashboard.no_overdue_rent': 'No overdue rent payments',
      'dashboard.upcoming_lease_expirations': 'Upcoming Lease Expirations',
      'dashboard.renew_lease': 'Renew Lease',
      'dashboard.no_expiring_leases': 'No expiring leases',
      'landing.hero_title': 'Modern Property Management',
      'landing.hero_subtitle': 'Streamline your property management with our all-in-one platform',
      'landing.hero_cta': 'Get Started'
    }
  },
  bn: {
    translation: {
      'header.login': 'লগইন',
      'header.get_started': 'শুরু করুন',
      'nav.home': 'হোম',
      'nav.about': 'সম্পর্কে',
      'nav.login': 'লগইন',
      'nav.pricing': 'মূল্য',
      'nav.contact': 'যোগাযোগ',
      'dashboard.overview': 'সংক্ষিপ্ত বিবরণ',
      'dashboard.properties': 'সম্পত্তি',
      'dashboard.tenants': 'ভাড়াটিয়া',
      'dashboard.monthly_revenue': 'মাসিক আয়',
      'dashboard.total_properties': 'মোট সম্পত্তি',
      'dashboard.active_tenants': 'সক্রিয় ভাড়াটিয়া',
      'dashboard.occupancy_rate': 'দখলের হার'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;