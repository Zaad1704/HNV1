// frontend/src/components/landing/ServicesSection.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import { Users, Home, CreditCard } from "lucide-react";

export default function ServicesSection() {
  const { t } = useTranslation();

  const services = [
    {
      icon: <Users width="48" height="48" />,
      title: t('services.tenant_management_title'),
      description: t('services.tenant_management_desc')
    },
    {
      icon: <Home width="48" height="48" />,
      title: t('services.property_tracking_title'),
      description: t('services.property_tracking_desc')
    },
    {
      icon: <CreditCard width="48" height="48" />,
      title: t('services.rent_collection_title'),
      description: t('services.rent_collection_desc')
    }
  ];

  return (
    <section id="services" className="py-16 md:py-24 bg-light-bg"> {/* Changed bg-gray-100 to bg-light-bg */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-dark-text mb-4"> {/* Changed text-indigo-700 to text-dark-text */}
            {t('services.title')}
          </h2>
          <p className="text-lg text-light-text max-w-2xl mx-auto"> {/* Changed text-gray-600 to text-light-text */}
            {t('services.subtitle')}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-light-card p-6 rounded-xl shadow-lg hover:-translate-y-1 hover:shadow-xl transition duration-300"> {/* Changed bg-white to bg-light-card */}
              <div className="text-brand-primary mb-4"> {/* Changed text-indigo-600 to text-brand-primary */}
                {service.icon}
              </div>
              <h3 className="text-xl font-semibold text-dark-text mb-2"> {/* Changed text-gray-800 to text-dark-text */}
                {service.title}
              </h3>
              <p className="text-light-text"> {/* Changed text-gray-600 to text-light-text */}
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
