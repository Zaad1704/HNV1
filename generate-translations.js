const fs = require('fs');
const path = require('path');

// Translation mappings for each language
const translations = {
  // Bengali translations
  bn: {
    "app_name": "HNV সম্পত্তি ব্যবস্থাপনা সমাধান",
    "app_name_short": "HNV সমাধান",
    "header": {
      "login": "লগইন",
      "get_started": "শুরু করুন"
    },
    "nav": {
      "home": "হোম",
      "about": "সম্পর্কে",
      "features": "বৈশিষ্ট্য",
      "services": "সেবা",
      "pricing": "মূল্য",
      "contact": "যোগাযোগ",
      "login": "লগইন",
      "dashboard": "ড্যাশবোর্ড"
    },
    "auth": {
      "welcome_back": "স্বাগতম!",
      "sign_in_subtitle": "আপনার ড্যাশবোর্ডে যেতে সাইন ইন করুন",
      "email_address": "ইমেইল ঠিকানা",
      "password": "পাসওয়ার্ড",
      "sign_in": "সাইন ইন",
      "continue_google": "গুগল দিয়ে চালিয়ে যান",
      "no_account": "কোন অ্যাকাউন্ট নেই?",
      "sign_up": "সাইন আপ",
      "or": "অথবা",
      "forgot_password": "পাসওয়ার্ড ভুলে গেছেন?",
      "enter_email": "আপনার ইমেইল ঠিকানা লিখুন",
      "enter_password": "আপনার পাসওয়ার্ড লিখুন",
      "remember_me": "আমাকে মনে রাখুন",
      "create_account": "অ্যাকাউন্ট তৈরি করুন",
      "full_name": "পূর্ণ নাম",
      "confirm_password": "পাসওয়ার্ড নিশ্চিত করুন",
      "agree_terms": "আমি সেবার শর্তাবলী এবং গোপনীয়তা নীতিতে সম্মত",
      "agent": "এজেন্ট",
      "check_email": "যাচাইকরণ লিঙ্কের জন্য আপনার ইমেইল চেক করুন",
      "create_password": "একটি শক্তিশালী পাসওয়ার্ড তৈরি করুন",
      "enter_full_name": "আপনার পূর্ণ নাম লিখুন",
      "go_to_login": "লগইনে যান",
      "have_account": "ইতিমধ্যে একটি অ্যাকাউন্ট আছে?",
      "join_thousands": "হাজার হাজার সম্পত্তি ব্যবস্থাপকদের সাথে যোগ দিন",
      "landlord": "বাড়িওয়ালা",
      "role": "ভূমিকা",
      "tenant": "ভাড়াটিয়া",
      "verification_sent": "যাচাইকরণ ইমেইল পাঠানো হয়েছে"
    },
    "common": {
      "loading": "লোড হচ্ছে...",
      "error": "ত্রুটি",
      "success": "সফল",
      "cancel": "বাতিল",
      "save": "সংরক্ষণ",
      "edit": "সম্পাদনা",
      "delete": "মুছুন",
      "add": "যোগ করুন",
      "view": "দেখুন",
      "close": "বন্ধ",
      "confirm": "নিশ্চিত",
      "yes": "হ্যাঁ",
      "no": "না",
      "welcome_back_user": "স্বাগতম, {{name}}!",
      "happening_today": "আজ আপনার সম্পত্তিগুলির সাথে কী ঘটছে তা এখানে।",
      "learn_more": "আরও জানুন",
      "analytics": "বিশ্লেষণ",
      "payments": "পেমেন্ট",
      "actions": "কর্ম",
      "status": "অবস্থা",
      "name": "নাম",
      "email": "ইমেইল",
      "phone": "ফোন",
      "address": "ঠিকানা",
      "city": "শহর",
      "state": "রাজ্য",
      "zip_code": "জিপ কোড",
      "country": "দেশ",
      "date": "তারিখ",
      "amount": "পরিমাণ",
      "description": "বিবরণ",
      "type": "ধরন",
      "active": "সক্রিয়",
      "inactive": "নিষ্ক্রিয়",
      "pending": "অপেক্ষমাণ",
      "approved": "অনুমোদিত",
      "rejected": "প্রত্যাখ্যাত",
      "all_languages": "সব ভাষা",
      "theme": "থিম",
      "language": "ভাষা",
      "notifications": "বিজ্ঞপ্তি",
      "profile": "প্রোফাইল",
      "settings": "সেটিংস",
      "search": "অনুসন্ধান...",
      "search_placeholder": "সম্পত্তি, ভাড়াটিয়া, পেমেন্ট অনুসন্ধান করুন...",
      "filter": "ফিল্টার",
      "clear_all": "সব পরিষ্কার",
      "all": "সব",
      "more_options": "আরও বিকল্প",
      "quick_links": "দ্রুত লিঙ্ক",
      "legal": "আইনি",
      "about": "সম্পর্কে",
      "features": "বৈশিষ্ট্য",
      "privacy_policy": "গোপনীয়তা নীতি",
      "terms_of_service": "সেবার শর্তাবলী",
      "property_management": "সম্পত্তি ব্যবস্থাপনা",
      "change_language": "ভাষা পরিবর্তন",
      "select_language": "ভাষা নির্বাচন",
      "toggle_language": "ভাষা টগল",
      "switch_to": "পরিবর্তন করুন",
      "current_language": "বর্তমান ভাষা",
      "start_date": "শুরুর তারিখ",
      "end_date": "শেষ তারিখ"
    }
  },

  // Arabic translations
  ar: {
    "app_name": "حلول إدارة العقارات HNV",
    "app_name_short": "حلول HNV",
    "header": {
      "login": "تسجيل الدخول",
      "get_started": "ابدأ الآن"
    },
    "nav": {
      "home": "الرئيسية",
      "about": "حول",
      "features": "المميزات",
      "services": "الخدمات",
      "pricing": "الأسعار",
      "contact": "اتصل بنا",
      "login": "تسجيل الدخول",
      "dashboard": "لوحة التحكم"
    },
    "auth": {
      "welcome_back": "مرحباً بعودتك!",
      "sign_in_subtitle": "سجل دخولك للمتابعة إلى لوحة التحكم",
      "email_address": "عنوان البريد الإلكتروني",
      "password": "كلمة المرور",
      "sign_in": "تسجيل الدخول",
      "continue_google": "المتابعة مع جوجل",
      "no_account": "ليس لديك حساب؟",
      "sign_up": "إنشاء حساب",
      "or": "أو",
      "forgot_password": "نسيت كلمة المرور؟",
      "enter_email": "أدخل عنوان بريدك الإلكتروني",
      "enter_password": "أدخل كلمة المرور",
      "remember_me": "تذكرني",
      "create_account": "إنشاء حساب",
      "full_name": "الاسم الكامل",
      "confirm_password": "تأكيد كلمة المرور",
      "agree_terms": "أوافق على شروط الخدمة وسياسة الخصوصية",
      "agent": "وكيل",
      "check_email": "تحقق من بريدك الإلكتروني للحصول على رابط التحقق",
      "create_password": "إنشاء كلمة مرور قوية",
      "enter_full_name": "أدخل اسمك الكامل",
      "go_to_login": "الذهاب لتسجيل الدخول",
      "have_account": "لديك حساب بالفعل؟",
      "join_thousands": "انضم إلى آلاف مديري العقارات",
      "landlord": "مالك العقار",
      "role": "الدور",
      "tenant": "مستأجر",
      "verification_sent": "تم إرسال بريد التحقق"
    },
    "common": {
      "loading": "جاري التحميل...",
      "error": "خطأ",
      "success": "نجح",
      "cancel": "إلغاء",
      "save": "حفظ",
      "edit": "تعديل",
      "delete": "حذف",
      "add": "إضافة",
      "view": "عرض",
      "close": "إغلاق",
      "confirm": "تأكيد",
      "yes": "نعم",
      "no": "لا",
      "welcome_back_user": "مرحباً بعودتك، {{name}}!",
      "happening_today": "إليك ما يحدث مع عقاراتك اليوم.",
      "learn_more": "تعلم المزيد",
      "analytics": "التحليلات",
      "payments": "المدفوعات",
      "actions": "الإجراءات",
      "status": "الحالة",
      "name": "الاسم",
      "email": "البريد الإلكتروني",
      "phone": "الهاتف",
      "address": "العنوان",
      "city": "المدينة",
      "state": "الولاية",
      "zip_code": "الرمز البريدي",
      "country": "البلد",
      "date": "التاريخ",
      "amount": "المبلغ",
      "description": "الوصف",
      "type": "النوع",
      "active": "نشط",
      "inactive": "غير نشط",
      "pending": "معلق",
      "approved": "موافق عليه",
      "rejected": "مرفوض",
      "all_languages": "جميع اللغات",
      "theme": "المظهر",
      "language": "اللغة",
      "notifications": "الإشعارات",
      "profile": "الملف الشخصي",
      "settings": "الإعدادات",
      "search": "بحث...",
      "search_placeholder": "البحث في العقارات والمستأجرين والمدفوعات...",
      "filter": "المرشحات",
      "clear_all": "مسح الكل",
      "all": "الكل",
      "more_options": "المزيد من الخيارات",
      "quick_links": "روابط سريعة",
      "legal": "قانوني",
      "about": "حول",
      "features": "المميزات",
      "privacy_policy": "سياسة الخصوصية",
      "terms_of_service": "شروط الخدمة",
      "property_management": "إدارة العقارات",
      "change_language": "تغيير اللغة",
      "select_language": "اختر اللغة",
      "toggle_language": "تبديل اللغة",
      "switch_to": "التبديل إلى",
      "current_language": "اللغة الحالية",
      "start_date": "تاريخ البداية",
      "end_date": "تاريخ النهاية"
    }
  }
};

