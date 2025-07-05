import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, Search, Book, MessageCircle, Mail, X, Move } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, useDragControls } from 'framer-motion';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FloatingHelpCenter: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragControls = useDragControls();
  const constraintsRef = useRef(null);

  const faqs: FAQItem[] = [
    {
      id: '1',
      question: 'How do I navigate the dashboard?',
      answer: 'The dashboard is your main hub. Use the sidebar on the left to navigate between different sections like Properties, Tenants, Payments, etc. The overview page shows key metrics and quick actions.',
      category: 'dashboard'
    },
    {
      id: '2',
      question: 'How do I add a new property?',
      answer: 'Step 1: Go to Dashboard > Properties. Step 2: Click "Add New Property" button. Step 3: Fill in property details (name, address, type, units). Step 4: Upload property image (optional). Step 5: Click "Save Property".',
      category: 'properties'
    },
    {
      id: '3',
      question: 'How do I add tenants to a property?',
      answer: 'Step 1: Go to Dashboard > Tenants. Step 2: Click "Add Tenant". Step 3: Select the property and unit. Step 4: Enter tenant details (name, email, phone). Step 5: Set lease dates and rent amount. Step 6: Upload ID documents. Step 7: Save tenant.',
      category: 'tenants'
    },
    {
      id: '4',
      question: 'How do I record rent payments?',
      answer: 'Step 1: Go to Dashboard > Payments. Step 2: Click "Record Payment". Step 3: Select tenant from dropdown. Step 4: Enter payment amount and date. Step 5: Choose payment method (Cash, Bank Transfer, etc.). Step 6: Add notes if needed. Step 7: Save payment.',
      category: 'payments'
    },
    {
      id: '5',
      question: 'How do I track expenses?',
      answer: 'Step 1: Go to Dashboard > Expenses. Step 2: Click "Add Expense". Step 3: Select expense category (Maintenance, Insurance, etc.). Step 4: Enter amount and date. Step 5: Add description. Step 6: Upload receipt (optional). Step 7: Save expense.',
      category: 'expenses'
    },
    {
      id: '6',
      question: 'How do I handle maintenance requests?',
      answer: 'Step 1: Go to Dashboard > Maintenance. Step 2: View pending requests. Step 3: Click on a request to see details. Step 4: Update status (In Progress, Completed). Step 5: Add notes about work done. Step 6: Upload photos if needed.',
      category: 'maintenance'
    },
    {
      id: '7',
      question: 'How do I view financial reports?',
      answer: 'Step 1: Go to Dashboard > Overview for quick stats. Step 2: Check the financial charts for revenue vs expenses. Step 3: Use Dashboard > Cash Flow for detailed financial tracking. Step 4: Export data using the export buttons.',
      category: 'reports'
    },
    {
      id: '8',
      question: 'How do I invite users to my organization?',
      answer: 'Step 1: Go to Dashboard > Users & Invites. Step 2: Click "Invite User". Step 3: Enter email address. Step 4: Select role (Agent for staff, Tenant for renters). Step 5: Click "Send Invitation". They will receive an email to join.',
      category: 'users'
    },
    {
      id: '9',
      question: 'How do I change language settings?',
      answer: 'Step 1: Look for the language switcher in the top navigation bar (globe icon). Step 2: Click to open language menu. Step 3: Select your preferred language. Step 4: The interface will update immediately and save your preference.',
      category: 'settings'
    },
    {
      id: '10',
      question: 'How do I set up automated reminders?',
      answer: 'Step 1: Go to Dashboard > Reminders. Step 2: Click "Add New Reminder". Step 3: Choose reminder type (Rent Due, Lease Expiry, etc.). Step 4: Set frequency and timing. Step 5: Select which tenants to include. Step 6: Customize message. Step 7: Activate reminder.',
      category: 'reminders'
    },
    {
      id: '11',
      question: 'How do I manage my account settings?',
      answer: 'Step 1: Go to Dashboard > Settings. Step 2: Update profile information (name, email, phone). Step 3: Change password if needed. Step 4: Set notification preferences. Step 5: Configure organization details. Step 6: Save changes.',
      category: 'settings'
    },
    {
      id: '12',
      question: 'How do I view occupancy rates?',
      answer: 'Step 1: Go to Dashboard > Overview. Step 2: Check the "Occupancy Rate" card showing current percentage. Step 3: Go to Dashboard > Properties to see individual property occupancy. Step 4: Use filters to view specific time periods.',
      category: 'dashboard'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Topics', icon: Book },
    { id: 'dashboard', name: 'Dashboard', icon: HelpCircle },
    { id: 'properties', name: 'Properties', icon: HelpCircle },
    { id: 'tenants', name: 'Tenants', icon: HelpCircle },
    { id: 'payments', name: 'Payments', icon: HelpCircle },
    { id: 'expenses', name: 'Expenses', icon: HelpCircle },
    { id: 'maintenance', name: 'Maintenance', icon: HelpCircle },
    { id: 'reports', name: 'Reports', icon: HelpCircle },
    { id: 'users', name: 'Users', icon: HelpCircle },
    { id: 'settings', name: 'Settings', icon: HelpCircle },
    { id: 'reminders', name: 'Reminders', icon: HelpCircle }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    // Set initial position to bottom right
    setPosition({ x: window.innerWidth - 100, y: window.innerHeight - 100 });
  }, []);

  if (!isOpen) {
    return (
      <motion.div
        ref={constraintsRef}
        className="fixed inset-0 pointer-events-none z-40"
      >
        <motion.button
          drag
          dragControls={dragControls}
          dragConstraints={constraintsRef}
          dragElastic={0.1}
          whileDrag={{ scale: 1.1 }}
          onClick={() => setIsOpen(true)}
          className="absolute bg-brand-blue text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 pointer-events-auto cursor-move"
          style={{ 
            left: position.x - 32, 
            top: position.y - 32,
            touchAction: 'none'
          }}
          onDragEnd={(event, info) => {
            setPosition({
              x: Math.max(32, Math.min(window.innerWidth - 32, position.x + info.offset.x)),
              y: Math.max(32, Math.min(window.innerHeight - 32, position.y + info.offset.y))
            });
          }}
          aria-label="Open help center (draggable)"
        >
          <HelpCircle size={24} />
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-app-surface rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-app-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center">
              <HelpCircle size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Help Center</h2>
              <p className="text-text-secondary">Step-by-step guides for everything</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full hover:bg-app-bg transition-colors"
            aria-label="Close help center"
          >
            <X size={20} className="text-text-secondary" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-64 border-r border-app-border p-4 overflow-y-auto">
            <div className="space-y-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-colors ${
                    activeCategory === category.id
                      ? 'bg-brand-blue text-white'
                      : 'text-text-secondary hover:bg-app-bg'
                  }`}
                >
                  <category.icon size={16} />
                  {category.name}
                </button>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-app-border">
              <h3 className="font-semibold text-text-primary mb-3">Need More Help?</h3>
              <div className="space-y-2">
                <a
                  href="mailto:support@hnv.com"
                  className="flex items-center gap-2 text-sm text-text-secondary hover:text-brand-blue transition-colors"
                >
                  <Mail size={14} />
                  Email Support
                </a>
                <a
                  href="#"
                  className="flex items-center gap-2 text-sm text-text-secondary hover:text-brand-blue transition-colors"
                >
                  <MessageCircle size={14} />
                  Live Chat
                </a>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Search */}
            <div className="relative mb-6">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-app-border rounded-2xl bg-app-bg focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all"
              />
            </div>

            {/* FAQ List */}
            <div className="space-y-4">
              {filteredFAQs.length === 0 ? (
                <div className="text-center py-12">
                  <HelpCircle size={48} className="text-text-muted mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-text-primary mb-2">No results found</h3>
                  <p className="text-text-secondary">Try adjusting your search or browse by category</p>
                </div>
              ) : (
                filteredFAQs.map(faq => (
                  <div key={faq.id} className="border border-app-border rounded-2xl p-6 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-text-primary mb-3 text-lg">{faq.question}</h3>
                    <div className="text-text-secondary leading-relaxed">
                      {faq.answer.split('. ').map((step, index) => {
                        if (step.startsWith('Step ')) {
                          return (
                            <div key={index} className="mb-2">
                              <span className="font-medium text-brand-blue">{step.split(':')[0]}:</span>
                              <span className="ml-1">{step.split(':').slice(1).join(':')}</span>
                            </div>
                          );
                        }
                        return <p key={index} className="mb-2">{step}{index < faq.answer.split('. ').length - 1 ? '.' : ''}</p>;
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FloatingHelpCenter;