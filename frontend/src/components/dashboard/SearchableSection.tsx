import React, { useState } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

interface SearchableSectionProps {
  title: string;
  children: React.ReactNode;
  onSearch?: (query: string) => void;
  onFilter?: (filters: any) => void;
  onExport?: (format: 'csv' | 'pdf') => void;
  searchPlaceholder?: string;
  filterOptions?: Array<{
    key: string;
    label: string;
    type: 'select' | 'date' | 'text';
    options?: Array<{ value: string; label: string }>;
  }>;
}

const SearchableSection: React.FC<SearchableSectionProps> = ({
  title,
  children,
  onSearch,
  onFilter,
  onExport,
  searchPlaceholder,
  filterOptions = []
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [filters, setFilters] = useState<any>({});

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (onFilter) {
      onFilter(newFilters);
    }
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    if (onExport) {
      onExport(format);
    }
    setShowExportMenu(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          
          <div className="flex items-center space-x-3">
            {/* Search */}
            {onSearch && (
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={searchPlaceholder || t('common.search')}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>
            )}

            {/* Filter Button */}
            {filterOptions.length > 0 && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                {t('common.filter')}
              </button>
            )}

            {/* Export Button */}
            {onExport && (
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  {t('common.export')}
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 z-10">
                    <div className="py-1">
                      <button
                        onClick={() => handleExport('csv')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        Export as CSV
                      </button>
                      <button
                        onClick={() => handleExport('pdf')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        Export as PDF
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        {showFilters && filterOptions.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterOptions.map((option) => (
                <div key={option.key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {option.label}
                  </label>
                  {option.type === 'select' && option.options ? (
                    <select
                      value={filters[option.key] || ''}
                      onChange={(e) => handleFilterChange(option.key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white text-sm"
                    >
                      <option value="">All</option>
                      {option.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : option.type === 'date' ? (
                    <input
                      type="date"
                      value={filters[option.key] || ''}
                      onChange={(e) => handleFilterChange(option.key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white text-sm"
                    />
                  ) : (
                    <input
                      type="text"
                      value={filters[option.key] || ''}
                      onChange={(e) => handleFilterChange(option.key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white text-sm"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {children}
      </div>

      {/* Click outside to close menus */}
      {(showExportMenu || showFilters) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setShowExportMenu(false);
            setShowFilters(false);
          }}
        />
      )}
    </div>
  );
};

export default SearchableSection;