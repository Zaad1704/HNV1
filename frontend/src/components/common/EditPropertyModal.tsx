import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface EditPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: any;
  onPropertyUpdated: (property: any) => void;
}

const EditPropertyModal: React.FC<EditPropertyModalProps> = ({ 
  isOpen, 
  onClose, 
  property, 
  onPropertyUpdated 
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    numberOfUnits: 1,
  });

  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name || '',
        street: property.address?.street || '',
        city: property.address?.city || '',
        state: property.address?.state || '',
        zipCode: property.address?.zipCode || '',
        numberOfUnits: property.numberOfUnits || 1,
      });
    }
  }, [property]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPropertyUpdated({
      ...property,
      ...formData,
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
      }
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="app-surface rounded-3xl shadow-app-xl w-full max-w-lg border border-app-border"
          >
            <div className="flex justify-between items-center p-6 border-b border-app-border">
              <h2 className="text-xl font-bold text-text-primary">{t('property.edit_property')}</h2>
              <button onClick={onClose} className="p-2 rounded-full text-text-secondary hover:text-text-primary">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{t('property.property_name')}</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{t('common.address')}</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    name="street"
                    placeholder={t('forms.street_address')}
                    value={formData.street}
                    onChange={handleChange}
                    className="sm:col-span-2"
                  />
                  <input
                    name="city"
                    placeholder={t('common.city')}
                    value={formData.city}
                    onChange={handleChange}
                  />
                  <input
                    name="state"
                    placeholder={t('common.state')}
                    value={formData.state}
                    onChange={handleChange}
                  />
                  <input
                    name="zipCode"
                    placeholder={t('common.zip_code')}
                    value={formData.zipCode}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{t('property.number_of_units')}</label>
                <input
                  type="number"
                  min="1"
                  name="numberOfUnits"
                  value={formData.numberOfUnits}
                  onChange={handleChange}
                  required
                  className="w-full"
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 rounded-2xl border border-app-border text-text-secondary hover:text-text-primary"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="btn-gradient px-6 py-3 rounded-2xl flex items-center gap-2"
                >
                  <Save size={16} />
                  {t('property.update_property')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EditPropertyModal;