# Property & Tenant Pages - Comprehensive Analysis

## Table of Contents
1. [System Overview](#system-overview)
2. [Data Models & Relationships](#data-models--relationships)
3. [Page Architecture](#page-architecture)
4. [Component Structure](#component-structure)
5. [Data Flow & State Management](#data-flow--state-management)
6. [UI/UX Design Patterns](#uiux-design-patterns)
7. [Filtering & Search System](#filtering--search-system)
8. [Cross-Data Integration](#cross-data-integration)
9. [Performance Optimizations](#performance-optimizations)
10. [Mobile Responsiveness](#mobile-responsiveness)
11. [Security & Authorization](#security--authorization)
12. [API Integration](#api-integration)

---

## System Overview

The HNV1 property management system features two primary entity management pages: **Properties** and **Tenants**. These pages form the core of the rental management workflow, providing comprehensive CRUD operations, advanced filtering, analytics, and cross-entity relationships.

### Key Features
- **Multi-tenant Organization Support**: All data is scoped to organizations
- **Real-time Data Synchronization**: Using React Query for caching and updates
- **Advanced Search & Filtering**: Multiple filter types with predictive search
- **Bulk Operations**: Mass actions on selected items
- **Mobile-First Design**: Responsive layouts with touch-optimized interactions
- **Cross-Entity Relationships**: Properties ↔ Tenants ↔ Payments ↔ Maintenance

---

## Data Models & Relationships

### Property Model (Backend)
```typescript
interface IProperty {
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    formattedAddress?: string;
  };
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  numberOfUnits: number;
  totalUnits?: number;
  rentAmount?: number;
  organizationId: Schema.Types.ObjectId;
  createdBy: Schema.Types.ObjectId;
  managedByAgentId?: Schema.Types.ObjectId;
  status: 'Active' | 'Inactive' | 'Under Renovation' | 'Archived';
  occupancyRate?: number;
  cashFlow?: {
    income: number;
    expenses: number;
  };
  maintenanceStatus?: string;
  imageUrl?: string;
  propertyType?: string;
  description?: string;
  createdAt: Date;
}
```

### Tenant Model (Backend)
```typescript
interface ITenant {
  name: string;
  email: string;
  phone?: string;
  whatsappNumber?: string;
  propertyId?: Schema.Types.ObjectId;
  organizationId: Schema.Types.ObjectId;
  createdBy?: Schema.Types.ObjectId;
  unit: string;
  unitNickname?: string;
  status: 'Active' | 'Inactive' | 'Late' | 'Archived';
  leaseStartDate?: Date;
  leaseEndDate?: Date;
  leaseDuration?: number;
  rentAmount: number;
  securityDeposit?: number;
  advanceRent?: number;
  imageUrl?: string;
  tenantImage?: string;
  govtIdNumber?: string;
  govtIdFront?: string;
  govtIdBack?: string;
  fatherName?: string;
  motherName?: string;
  presentAddress?: string;
  permanentAddress?: string;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relation?: string;
  };
  occupation?: string;
  monthlyIncome?: number;
  previousAddress?: string;
  reasonForMoving?: string;
  petDetails?: string;
  vehicleDetails?: string;
  specialInstructions?: string;
  numberOfOccupants?: number;
  reference?: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    relation?: string;
    govtIdNumber?: string;
  };
  additionalAdults: Array<{
    name?: string;
    phone?: string;
    fatherName?: string;
    motherName?: string;
    permanentAddress?: string;
    govtIdNumber?: string;
    govtIdImageUrl?: string;
    imageUrl?: string;
  }>;
  discountAmount: number;
  discountExpiresAt?: Date;
  documents?: Array<{
    url: string;
    filename: string;
    description: string;
    uploadedAt: Date;
  }>;
  uploadedImages?: Array<{
    url: string;
    description: string;
    uploadedAt: Date;
  }>;
  lastRentIncrease?: {
    date: Date;
    oldAmount: number;
    newAmount: number;
    type: 'percentage' | 'fixed';
    value: number;
    reason: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Relationship Mapping
```
Organization (1) ←→ (N) Properties
Organization (1) ←→ (N) Tenants
Property (1) ←→ (N) Tenants
Property (1) ←→ (N) Units
Tenant (1) ←→ (N) Payments
Tenant (1) ←→ (N) MaintenanceRequests
Property (1) ←→ (N) Expenses
Property (1) ←→ (N) MaintenanceRequests
```

---

## Page Architecture

### Properties Page Structure
```
PropertiesPage/
├── Desktop Layout
│   ├── UniversalHeader (stats, actions)
│   ├── Phase3DesktopLayout
│   │   ├── MainContent
│   │   │   ├── UniversalSearch
│   │   │   ├── SearchFilter (legacy)
│   │   │   └── PropertiesGrid
│   │   │       └── EnhancedPropertyCard[]
│   │   └── Phase3RightSidebar
│   │       ├── SmartFilters
│   │       └── AIInsights
│   └── Modals
│       ├── AddPropertyModal
│       ├── EditPropertyModal
│       ├── BulkPaymentModal
│       ├── BulkLeaseActions
│       └── UniversalExport
└── Mobile Layout
    ├── Phase3MobileHeader
    ├── Phase3TabFilters
    ├── PropertiesGrid
    └── Phase3BottomSheet
```

### Tenants Page Structure
```
TenantsPage/
├── Desktop Layout
│   ├── UniversalHeader (stats, actions)
│   ├── Phase3DesktopLayout
│   │   ├── MainContent
│   │   │   ├── TenantPredictiveSearch
│   │   │   ├── TenantAdvancedSearch
│   │   │   └── TenantsGrid
│   │   │       └── EnhancedTenantCard[]
│   │   └── Phase3RightSidebar
│   │       ├── TenantSmartFilters
│   │       └── TenantInsightsPanel
│   └── Modals
│       ├── ComprehensiveTenantModal
│       ├── QuickPaymentModal
│       ├── MonthlyCollectionSheet
│       └── UniversalExport
└── Mobile Layout
    ├── Phase3MobileHeader
    ├── Phase3TabFilters
    ├── TenantsGrid
    └── Phase3BottomSheet
```

### Detail Pages Structure
```
PropertyDetailsPage/
├── MobileHeader (sticky)
│   ├── BackButton
│   ├── PropertyName
│   └── EditButton
├── DesktopHeader
│   ├── BackButton + PropertyName + Address
│   └── EditPropertyButton
├── MainContent (lg:col-span-3)
│   ├── PropertyAnalyticsDashboard
│   │   ├── FinancialMetrics (revenue, expenses, profit)
│   │   ├── OccupancyAnalytics (rates, trends)
│   │   ├── MaintenanceOverview (open/closed requests)
│   │   └── PerformanceCharts (monthly data)
│   ├── RelatedDataSections
│   │   ├── PaymentsPreview (recent 5 payments)
│   │   ├── ReceiptsPreview (recent 5 receipts)
│   │   ├── ExpensesPreview (property expenses)
│   │   ├── MaintenancePreview (recent requests)
│   │   ├── RemindersPreview (active reminders)
│   │   ├── ApprovalsPreview (pending approvals)
│   │   └── AuditLogsPreview (recent activity)
│   └── EnhancedUnitsGrid
│       ├── UnitCards (with tenant info)
│       ├── VacantUnitCards (add tenant CTA)
│       ├── UnitNicknameManagement
│       └── UnitDataModal (payments, maintenance per unit)
└── Sidebar (lg:col-span-1)
    └── EnhancedPropertyQuickActions
        ├── PropertyStats (occupancy, revenue)
        ├── QuickActions
        │   ├── AddTenant
        │   ├── RentIncrease
        │   ├── CollectionSheet
        │   ├── ScheduleMaintenance
        │   └── ArchiveProperty
        └── PropertyInfo (type, units, status)

TenantDetailsPage/
├── Header (with comprehensive actions)
│   ├── BackButton + TenantName
│   └── ActionButtons
│       ├── DownloadPDF
│       ├── EditTenant
│       ├── Archive/Restore
│       └── DeleteTenant
├── TabNavigation
│   ├── Overview
│   ├── PaymentHistory
│   ├── Maintenance
│   ├── Analytics
│   ├── Documents
│   └── PersonalDetails
├── MainContent (lg:col-span-2)
│   ├── OverviewTab
│   │   ├── LeaseInformation
│   │   │   ├── PropertyName + Unit
│   │   │   ├── MonthlyRent + SecurityDeposit
│   │   │   ├── LeaseStart/End + DaysRemaining
│   │   │   └── LeaseDuration
│   │   ├── PaymentSummary
│   │   │   ├── MonthsPaid + MonthsDue
│   │   │   ├── TotalPaid + Outstanding
│   │   │   └── PaymentMetrics
│   │   ├── RecentReceipts (last 3)
│   │   ├── CashFlowAnalysis
│   │   │   ├── TotalIncome + TotalExpenses
│   │   │   └── RecentTransactions
│   │   ├── ActiveReminders
│   │   │   ├── RemindersList
│   │   │   └── CompleteReminderActions
│   │   ├── PendingApprovals
│   │   │   ├── ApprovalsList
│   │   │   └── Approve/RejectActions
│   │   └── RecentAuditLogs
│   ├── PaymentHistoryTab
│   │   ├── PaymentsList (with status badges)
│   │   ├── PaymentFilters
│   │   └── PaymentActions
│   ├── MaintenanceTab
│   │   ├── MaintenanceRequestsList
│   │   ├── CreateNewRequestButton
│   │   ├── RequestStatusUpdates
│   │   ├── MaintenanceMetrics
│   │   └── EmptyStateWithCTA
│   ├── AnalyticsTab
│   │   └── TenantAnalyticsDashboard
│   │       ├── PaymentTrends
│   │       ├── BehaviorInsights
│   │       └── RiskAssessment
│   ├── DocumentsTab
│   │   ├── UploadButtons (Document + Image)
│   │   ├── TenantPhotos
│   │   │   ├── MainTenantPhoto
│   │   │   ├── GovernmentIDFront/Back
│   │   │   └── AdditionalAdultPhotos
│   │   ├── UploadedDocuments
│   │   ├── UploadedImages
│   │   └── EmptyStateMessage
│   └── PersonalDetailsTab
│       ├── DownloadActions (PDF + ZIP)
│       ├── PhotosSection
│       │   ├── TenantPhoto + GovernmentIDs
│       │   └── DownloadButtons
│       ├── BasicInformation
│       │   ├── Name, Email, Phone, Status
│       │   └── Occupants
│       ├── PropertyInformation
│       │   ├── Property + Unit + Rent
│       │   ├── SecurityDeposit
│       │   └── LeaseDetails
│       ├── FamilyDetails
│       │   ├── Father/MotherName
│       │   ├── GovernmentID + Occupation
│       │   └── MonthlyIncome
│       ├── ContactEmergency
│       │   ├── EmergencyContact
│       │   └── ReferenceInformation
│       ├── AddressInformation
│       │   ├── Present/Permanent/Previous
│       │   └── ReasonForMoving
│       ├── AdditionalInformation
│       │   ├── VehicleDetails + PetDetails
│       │   └── SpecialInstructions
│       └── AdditionalAdults
│           ├── AdultsList (with photos)
│           └── AdultDetails (name, relation, ID)
└── Sidebar (lg:col-span-1)
    ├── TenantInfo
    │   ├── TenantAvatar (with fallback)
    │   ├── TenantName + StatusBadge
    │   ├── ContactInfo (email, phone)
    │   └── UnitInfo
    └── QuickActions
        ├── QuickPayment (normal)
        ├── OverduePayment (if applicable)
        ├── ViewPayments (with count)
        ├── ReportIssue
        ├── ViewAllIssues (with count)
        ├── RenewLease
        └── TerminateLease
└── Modals
    ├── EditTenantModal
    ├── QuickPaymentModal (normal + overdue)
    ├── MaintenanceRequestModal
    └── LeaseActionModals
```

---

## Detail Pages Deep Dive

### PropertyDetailsPage Features

#### Data Fetching Strategy
```typescript
// Multi-query approach for comprehensive data
const { data: property } = useQuery({
  queryKey: ['property', propertyId],
  queryFn: async () => {
    const { data } = await apiClient.get(`/properties/${propertyId}`);
    return data.data;
  }
});

const { data: tenants = [] } = useQuery({
  queryKey: ['propertyTenants', propertyId],
  queryFn: async () => {
    const { data } = await apiClient.get(`/tenants?propertyId=${propertyId}`);
    return data.data || [];
  }
});

const { data: payments = [] } = useQuery({
  queryKey: ['propertyPayments', propertyId],
  queryFn: async () => {
    const { data } = await apiClient.get(`/payments?propertyId=${propertyId}`);
    return data.data || [];
  }
});

// Similar queries for expenses, maintenance, units
```

#### PropertyAnalyticsDashboard Components
- **Financial Metrics**: Revenue calculation, expense tracking, profit analysis
- **Occupancy Analytics**: Real-time occupancy rates, vacancy trends
- **Maintenance Overview**: Open vs closed requests, cost analysis
- **Performance Charts**: Monthly revenue, occupancy trends, maintenance costs

#### RelatedDataSections Features
- **Unit-Centric Filtering**: Filter all data by specific unit
- **Data Previews**: Recent 5 items from each category
- **Quick Actions**: Direct actions from preview cards
- **Real-time Updates**: Data refreshes when relationships change

#### EnhancedUnitsGrid Functionality
```typescript
// Dynamic unit generation based on property.numberOfUnits
const units = [];
for (let i = 1; i <= numberOfUnits; i++) {
  const unitNumber = i.toString();
  const tenant = tenants.find(t => t.unit === unitNumber);
  
  units.push({
    unitNumber,
    rentAmount: tenant?.rentAmount || 0,
    isOccupied: !!tenant,
    tenantId: tenant?._id,
    tenantName: tenant?.name,
    tenantStatus: tenant?.status
  });
}
```

- **Unit Cards**: Show tenant info, rent amount, occupancy status
- **Vacant Unit Actions**: "Add Tenant" CTA with pre-filled property/unit
- **Unit Nickname Management**: Custom unit naming system
- **Unit Data Modal**: Detailed unit-specific data (payments, maintenance)

### TenantDetailsPage Features

#### Comprehensive Tab System

**Overview Tab Deep Dive**:
- **Lease Information Card**:
  - Property name with link
  - Unit number (with nickname if available)
  - Monthly rent with security deposit
  - Lease start/end dates with days remaining calculation
  - Lease duration in months

- **Payment Summary Card**:
  - Months paid vs months due calculation
  - Total amount paid across all payments
  - Current month outstanding amount
  - Average monthly payment calculation

- **Recent Receipts Section**:
  - Last 3 receipts with download buttons
  - Receipt number, amount, date, payment method
  - Direct download links for each receipt

- **Cash Flow Analysis**:
  - Total income from tenant payments
  - Related expenses for the property
  - Recent cash flow transactions
  - Income vs expense comparison

- **Active Reminders Management**:
  - List of active reminders for the tenant
  - Next run date and frequency display
  - Complete reminder functionality
  - Reminder type categorization

- **Pending Approvals System**:
  - Approval requests related to tenant
  - Approve/Reject buttons with status updates
  - Request description and priority
  - Requested by user information

- **Recent Audit Logs**:
  - Last 5 activities related to tenant
  - Action type, description, timestamp
  - User who performed the action
  - Severity level indicators

**Payment History Tab**:
```typescript
// Payment status calculation
const getPaymentStatus = (payment) => {
  const paymentDate = new Date(payment.paymentDate);
  const expectedDate = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), 5);
  return paymentDate <= expectedDate ? 'On Time' : 'Late';
};
```
- **Payment List**: All payments with status badges
- **Payment Metrics**: Total paid, average payment, late payment count
- **Payment Filters**: By date range, status, amount
- **Export Options**: CSV, PDF export of payment history

**Maintenance Tab Features**:
- **Request Management**: Create, update, close maintenance requests
- **Status Tracking**: Open, In Progress, Completed, Cancelled
- **Priority System**: Low, Medium, High priority requests
- **Cost Tracking**: Estimated vs actual costs
- **Assignment System**: Assign to maintenance staff
- **Notes System**: Add notes and updates to requests
- **Photo Attachments**: Before/after photos for requests

**Analytics Tab Components**:
- **Payment Behavior Analysis**: On-time payment percentage, average days late
- **Tenant Score Calculation**: Based on payment history, maintenance requests
- **Risk Assessment**: Late payment risk, lease renewal probability
- **Behavioral Insights**: Payment patterns, communication responsiveness
- **Comparative Analysis**: Tenant performance vs property average

**Documents Tab Organization**:
- **Photo Management**:
  - Main tenant photo with upload/replace functionality
  - Government ID front/back with secure storage
  - Additional adult photos with relationship mapping
  - Photo validation and compression

- **Document Storage**:
  - Lease agreements, contracts, legal documents
  - File type validation (PDF, DOC, TXT)
  - Document categorization and tagging
  - Version control for document updates

- **Image Gallery**:
  - Property condition photos
  - Move-in/move-out documentation
  - Maintenance request photos
  - Custom image categories

**Personal Details Tab Comprehensive View**:
- **Complete Data Export**: PDF and ZIP download options
- **Photo Gallery**: All tenant and family photos
- **Family Tree**: Additional adults with relationships
- **Address History**: Present, permanent, previous addresses
- **Emergency Contacts**: Multiple contact options
- **Reference Information**: Landlord/employer references
- **Background Information**: Occupation, income, vehicle details
- **Special Requirements**: Pet policies, accessibility needs

#### Sidebar Quick Actions Deep Dive

**Payment Actions**:
```typescript
// Overdue calculation
const calculateOverdue = () => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const leaseStartDate = tenant.createdAt ? new Date(tenant.createdAt) : new Date();
  const monthsSinceStart = (currentYear - leaseStartDate.getFullYear()) * 12 + 
                          (currentMonth - leaseStartDate.getMonth()) + 1;
  const monthsPaid = payments.length;
  const monthsOverdue = Math.max(0, monthsSinceStart - monthsPaid);
  const overdueAmount = monthsOverdue * (tenant.rentAmount || 0);
  
  return { monthsOverdue, overdueAmount };
};
```

- **Quick Payment**: Normal monthly payment processing
- **Overdue Payment**: Handle multiple months of overdue rent
- **Payment History**: Link to full payment history with count
- **Payment Reminders**: Send automated payment reminders

**Maintenance Actions**:
- **Report Issue**: Quick maintenance request creation
- **View All Issues**: Complete maintenance history
- **Schedule Maintenance**: Proactive maintenance scheduling
- **Maintenance Analytics**: Cost and frequency analysis

**Lease Management**:
- **Lease Renewal**: Extend lease with new terms
- **Lease Termination**: End lease with proper notice
- **Rent Increase**: Apply rent increases with documentation
- **Lease Transfer**: Transfer to new tenant

#### Advanced Detail Page Features

**Real-time Data Updates**:
```typescript
// WebSocket integration for live updates
useEffect(() => {
  const socket = io();
  socket.on(`tenant_${tenantId}_updated`, (data) => {
    queryClient.setQueryData(['tenant', tenantId], data);
  });
  
  return () => socket.disconnect();
}, [tenantId]);
```

**Audit Trail System**:
- **Complete Activity Log**: Every action on tenant/property
- **User Attribution**: Who made what changes when
- **Change History**: Before/after values for updates
- **System Events**: Automated actions and triggers

**Document Generation**:
- **Comprehensive PDF Reports**: Complete tenant information
- **Custom Report Templates**: Branded document generation
- **Bulk Document Creation**: Multiple tenants at once
- **Legal Document Templates**: Lease agreements, notices

**Integration Points**:
- **Email Integration**: Send documents directly from system
- **SMS Notifications**: Payment reminders, maintenance updates
- **Calendar Integration**: Lease dates, maintenance schedules
- **Accounting Software**: Export financial data

---

## Component Structure

### Enhanced Property Card Features
- **Visual Elements**:
  - Property image with fallback gradient
  - Occupancy progress bar overlay
  - Status badges (Active/Inactive, Vacant units, Issues)
  - Tenant avatars with unit numbers
  
- **Metrics Display**:
  - Monthly revenue calculation
  - Occupancy rate with visual indicator
  - Property type and last activity
  - Enhanced tenant information
  
- **Interactive Elements**:
  - Bulk selection checkbox
  - Quick action buttons (Edit, Units, Archive, Share)
  - View details navigation
  - Unit management access

### Enhanced Tenant Card Features
- **Visual Elements**:
  - Property thumbnail background
  - Tenant photo overlay
  - Payment status indicators
  - Payment history mini-chart
  
- **Metrics Display**:
  - Payment status with outstanding amounts
  - Lease expiration warnings
  - Tenant score calculation
  - Contact information
  
- **Interactive Elements**:
  - Bulk selection checkbox
  - Quick actions (Payment, Message, Edit, Share)
  - Archive functionality
  - Detail page navigation

### Universal Components Used
- **UniversalCard**: Consistent card styling with gradients
- **UniversalHeader**: Page headers with stats and actions
- **UniversalSearch**: Advanced search with filters
- **UniversalExport**: Data export functionality
- **UniversalStatusBadge**: Status indicators
- **Phase3MobileHeader**: Mobile-optimized headers
- **Phase3TabFilters**: Mobile filter tabs
- **Phase3SwipeableCard**: Touch-friendly card interactions

---

## Data Flow & State Management

### React Query Integration
```typescript
// Properties data fetching
const { data: properties = [], isLoading, error } = useQuery({
  queryKey: ['properties'],
  queryFn: fetchProperties,
  retry: 0,
  refetchOnWindowFocus: false
});

// Cross-data relationships
const { data: allTenants = [] } = useQuery({
  queryKey: ['tenants'],
  queryFn: async () => {
    const { data } = await apiClient.get('/tenants');
    return data.data || [];
  }
});
```

### State Management Patterns
- **Local State**: Component-level state for UI interactions
- **Query State**: React Query for server state management
- **Cross-Data Hook**: `useCrossData` for related entity statistics
- **Optimistic Updates**: `useOptimisticUpdate` for immediate UI feedback
- **Background Refresh**: `useBackgroundRefresh` for data synchronization

### Data Transformation Pipeline
```typescript
const filteredProperties = useMemo(() => {
  let filtered = properties.filter((property: any) => {
    // Archive filter
    const isArchived = property.status === 'Archived';
    if (showArchived && !isArchived) return false;
    if (!showArchived && isArchived) return false;
    
    // Vacancy filter
    if (showVacant) {
      const propertyTenants = allTenants.filter(t => 
        t.propertyId === property._id && t.status === 'Active'
      );
      const isVacant = propertyTenants.length === 0 || 
        propertyTenants.length < (property.numberOfUnits || 1);
      if (!isVacant) return false;
    }
    
    // Search filters
    const matchesSearch = !searchQuery || 
      property.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address?.city?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });
  
  // Apply sorting
  filtered.sort((a, b) => {
    // Sorting logic based on filters
  });
  
  return filtered;
}, [properties, searchQuery, filters, showArchived, showVacant, allTenants]);
```

---

## UI/UX Design Patterns

### Design System
- **Color Scheme**: 
  - Primary: Blue gradients for properties
  - Secondary: Green gradients for tenants
  - Status colors: Green (success), Red (error), Yellow (warning), Blue (info)
  
- **Typography**:
  - Headers: Bold, large text with gradient effects
  - Body: Clean, readable fonts with proper hierarchy
  - Labels: Smaller, muted text for secondary information

### Layout Patterns
- **Desktop**: 3-column layout with sidebar
- **Mobile**: Single-column with collapsible sections
- **Cards**: Consistent card design with hover effects
- **Modals**: Centered overlays with backdrop blur

### Interactive Elements
- **Hover Effects**: Scale transforms and color transitions
- **Loading States**: Skeleton loaders and spinners
- **Empty States**: Illustrated empty states with call-to-action
- **Error States**: User-friendly error messages with retry options

### Accessibility Features
- **Keyboard Navigation**: Tab-accessible elements
- **Screen Reader Support**: Proper ARIA labels
- **Color Contrast**: WCAG compliant color combinations
- **Focus Indicators**: Visible focus states

---

## Filtering & Search System

### Universal Search Features
```typescript
interface SearchFilters {
  query: string;
  dateRange: 'all' | 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  status: string;
  sortBy: 'date' | 'name' | 'status';
  sortOrder: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
}
```

### Property Filters
- **Status Filter**: Active, Inactive, Under Renovation, Archived
- **Vacancy Filter**: Show only properties with vacant units
- **Unit Type Filter**: Single unit vs. multiple units
- **Search Query**: Name and address search
- **Date Range**: Creation/update date filtering

### Tenant Filters
- **Status Filter**: Active, Inactive, Late, Archived
- **Payment Status**: Current, Late, Partial payments
- **Lease Status**: Expiring soon, renewal due
- **Property Filter**: Filter by specific property
- **Advanced Search**: Rent range, lease dates, personal details

### Smart Filters (Desktop Sidebar)
- **Quick Toggles**: One-click filter activation
- **Visual Indicators**: Active filter highlighting
- **Filter Combinations**: Multiple filters can be applied simultaneously
- **Filter Persistence**: Maintains state during navigation

### Mobile Filter Tabs
```typescript
const getPropertyFilterTabs = (
  showVacant: boolean,
  showArchived: boolean,
  showBulkMode: boolean,
  vacantCount: number,
  archivedCount: number
) => [
  { key: 'all', label: 'All', active: !showVacant && !showArchived && !showBulkMode },
  { key: 'vacant', label: `Vacant (${vacantCount})`, active: showVacant },
  { key: 'archived', label: `Archived (${archivedCount})`, active: showArchived },
  { key: 'bulk', label: 'Bulk Select', active: showBulkMode }
];
```

---

## Cross-Data Integration

### useCrossData Hook
```typescript
export const useCrossData = () => {
  const { data: crossData = {} } = useQuery({
    queryKey: ['crossData'],
    queryFn: async () => {
      const [properties, tenants, payments, expenses, maintenance] = await Promise.all([
        apiClient.get('/properties'),
        apiClient.get('/tenants'),
        apiClient.get('/payments'),
        apiClient.get('/expenses'),
        apiClient.get('/maintenance')
      ]);

      return {
        properties: propertiesData,
        tenants: tenantsData,
        payments: paymentsData,
        expenses: expensesData,
        maintenance: maintenanceData,
        stats: {
          totalProperties: propertiesData.length,
          totalTenants: tenantsData.length,
          activeProperties: propertiesData.filter(p => p.status === 'Active').length,
          activeTenants: tenantsData.filter(t => t.status === 'Active').length,
          totalIncome: paymentsData.reduce((sum, p) => sum + (p.amount || 0), 0),
          totalExpenses: expensesData.reduce((sum, e) => sum + (e.amount || 0), 0),
          openMaintenance: maintenanceData.filter(m => m.status === 'Open').length,
          occupancyRate: calculateOccupancyRate(propertiesData, tenantsData),
          monthlyRevenue: tenantsData.reduce((sum, t) => sum + (t.rentAmount || 0), 0)
        }
      };
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000
  });

  return crossData;
};
```

### Relationship Calculations
- **Occupancy Rate**: Active tenants / Total units across all properties
- **Monthly Revenue**: Sum of all active tenant rent amounts
- **Vacancy Analysis**: Properties with available units
- **Payment Status**: Cross-reference tenants with payment records
- **Maintenance Correlation**: Link maintenance requests to properties and tenants

### Data Preview Sections
- **Property Details**: Shows related tenants, payments, expenses, maintenance
- **Tenant Details**: Shows payment history, maintenance requests, receipts
- **Unit-Centric Filtering**: Filter data by specific property units
- **Real-time Updates**: Data refreshes when relationships change

---

## Performance Optimizations

### React Query Optimizations
```typescript
// Stale time configuration
const { data: tenants = [] } = useQuery({
  queryKey: ['propertyTenants', property._id],
  queryFn: async () => {
    const { data } = await apiClient.get(`/tenants?propertyId=${property._id}`);
    return data.data || [];
  },
  staleTime: 300000 // 5 minutes
});
```

### Lazy Loading
- **LazyLoader Component**: Delays rendering of off-screen cards
- **Image Lazy Loading**: Property and tenant images load on demand
- **Infinite Scroll**: `useInfiniteScroll` hook for large datasets
- **Virtual Scrolling**: For extremely large lists (future enhancement)

### Memoization
```typescript
const filteredProperties = useMemo(() => {
  // Complex filtering logic
}, [properties, searchQuery, filters, showArchived, showVacant, allTenants]);
```

### Background Refresh
```typescript
useBackgroundRefresh([['properties'], ['tenants']], 60000); // 1 minute
```

### Optimistic Updates
```typescript
const { addOptimistic, updateOptimistic, removeOptimistic } = useOptimisticUpdate(
  ['properties'], 
  properties
);
```

---

## Mobile Responsiveness

### Phase 3 Mobile Design
- **Mobile-First Approach**: Designed for touch interactions
- **Swipeable Cards**: `Phase3SwipeableCard` with gesture support
- **Bottom Sheets**: `Phase3BottomSheet` for mobile actions
- **Tab Filters**: `Phase3TabFilters` for quick filtering
- **Floating Action Button**: Fixed position for primary actions

### Touch Optimizations
- **Touch Targets**: Minimum 44px touch targets
- **Swipe Gestures**: Left/right swipe for card actions
- **Pull to Refresh**: `PullToRefresh` component
- **Haptic Feedback**: Touch feedback for interactions

### Responsive Breakpoints
```css
/* Mobile First */
.phase3-card-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .phase3-card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .phase3-card-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Mobile-Specific Features
- **Collapsible Sections**: Expandable content areas
- **Sticky Headers**: Fixed navigation during scroll
- **Bottom Navigation**: Easy thumb access
- **Gesture Navigation**: Swipe-based interactions

---

## Security & Authorization

### Organization-Based Access Control
```typescript
// Backend authorization check
if (!user || !user.organizationId) {
  return res.status(401).json({ success: false, message: 'Not authorized' });
}

// Query scoping
const query = { organizationId: user.organizationId };
```

### Role-Based Permissions
- **Admin**: Full CRUD access to all entities
- **Agent**: Limited to assigned properties
- **View-Only**: Read access only

### Data Validation
```typescript
// Input validation
if (!name || !email || !phone) {
  return res.status(400).json({ 
    success: false, 
    message: 'Name, email, and phone are required' 
  });
}

// Property ownership validation
if (property.organizationId.toString() !== user.organizationId.toString()) {
  return res.status(403).json({ success: false, message: 'Not authorized' });
}
```

### File Upload Security
- **Cloudinary Integration**: Secure image hosting
- **File Type Validation**: Restricted file types
- **Size Limits**: Maximum file size enforcement
- **Virus Scanning**: Malware detection (future enhancement)

---

## API Integration

### RESTful Endpoints

#### Properties API
```typescript
GET    /api/properties                    // List properties
POST   /api/properties                    // Create property
GET    /api/properties/:id                // Get property details
PUT    /api/properties/:id                // Update property
DELETE /api/properties/:id                // Delete property
GET    /api/properties/:id/data-previews  // Related data
GET    /api/properties/:id/units          // Property units
```

#### Tenants API
```typescript
GET    /api/tenants                       // List tenants
POST   /api/tenants                       // Create tenant
GET    /api/tenants/:id                   // Get tenant details
PUT    /api/tenants/:id                   // Update tenant
DELETE /api/tenants/:id                   // Delete tenant
GET    /api/tenants/:id/data-previews     // Related data
GET    /api/tenants/:id/stats             // Tenant statistics
GET    /api/tenants/:id/analytics         // Tenant analytics
POST   /api/tenants/:id/download-pdf      // Generate PDF
POST   /api/tenants/:id/download-zip      // Download all data
POST   /api/tenants/bulk-actions          // Bulk operations
```

### Error Handling
```typescript
// Consistent error responses
try {
  const property = await Property.create(propertyData);
  res.status(201).json({ success: true, data: property });
} catch (error: any) {
  if (error.code === 11000) {
    return res.status(400).json({ 
      success: false, 
      message: 'Duplicate entry detected' 
    });
  }
  
  res.status(500).json({ 
    success: false, 
    message: error.message || 'Server error',
    details: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
}
```

### Request/Response Patterns
```typescript
// Standardized response format
interface APIResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}
```

---

## Advanced Features

### Bulk Operations
- **Property Bulk Actions**:
  - Bulk payment processing
  - Lease renewals
  - Rent increases
  - Archive/restore
  - Export operations

- **Tenant Bulk Actions**:
  - Mass communication
  - Rent adjustments
  - Lease terminations
  - Status updates
  - Document generation

### Export Capabilities
- **Universal Export**: Configurable data export
- **PDF Generation**: Comprehensive tenant reports
- **ZIP Downloads**: Complete tenant data packages
- **CSV Export**: Spreadsheet-compatible formats
- **Custom Templates**: Branded document generation

### Analytics Integration
- **Property Analytics**: Revenue, occupancy, maintenance trends
- **Tenant Analytics**: Payment history, behavior analysis
- **Predictive Insights**: AI-powered recommendations
- **Performance Metrics**: KPI tracking and reporting

### Automation Features
- **Action Chains**: Automated workflows on data changes
- **Notification System**: Real-time alerts and reminders
- **Audit Logging**: Complete activity tracking
- **Background Jobs**: Scheduled maintenance tasks

---

## Future Enhancements

### Planned Features
1. **Advanced Search**: Elasticsearch integration
2. **Real-time Collaboration**: WebSocket-based updates
3. **Mobile App**: React Native implementation
4. **AI Integration**: Smart recommendations and insights
5. **Document Management**: Enhanced file organization
6. **Workflow Automation**: Custom business rules
7. **Integration APIs**: Third-party service connections
8. **Advanced Analytics**: Machine learning insights

### Technical Improvements
1. **Performance**: Virtual scrolling for large datasets
2. **Offline Support**: PWA capabilities with sync
3. **Accessibility**: Enhanced screen reader support
4. **Internationalization**: Multi-language support
5. **Testing**: Comprehensive test coverage
6. **Documentation**: API documentation and guides

---

## Conclusion

The Properties and Tenants pages represent a sophisticated property management system with:

- **Comprehensive Data Models**: Rich entity relationships and detailed information storage
- **Advanced UI/UX**: Modern, responsive design with mobile-first approach
- **Powerful Filtering**: Multi-dimensional search and filter capabilities
- **Cross-Entity Integration**: Seamless data relationships and analytics
- **Performance Optimization**: Efficient data loading and caching strategies
- **Security**: Organization-based access control and data validation
- **Extensibility**: Modular architecture supporting future enhancements

The system successfully balances functionality with usability, providing property managers with powerful tools while maintaining an intuitive user experience across all device types.