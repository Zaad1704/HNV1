// frontend/src/components/common/MoreMenuModal.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { X, DollarSign, Repeat, Users, CreditCard, FileText, Shield, Settings, LogOut, MessageSquare } from 'lucide-react';

interface MoreMenuModalProps {
    isOpen: boolean;
    onClose: () => void;
    navItems: {
        href?: string;
        action?: () => void;
        icon: React.ElementType;
        label: string;
        roles?: string[]; // To indicate if an item is role-guarded
    }[];
    userRole: string | undefined; // Pass current user's role
    handleLogout: () => void; // Pass logout handler
}

const MoreMenuModal: React.FC<MoreMenuModalProps> = ({ isOpen, onClose, navItems, userRole, handleLogout }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-light-bg z-50 flex flex-col animate-slideInFromBottom"> {/* Full screen slide-in */}
            <div className="flex justify-between items-center p-4 border-b border-border-color">
                <h2 className="text-xl font-bold text-dark-text">More Options</h2>
                <button onClick={onClose} className="text-light-text hover:text-dark-text">
                    <X size={24} />
                </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                {navItems.map(item => {
                    // Check if the item is visible based on roles
                    const isVisibleByRole = !item.roles || (userRole && item.roles.includes(userRole));
                    
                    if (isVisibleByRole) {
                        if (item.href) {
                            return (
                                <Link
                                    key={item.label}
                                    to={item.href}
                                    onClick={onClose} // Close modal on navigation
                                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-dark-text hover:bg-gray-100 transition-colors"
                                >
                                    <item.icon size={20} />
                                    <span className="font-semibold">{item.label}</span>
                                </Link>
                            );
                        } else if (item.action) {
                            return (
                                <button
                                    key={item.label}
                                    onClick={() => { item.action?.(); onClose(); handleLogout(); }} // Call action, close modal, then logout
                                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-dark-text hover:bg-gray-100 w-full text-left"
                                >
                                    <item.icon size={20} />
                                    <span className="font-semibold">{item.label}</span>
                                </button>
                            );
                        }
                    }
                    return null; // Don't render if not visible by role
                })}
            </nav>
        </div>
    );
};

export default MoreMenuModal;