// Get English template
const enPath = path.join(__dirname, 'frontend/src/locales/en/translation.json');
const enTemplate = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// Function to recursively translate object
function translateObject(obj, translations, fallback = obj) {
  const result = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      result[key] = translateObject(value, translations[key] || {}, value);
    } else {
      result[key] = translations[key] || fallback[key] || value;
    }
  }
  
  return result;
}

// Generate translations for each language
const languageCodes = ['bn', 'ar', 'zh', 'ja', 'ko', 'hi', 'th', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'nl', 'sv', 'tr', 'vi', 'id', 'ms', 'tl', 'ur', 'sw', 'am', 'ha', 'yo', 'zu', 'af', 'pt-BR', 'es-MX', 'es-AR', 'fr-CA', 'en-AU', 'en-NZ', 'no', 'da', 'fi', 'pl', 'el'];

languageCodes.forEach(langCode => {
  const langPath = path.join(__dirname, `frontend/src/locales/${langCode}/translation.json`);
  
  let translatedContent;
  if (translations[langCode]) {
    // Use provided translations
    translatedContent = translateObject(enTemplate, translations[langCode], enTemplate);
  } else {
    // Keep English for now (will be translated later)
    translatedContent = enTemplate;
  }
  
  // Write the file
  fs.writeFileSync(langPath, JSON.stringify(translatedContent, null, 2), 'utf8');
  console.log(`Generated translation for ${langCode}`);
});

console.log('Translation generation completed!');