const fs = require('fs');
const path = require('path');

// Complete Bengali translations
const bnTranslations = {
  "dashboard": {
    "overview": "সংক্ষিপ্ত বিবরণ",
    "properties": "সম্পত্তি",
    "tenants": "ভাড়াটিয়া",
    "settings": "সেটিংস",
    "logout": "লগআউট",
    "maintenance": "রক্ষণাবেক্ষণ",
    "expenses": "খরচ",
    "cash_flow": "নগদ প্রবাহ",
    "reminders": "অনুস্মারক",
    "approvals": "অনুমোদন",
    "users_invites": "ব্যবহারকারী ও আমন্ত্রণ",
    "billing": "বিলিং",
    "audit_log": "অডিট লগ",
    "admin_panel": "অ্যাডমিন প্যানেল",
    "tenant_portal": "আমার পোর্টাল",
    "monthly_revenue": "মাসিক আয়",
    "total_properties": "মোট সম্পত্তি",
    "active_tenants": "সক্রিয় ভাড়াটিয়া",
    "occupancy_rate": "দখলের হার",
    "loading_data": "ড্যাশবোর্ড ডেটা লোড হচ্ছে...",
    "overdue_rent_reminders": "বকেয়া ভাড়ার অনুস্মারক",
    "send_reminder": "অনুস্মারক পাঠান",
    "no_overdue_rent": "কোন বকেয়া ভাড়া পেমেন্ট নেই",
    "upcoming_lease_expirations": "আসন্ন লিজ মেয়াদ শেষ",
    "renew_lease": "লিজ নবায়ন",
    "no_expiring_leases": "কোন মেয়াদ শেষ হওয়া লিজ নেই",
    "financials_chart_title": "আর্থিক সংক্ষিপ্ত বিবরণ",
    "rent_status_chart_title": "ভাড়ার অবস্থা",
    "tenant_profile": "ভাড়াটিয়ার প্রোফাইল",
    "lease_information": "লিজের তথ্য",
    "pending_approval_requests": "অপেক্ষমাণ অনুমোদনের অনুরোধ",
    "no_pending_requests": "কোন অপেক্ষমাণ অনুরোধ নেই",
    "manage_account_preferences": "আপনার অ্যাকাউন্ট এবং পছন্দ পরিচালনা করুন",
    "profile_information": "প্রোফাইল তথ্য",
    "email_notifications": "ইমেইল বিজ্ঞপ্তি",
    "push_notifications": "পুশ বিজ্ঞপ্তি",
    "automated_reminders": "স্বয়ংক্রিয় অনুস্মারক",
    "add_new_reminder": "নতুন অনুস্মারক যোগ করুন",
    "no_automated_reminders": "কোন স্বয়ংক্রিয় অনুস্মারক কনফিগার করা হয়নি",
    "tenant": "ভাড়াটিয়া",
    "next_send": "পরবর্তী পাঠানো",
    "frequency": "ফ্রিকোয়েন্সি",
    "payments": "পেমেন্ট",
    "welcome_message": "আপনার ড্যাশবোর্ডে স্বাগতম",
    "good_morning": "সুপ্রভাত",
    "good_afternoon": "শুভ বিকাল",
    "good_evening": "শুভ সন্ধ্যা"
  },
  "hero": {
    "title": "আধুনিক সম্পত্তি ব্যবস্থাপনার জন্য সর্বাত্মক প্ল্যাটফর্ম",
    "subtitle": "আমাদের ব্যাপক সমাধানের সাথে আপনার সম্পত্তি ব্যবস্থাপনা সহজ করুন",
    "cta_primary": "আপনার বিনামূল্যে ট্রায়াল শুরু করুন",
    "cta_secondary": "ডেমো দেখুন",
    "trusted_by": "বিশ্বব্যাপী সম্পত্তি ব্যবস্থাপকদের দ্বারা বিশ্বস্ত"
  },
  "property": {
    "add_property": "সম্পত্তি যোগ করুন",
    "edit_property": "সম্পত্তি সম্পাদনা",
    "property_name": "সম্পত্তির নাম",
    "property_type": "সম্পত্তির ধরন",
    "apartment": "অ্যাপার্টমেন্ট",
    "house": "বাড়ি",
    "commercial": "বাণিজ্যিক",
    "other": "অন্যান্য",
    "rent_amount": "ভাড়ার পরিমাণ",
    "security_deposit": "জামানত",
    "available_units": "উপলব্ধ ইউনিট",
    "total_units": "মোট ইউনিট",
    "loading_properties": "সম্পত্তি লোড হচ্ছে...",
    "manage_portfolio": "আপনার সম্পত্তি পোর্টফোলিও পরিচালনা করুন",
    "view": "দেখুন",
    "edit": "সম্পাদনা",
    "no_properties_yet": "এখনও কোন সম্পত্তি নেই",
    "add_first_property": "আপনার প্রথম সম্পত্তি যোগ করুন",
    "add_new_property": "নতুন সম্পত্তি যোগ করুন",
    "address": "ঠিকানা",
    "city": "শহর",
    "state": "রাজ্য",
    "zip_code": "জিপ কোড",
    "click_to_upload": "ছবি আপলোড করতে ক্লিক করুন",
    "enter_property_name": "সম্পত্তির নাম লিখুন",
    "inactive": "নিষ্ক্রিয়",
    "active": "সক্রিয়",
    "number_of_units": "ইউনিটের সংখ্যা",
    "property_image": "সম্পত্তির ছবি",
    "save_property": "সম্পত্তি সংরক্ষণ",
    "street_address": "রাস্তার ঠিকানা",
    "units": "ইউনিট",
    "update_property": "সম্পত্তি আপডেট"
  }
};

