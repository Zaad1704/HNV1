import React from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

const AuditLogPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Audit Log</h1>
        <p className="text-text-secondary mt-1">View system activity and changes</p>
      </div>

      <div className="text-center py-16">
        <div className="w-24 h-24 app-gradient rounded-3xl flex items-center justify-center mx-auto mb-6">
          <FileText size={48} className="text-white" />
        </div>
        <h3 className="text-2xl font-bold text-text-primary mb-2">Audit Log Coming Soon</h3>
        <p className="text-text-secondary mb-8 max-w-md mx-auto">
          Activity tracking and audit log features are being developed.
        </p>
      </div>
    </motion.div>
  );
};

export default AuditLogPage;