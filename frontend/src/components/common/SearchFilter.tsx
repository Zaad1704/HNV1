import React, { useState } from 'react';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface SearchFilterProps {
  onSearch: (query: string) => void;
  onFilter: (filters: any) => void;
  filters?: any;
  placeholder?: string;
  filterOptions?: Array<{
    key: string;
    label: string;
    type: 'select' | 'range' | 'checkbox';
    options?: Array<{ value: string; label: string }>;
  }>;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  onSearch,
  onFilter,
  filters = {},
  placeholder,
  filterOptions = []
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState(filters);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilters = () => {
    setActiveFilters({});
    onFilter({});
  };

  const activeFilterCount = Object.keys(activeFilters).filter(key => activeFilters[key]).length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder || t('common.search')}
          className="w-full pl-12 pr-16 py-3 rounded-2xl border border-app-border bg-app-surface"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-colors ${
            showFilters ? 'text-brand-blue bg-brand-blue/10' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <SlidersHorizontal size={16} />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-orange text-white text-xs rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="app-surface rounded-2xl border border-app-border p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-text-primary">{t('common.filter')}</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-brand-blue hover:text-brand-blue/80 flex items-center gap-1"
                >
                  <X size={14} />
                  Clear All
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterOptions.map((option) => (
                <div key={option.key}>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    {option.label}
                  </label>
                  {option.type === 'select' && (
                    <select
                      value={activeFilters[option.key] || ''}
                      onChange={(e) => handleFilterChange(option.key, e.target.value)}
                      className="w-full p-2 rounded-xl border border-app-border bg-app-surface"
                    >
                      <option value="">All</option>
                      {option.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}
                  {option.type === 'checkbox' && (
                    <div className="space-y-2">
                      {option.options?.map((opt) => (
                        <label key={opt.value} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={activeFilters[option.key]?.includes(opt.value) || false}
                            onChange={(e) => {
                              const current = activeFilters[option.key] || [];
                              const newValue = e.target.checked
                                ? [...current, opt.value]
                                : current.filter((v: string) => v !== opt.value);
                              handleFilterChange(option.key, newValue);
                            }}
                            className="rounded"
                          />
                          <span className="text-sm text-text-primary">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchFilter;