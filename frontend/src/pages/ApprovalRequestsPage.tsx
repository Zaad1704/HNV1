import React from 'react';
import { motion } from 'framer-motion';
import { CheckSquare } from 'lucide-react';

const ApprovalRequestsPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Approval Requests</h1>
        <p className="text-text-secondary mt-1">Manage pending approvals</p>
      </div>

      <div className="text-center py-16">
        <div className="w-24 h-24 app-gradient rounded-3xl flex items-center justify-center mx-auto mb-6">
          <CheckSquare size={48} className="text-white" />
        </div>
        <h3 className="text-2xl font-bold text-text-primary mb-2">Approvals Coming Soon</h3>
        <p className="text-text-secondary mb-8 max-w-md mx-auto">
          Approval workflow system is being developed.
        </p>
      </div>
    </motion.div>
  );
};

export default ApprovalRequestsPage;