import React from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import RoleGuard from '../RoleGuard';

interface MoreMenuModalProps {
    isOpen: boolean;
    onClose: () => void;
    navItems: {
        href?: string;
        action?: () => void;
        icon: React.ElementType;
        label: string;
        roles?: string[];
    }[];
    userRole: string | undefined;
}

const MoreMenuModal: React.FC<MoreMenuModalProps> = ({ isOpen, onClose, navItems, userRole }) => {

    return (
        <>
            {/* Backdrop */}
            <div 
                className={`fixed inset-0 bg-black/60 z-40 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            ></div>
            
            {/* Sliding Panel from the right */}
            <div 
                className={`fixed top-0 right-0 h-full w-4/5 max-w-sm bg-light-card dark:bg-dark-card shadow-lg z-50 transform transition-transform md:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex justify-between items-center p-4 border-b border-border-color dark:border-border-color-dark">
                    <h2 className="text-xl font-bold text-dark-text dark:text-dark-text-dark">More Options</h2>
                    <button onClick={onClose} className="text-light-text dark:text-light-text-dark hover:text-dark-text dark:hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                    {navItems.map(item => (
                        <RoleGuard key={item.label} allowed={item.roles || ['Landlord', 'Agent', 'Tenant', 'Super Admin', 'Super Moderator']}>
                            {item.href ? (
                                <Link
                                    to={item.href}
                                    onClick={onClose}
                                    className="flex items-center space-x-4 p-3 rounded-lg text-dark-text dark:text-dark-text-dark hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors"
                                >
                                    <item.icon size={22} className="text-brand-primary dark:text-brand-secondary" />
                                    <span className="font-semibold">{item.label}</span>
                                </Link>
                            ) : (
                                <button
                                    onClick={() => { item.action?.(); onClose(); }}
                                    className="flex items-center space-x-4 p-3 rounded-lg text-dark-text dark:text-dark-text-dark hover:bg-gray-100 dark:hover:bg-dark-bg w-full text-left transition-colors"
                                >
                                    <item.icon size={22} className="text-brand-primary dark:text-brand-secondary" />
                                    <span className="font-semibold">{item.label}</span>
                                </button>
                            )}
                        </RoleGuard>
                    ))}
                </nav>
            </div>
        </>
    );
};

export default MoreMenuModal;