// Complete Arabic translations
const arTranslations = {
  "dashboard": {
    "overview": "نظرة عامة",
    "properties": "العقارات",
    "tenants": "المستأجرين",
    "settings": "الإعدادات",
    "logout": "تسجيل الخروج",
    "maintenance": "الصيانة",
    "expenses": "المصروفات",
    "cash_flow": "التدفق النقدي",
    "reminders": "التذكيرات",
    "approvals": "الموافقات",
    "users_invites": "المستخدمين والدعوات",
    "billing": "الفواتير",
    "audit_log": "سجل المراجعة",
    "admin_panel": "لوحة الإدارة",
    "tenant_portal": "بوابتي",
    "monthly_revenue": "الإيرادات الشهرية",
    "total_properties": "إجمالي العقارات",
    "active_tenants": "المستأجرين النشطين",
    "occupancy_rate": "معدل الإشغال",
    "loading_data": "جاري تحميل بيانات لوحة التحكم...",
    "overdue_rent_reminders": "تذكيرات الإيجار المتأخر",
    "send_reminder": "إرسال تذكير",
    "no_overdue_rent": "لا توجد مدفوعات إيجار متأخرة",
    "upcoming_lease_expirations": "انتهاء صلاحية عقود الإيجار القادمة",
    "renew_lease": "تجديد عقد الإيجار",
    "no_expiring_leases": "لا توجد عقود إيجار منتهية الصلاحية",
    "financials_chart_title": "نظرة عامة مالية",
    "rent_status_chart_title": "حالة الإيجار",
    "tenant_profile": "ملف المستأجر",
    "lease_information": "معلومات عقد الإيجار",
    "pending_approval_requests": "طلبات الموافقة المعلقة",
    "no_pending_requests": "لا توجد طلبات معلقة",
    "manage_account_preferences": "إدارة حسابك وتفضيلاتك",
    "profile_information": "معلومات الملف الشخصي",
    "email_notifications": "إشعارات البريد الإلكتروني",
    "push_notifications": "الإشعارات المنبثقة",
    "automated_reminders": "التذكيرات التلقائية",
    "add_new_reminder": "إضافة تذكير جديد",
    "no_automated_reminders": "لم يتم تكوين تذكيرات تلقائية",
    "tenant": "مستأجر",
    "next_send": "الإرسال التالي",
    "frequency": "التكرار",
    "payments": "المدفوعات",
    "welcome_message": "مرحباً بك في لوحة التحكم",
    "good_morning": "صباح الخير",
    "good_afternoon": "مساء الخير",
    "good_evening": "مساء الخير"
  },
  "hero": {
    "title": "المنصة الشاملة لإدارة العقارات الحديثة",
    "subtitle": "بسّط إدارة عقاراتك مع حلولنا الشاملة",
    "cta_primary": "ابدأ تجربتك المجانية",
    "cta_secondary": "شاهد العرض التوضيحي",
    "trusted_by": "موثوق به من قبل مديري العقارات في جميع أنحاء العالم"
  },
  "property": {
    "add_property": "إضافة عقار",
    "edit_property": "تعديل العقار",
    "property_name": "اسم العقار",
    "property_type": "نوع العقار",
    "apartment": "شقة",
    "house": "منزل",
    "commercial": "تجاري",
    "other": "أخرى",
    "rent_amount": "مبلغ الإيجار",
    "security_deposit": "التأمين",
    "available_units": "الوحدات المتاحة",
    "total_units": "إجمالي الوحدات",
    "loading_properties": "جاري تحميل العقارات...",
    "manage_portfolio": "إدارة محفظة عقاراتك",
    "view": "عرض",
    "edit": "تعديل",
    "no_properties_yet": "لا توجد عقارات بعد",
    "add_first_property": "أضف عقارك الأول",
    "add_new_property": "إضافة عقار جديد",
    "address": "العنوان",
    "city": "المدينة",
    "state": "الولاية",
    "zip_code": "الرمز البريدي",
    "click_to_upload": "انقر لتحميل الصورة",
    "enter_property_name": "أدخل اسم العقار",
    "inactive": "غير نشط",
    "active": "نشط",
    "number_of_units": "عدد الوحدات",
    "property_image": "صورة العقار",
    "save_property": "حفظ العقار",
    "street_address": "عنوان الشارع",
    "units": "وحدات",
    "update_property": "تحديث العقار"
  }
};

// Function to merge translations
function mergeTranslations(baseTranslations, additionalTranslations) {
  const result = { ...baseTranslations };
  
  for (const [key, value] of Object.entries(additionalTranslations)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result[key] = { ...(result[key] || {}), ...value };
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

// Update Bengali translations
const bnPath = path.join(__dirname, 'frontend/src/locales/bn/translation.json');
const currentBn = JSON.parse(fs.readFileSync(bnPath, 'utf8'));
const updatedBn = mergeTranslations(currentBn, bnTranslations);
fs.writeFileSync(bnPath, JSON.stringify(updatedBn, null, 2), 'utf8');

// Update Arabic translations
const arPath = path.join(__dirname, 'frontend/src/locales/ar/translation.json');
const currentAr = JSON.parse(fs.readFileSync(arPath, 'utf8'));
const updatedAr = mergeTranslations(currentAr, arTranslations);
fs.writeFileSync(arPath, JSON.stringify(updatedAr, null, 2), 'utf8');

console.log('Complete translations updated for Bengali and Arabic!');