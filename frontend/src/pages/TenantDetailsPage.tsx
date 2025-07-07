import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, DollarSign, Download, Users, CreditCard } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';

const fetchTenantDetails = async (tenantId: string) => {
  const { data } = await apiClient.get(`/tenants/${tenantId}`);
  return data.data;
};

const TenantDetailsPage = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const { user } = useAuthStore();
  
  const { data: tenant, isLoading, error } = useQuery({
    queryKey: ['tenant', tenantId],
    queryFn: () => fetchTenantDetails(tenantId!),
    enabled: !!tenantId
  });

  const handleDownloadPDF = () => {
    if (!tenant) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const organizationName = user?.organization?.name || user?.name + "'s Organization" || "Your Organization";
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tenant Details - ${tenant.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .footer { text-align: center; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; font-style: italic; }
            .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
            .section h3 { margin-top: 0; color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .field { margin-bottom: 10px; }
            .field strong { display: inline-block; width: 150px; color: #555; }
            .image-section { text-align: center; margin: 20px 0; }
            .image-placeholder { width: 150px; height: 150px; border: 2px dashed #ccc; display: inline-block; margin: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${organizationName}</h1>
            <h2>Tenant Details</h2>
            <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            <p><strong>Powered by HNV Property Management Solutions</strong></p>
          </div>
          
          <div class="section">
            <h3>Basic Information</h3>
            <div class="grid">
              <div class="field"><strong>Name:</strong> ${tenant.name || 'N/A'}</div>
              <div class="field"><strong>Email:</strong> ${tenant.email || 'N/A'}</div>
              <div class="field"><strong>Phone:</strong> ${tenant.phone || 'N/A'}</div>
              <div class="field"><strong>WhatsApp:</strong> ${tenant.whatsappNumber || tenant.phone || 'N/A'}</div>
              <div class="field"><strong>Status:</strong> ${tenant.status || 'N/A'}</div>
              <div class="field"><strong>Unit:</strong> ${tenant.unit || 'N/A'}</div>
            </div>
          </div>
          
          <div class="section">
            <h3>Property & Financial Details</h3>
            <div class="grid">
              <div class="field"><strong>Property:</strong> ${tenant.propertyId?.name || 'N/A'}</div>
              <div class="field"><strong>Monthly Rent:</strong> $${tenant.rentAmount || 0}</div>
              <div class="field"><strong>Security Deposit:</strong> $${tenant.securityDeposit || 0}</div>
              <div class="field"><strong>Lease End:</strong> ${tenant.leaseEndDate ? new Date(tenant.leaseEndDate).toLocaleDateString() : 'N/A'}</div>
            </div>
          </div>
          
          <div class="section">
            <h3>Personal Details</h3>
            <div class="grid">
              <div class="field"><strong>Father's Name:</strong> ${tenant.fatherName || 'N/A'}</div>
              <div class="field"><strong>Mother's Name:</strong> ${tenant.motherName || 'N/A'}</div>
              <div class="field"><strong>Govt ID Number:</strong> ${tenant.govtIdNumber || 'N/A'}</div>
              <div class="field"><strong>Number of Occupants:</strong> ${tenant.numberOfOccupants || 1}</div>
            </div>
            <div class="field"><strong>Present Address:</strong> ${tenant.presentAddress || 'N/A'}</div>
            <div class="field"><strong>Permanent Address:</strong> ${tenant.permanentAddress || 'N/A'}</div>
          </div>
          
          ${tenant.referenceName ? `
          <div class="section">
            <h3>Reference Details</h3>
            <div class="grid">
              <div class="field"><strong>Name:</strong> ${tenant.referenceName}</div>
              <div class="field"><strong>Phone:</strong> ${tenant.referencePhone || 'N/A'}</div>
              <div class="field"><strong>Email:</strong> ${tenant.referenceEmail || 'N/A'}</div>
              <div class="field"><strong>Relation:</strong> ${tenant.referenceRelation || 'N/A'}</div>
            </div>
          </div>
          ` : ''}
          
          ${tenant.additionalAdults?.length > 0 ? `
          <div class="section">
            <h3>Additional Adults</h3>
            ${tenant.additionalAdults.map((adult: any, index: number) => `
              <div style="margin-bottom: 15px; padding: 10px; background: #f9f9f9; border-radius: 5px;">
                <strong>Adult ${index + 1}:</strong><br>
                Name: ${adult.name || 'N/A'}<br>
                Phone: ${adult.phone || 'N/A'}<br>
                Govt ID: ${adult.govtIdNumber || 'N/A'}<br>
                Relation: ${adult.relation || 'N/A'}
              </div>
            `).join('')}
          </div>
          ` : ''}
          
          <div class="image-section">
            <h3>Images</h3>
            <p>Tenant Photo, Government ID (Front & Back)</p>
            <div class="image-placeholder">Tenant Photo</div>
            <div class="image-placeholder">ID Front</div>
            <div class="image-placeholder">ID Back</div>
            <p><em>Images are stored securely and available in the digital system</em></p>
          </div>
          
          <div class="footer">
            <p>Report generated by HNV Property Management Solutions</p>
            <p style="font-size: 12px; color: #888;">© ${new Date().getFullYear()} HNV Property Management Solutions. All rights reserved.</p>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 app-gradient rounded-full animate-pulse"></div>
        <span className="ml-3 text-text-secondary">Loading tenant details...</span>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-bold text-text-primary mb-2">Tenant Not Found</h3>
        <p className="text-text-secondary mb-4">The tenant you're looking for doesn't exist.</p>
        <Link
          to="/dashboard/tenants"
          className="btn-gradient px-6 py-3 rounded-2xl font-semibold inline-flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          Back to Tenants
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard/tenants"
            className="p-2 rounded-xl hover:bg-app-bg transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">{tenant.name}</h1>
            <p className="text-text-secondary">Tenant Details</p>
          </div>
        </div>
        <button 
          onClick={handleDownloadPDF}
          className="btn-gradient px-6 py-3 rounded-2xl flex items-center gap-2 font-semibold"
        >
          <Download size={20} />
          Download PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="app-surface rounded-3xl p-8 border border-app-border">
            <h2 className="text-xl font-bold text-text-primary mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-text-muted" />
                <div>
                  <p className="text-sm text-text-secondary">Email</p>
                  <p className="font-medium text-text-primary">{tenant.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-text-muted" />
                <div>
                  <p className="text-sm text-text-secondary">Phone</p>
                  <p className="font-medium text-text-primary">{tenant.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-text-muted" />
                <div>
                  <p className="text-sm text-text-secondary">Unit</p>
                  <p className="font-medium text-text-primary">{tenant.unit}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign size={16} className="text-text-muted" />
                <div>
                  <p className="text-sm text-text-secondary">Monthly Rent</p>
                  <p className="font-medium text-text-primary">${tenant.rentAmount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Details */}
          <div className="app-surface rounded-3xl p-8 border border-app-border">
            <h2 className="text-xl font-bold text-text-primary mb-6">Personal Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-text-secondary">Father's Name</p>
                  <p className="font-medium text-text-primary">{tenant.fatherName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Mother's Name</p>
                  <p className="font-medium text-text-primary">{tenant.motherName || 'N/A'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Present Address</p>
                <p className="font-medium text-text-primary">{tenant.presentAddress || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Permanent Address</p>
                <p className="font-medium text-text-primary">{tenant.permanentAddress || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Government ID Number</p>
                <p className="font-medium text-text-primary">{tenant.govtIdNumber || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Additional Adults */}
          {tenant.additionalAdults?.length > 0 && (
            <div className="app-surface rounded-3xl p-8 border border-app-border">
              <h2 className="text-xl font-bold text-text-primary mb-6">Additional Adults</h2>
              <div className="space-y-4">
                {tenant.additionalAdults.map((adult: any, index: number) => (
                  <div key={index} className="p-4 bg-app-bg rounded-2xl">
                    <h3 className="font-semibold text-text-primary mb-3">Adult {index + 1}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-text-secondary">Name: </span>
                        <span className="font-medium">{adult.name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-text-secondary">Phone: </span>
                        <span className="font-medium">{adult.phone || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-text-secondary">Govt ID: </span>
                        <span className="font-medium">{adult.govtIdNumber || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-text-secondary">Relation: </span>
                        <span className="font-medium">{adult.relation || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="app-surface rounded-3xl p-6 border border-app-border">
            <h3 className="text-lg font-bold text-text-primary mb-4">Status</h3>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              tenant.status === 'Active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {tenant.status}
            </span>
          </div>

          {/* Property Info */}
          <div className="app-surface rounded-3xl p-6 border border-app-border">
            <h3 className="text-lg font-bold text-text-primary mb-4">Property Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-text-secondary">Property</p>
                <p className="font-medium text-text-primary">{tenant.propertyId?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Lease End Date</p>
                <p className="font-medium text-text-primary">
                  {tenant.leaseEndDate ? new Date(tenant.leaseEndDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              {tenant.securityDeposit && (
                <div>
                  <p className="text-sm text-text-secondary">Security Deposit</p>
                  <p className="font-medium text-text-primary">${tenant.securityDeposit}</p>
                </div>
              )}
            </div>
          </div>

          {/* Reference Info */}
          {tenant.referenceName && (
            <div className="app-surface rounded-3xl p-6 border border-app-border">
              <h3 className="text-lg font-bold text-text-primary mb-4">Reference</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-text-secondary">Name</p>
                  <p className="font-medium text-text-primary">{tenant.referenceName}</p>
                </div>
                {tenant.referencePhone && (
                  <div>
                    <p className="text-sm text-text-secondary">Phone</p>
                    <p className="font-medium text-text-primary">{tenant.referencePhone}</p>
                  </div>
                )}
                {tenant.referenceRelation && (
                  <div>
                    <p className="text-sm text-text-secondary">Relation</p>
                    <p className="font-medium text-text-primary">{tenant.referenceRelation}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Images */}
          <div className="app-surface rounded-3xl p-6 border border-app-border">
            <h3 className="text-lg font-bold text-text-primary mb-4">Documents</h3>
            <div className="space-y-3">
              <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <User size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Tenant Photo</p>
              </div>
              <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <CreditCard size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Government ID</p>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Images are stored securely in the system
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TenantDetailsPage;