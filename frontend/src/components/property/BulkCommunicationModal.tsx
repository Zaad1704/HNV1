import React, { useState } from 'react';
import { X, Send, MessageSquare, Phone, Mail } from 'lucide-react';

interface BulkCommunicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenants: any[];
  propertyName: string;
}

const BulkCommunicationModal: React.FC<BulkCommunicationModalProps> = ({
  isOpen,
  onClose,
  tenants,
  propertyName
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'email' | 'whatsapp' | 'telegram' | 'sms'>('email');
  const [message, setMessage] = useState('');
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  const communicationMethods = [
    { id: 'email', name: 'Email', icon: Mail, available: true, description: 'Send via email' },
    { id: 'whatsapp', name: 'WhatsApp', icon: MessageSquare, available: true, description: 'Send via WhatsApp Business API' },
    { id: 'telegram', name: 'Telegram', icon: MessageSquare, available: true, description: 'Send via Telegram Bot' },
    { id: 'sms', name: 'SMS', icon: Phone, available: false, description: 'SMS service not configured' }
  ];

  const handleSend = async () => {
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    if (selectedTenants.length === 0) {
      alert('Please select at least one tenant');
      return;
    }

    setSending(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`Message sent via ${selectedMethod} to ${selectedTenants.length} tenant(s)!`);
      onClose();
    } catch (error) {
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const toggleTenant = (tenantId: string) => {
    setSelectedTenants(prev => 
      prev.includes(tenantId) 
        ? prev.filter(id => id !== tenantId)
        : [...prev, tenantId]
    );
  };

  const selectAll = () => {
    setSelectedTenants(tenants.map(t => t._id));
  };

  const clearAll = () => {
    setSelectedTenants([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Bulk Communication</h2>
              <p className="text-sm text-gray-600">{propertyName}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-96">
          <div className="space-y-6">
            {/* Communication Method Selection */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Select Communication Method</h3>
              <div className="grid grid-cols-2 gap-3">
                {communicationMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => method.available && setSelectedMethod(method.id as any)}
                    disabled={!method.available}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      selectedMethod === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : method.available
                        ? 'border-gray-200 hover:border-gray-300'
                        : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <method.icon size={20} className={method.available ? 'text-blue-600' : 'text-gray-400'} />
                      <span className="font-medium">{method.name}</span>
                      {!method.available && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                          Unavailable
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Tenant Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">Select Recipients</h3>
                <div className="flex gap-2">
                  <button
                    onClick={selectAll}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Select All
                  </button>
                  <button
                    onClick={clearAll}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Clear All
                  </button>
                </div>
              </div>
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                {tenants.map((tenant) => (
                  <label
                    key={tenant._id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTenants.includes(tenant._id)}
                      onChange={() => toggleTenant(tenant._id)}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{tenant.name}</div>
                      <div className="text-sm text-gray-600">
                        Unit {tenant.unit} • {tenant.email}
                        {tenant.whatsappNumber && ` • ${tenant.whatsappNumber}`}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {selectedTenants.length} of {tenants.length} tenants selected
              </p>
            </div>

            {/* Message Composition */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Compose Message</h3>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Enter your message for ${propertyName} tenants...`}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>Characters: {message.length}</span>
                <span>Method: {communicationMethods.find(m => m.id === selectedMethod)?.name}</span>
              </div>
            </div>

            {/* Preview */}
            {message && selectedTenants.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
                <div className="text-sm text-gray-700 bg-white p-3 rounded border">
                  {message}
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  This message will be sent to {selectedTenants.length} tenant(s) via {selectedMethod}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !message.trim() || selectedTenants.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Send size={16} />
            {sending ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkCommunicationModal;