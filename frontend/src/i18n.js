import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Header & Navigation
      'header.login': 'Login',
      'header.get_started': 'Get Started',
      'nav.home': 'Home',
      'nav.about': 'About',
      'nav.login': 'Login',
      'nav.pricing': 'Pricing',
      'nav.contact': 'Contact',
      
      // Authentication Pages
      'auth.welcome_back': 'Welcome Back!',
      'auth.sign_in_subtitle': 'Sign in to continue to your dashboard',
      'auth.email_address': 'Email Address',
      'auth.password': 'Password',
      'auth.forgot_password': 'Forgot Password?',
      'auth.sign_in': 'Sign In',
      'auth.continue_google': 'Continue with Google',
      'auth.no_account': "Don't have an account?",
      'auth.sign_up': 'Sign Up',
      'auth.or': 'OR',
      'auth.enter_email': 'Enter your email',
      'auth.enter_password': 'Enter your password',
      
      // Registration
      'auth.create_account': 'Create Account',
      'auth.join_thousands': 'Join thousands of property managers',
      'auth.full_name': 'Full Name',
      'auth.enter_full_name': 'Enter your full name',
      'auth.role': 'Role',
      'auth.create_password': 'Create a password',
      'auth.confirm_password': 'Confirm your password',
      'auth.have_account': 'Already have an account?',
      'auth.landlord': 'Landlord',
      'auth.agent': 'Agent',
      'auth.tenant': 'Tenant',
      
      // Dashboard
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
      
      // Landing Page
      'landing.hero_title': 'Modern Property Management',
      'landing.hero_subtitle': 'Streamline your property management with our all-in-one platform',
      'landing.hero_cta': 'Get Started',
      
      // Common
      'common.loading': 'Loading...',
      'common.error': 'Error',
      'common.success': 'Success',
      'common.cancel': 'Cancel',
      'common.save': 'Save',
      'common.edit': 'Edit',
      'common.delete': 'Delete',
      'common.view': 'View',
      'common.back': 'Back'
    }
  },
  bn: {
    translation: {
      // Header & Navigation
      'header.login': 'লগইন',
      'header.get_started': 'শুরু করুন',
      'nav.home': 'হোম',
      'nav.about': 'সম্পর্কে',
      'nav.login': 'লগইন',
      'nav.pricing': 'মূল্য',
      'nav.contact': 'যোগাযোগ',
      
      // Authentication Pages
      'auth.welcome_back': 'স্বাগতম!',
      'auth.sign_in_subtitle': 'আপনার ড্যাশবোর্ডে যেতে সাইন ইন করুন',
      'auth.email_address': 'ইমেইল ঠিকানা',
      'auth.password': 'পাসওয়ার্ড',
      'auth.forgot_password': 'পাসওয়ার্ড ভুলে গেছেন?',
      'auth.sign_in': 'সাইন ইন',
      'auth.continue_google': 'গুগল দিয়ে চালিয়ে যান',
      'auth.no_account': 'কোন অ্যাকাউন্ট নেই?',
      'auth.sign_up': 'সাইন আপ',
      'auth.or': 'অথবা',
      'auth.enter_email': 'আপনার ইমেইল লিখুন',
      'auth.enter_password': 'আপনার পাসওয়ার্ড লিখুন',
      
      // Registration
      'auth.create_account': 'অ্যাকাউন্ট তৈরি করুন',
      'auth.join_thousands': 'হাজারো প্রপার্টি ম্যানেজারদের সাথে যোগ দিন',
      'auth.full_name': 'পূর্ণ নাম',
      'auth.enter_full_name': 'আপনার পূর্ণ নাম লিখুন',
      'auth.role': 'ভূমিকা',
      'auth.create_password': 'একটি পাসওয়ার্ড তৈরি করুন',
      'auth.confirm_password': 'আপনার পাসওয়ার্ড নিশ্চিত করুন',
      'auth.have_account': 'ইতিমধ্যে একটি অ্যাকাউন্ট আছে?',
      'auth.landlord': 'বাড়িওয়ালা',
      'auth.agent': 'এজেন্ট',
      'auth.tenant': 'ভাড়াটিয়া',
      
      // Dashboard
      'dashboard.overview': 'সংক্ষিপ্ত বিবরণ',
      'dashboard.properties': 'সম্পত্তি',
      'dashboard.tenants': 'ভাড়াটিয়া',
      'dashboard.monthly_revenue': 'মাসিক আয়',
      'dashboard.total_properties': 'মোট সম্পত্তি',
      'dashboard.active_tenants': 'সক্রিয় ভাড়াটিয়া',
      'dashboard.occupancy_rate': 'দখলের হার',
      
      // Landing Page
      'landing.hero_title': 'আধুনিক সম্পত্তি ব্যবস্থাপনা',
      'landing.hero_subtitle': 'আমাদের সব-এক-এক প্ল্যাটফর্মের সাথে আপনার সম্পত্তি ব্যবস্থাপনা সহজ করুন',
      'landing.hero_cta': 'শুরু করুন',
      
      // Common
      'common.loading': 'লোড হচ্ছে...',
      'common.error': 'ত্রুটি',
      'common.success': 'সফল',
      'common.cancel': 'বাতিল',
      'common.save': 'সংরক্ষণ',
      'common.edit': 'সম্পাদনা',
      'common.delete': 'মুছুন',
      'common.view': 'দেখুন',
      'common.back': 'পিছনে'
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