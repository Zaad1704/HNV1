// frontend/src/components/common/MoreMenuModal.tsx
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
    handleLogout: () => void;
}

const MoreMenuModal: React.FC<MoreMenuModalProps> = ({ isOpen, onClose, navItems, userRole, handleLogout }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-light-bg z-50 flex flex-col md:hidden">
            <div className="flex justify-between items-center p-4 border-b border-border-color">
                <h2 className="text-xl font-bold text-dark-text">More Options</h2>
                <button onClick={onClose} className="text-light-text hover:text-dark-text">
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
                                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-dark-text hover:bg-brand-secondary transition-colors"
                            >
                                <item.icon size={20} />
                                <span className="font-semibold">{item.label}</span>
                            </Link>
                        ) : (
                            <button
                                onClick={() => { item.action?.(); onClose(); }}
                                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-dark-text hover:bg-brand-secondary w-full text-left"
                            >
                                <item.icon size={20} />
                                <span className="font-semibold">{item.label}</span>
                            </button>
                        )}
                    </RoleGuard>
                ))}
            </nav>
        </div>
    );
};

export default MoreMenuModal;
