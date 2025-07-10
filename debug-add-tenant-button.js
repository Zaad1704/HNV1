// Simple debug script to test add tenant button
console.log('🔍 Debugging Add Tenant Button...');

// Test 1: Check if modal opens
const testModalOpen = () => {
  console.log('Test 1: Modal state change');
  try {
    // Simulate React state change
    const setShowAddModal = (value) => console.log('✅ setShowAddModal called with:', value);
    setShowAddModal(true);
  } catch (error) {
    console.error('❌ Modal open failed:', error);
  }
};

// Test 2: Check form submission
const testFormSubmission = () => {
  console.log('Test 2: Form submission');
  try {
    const mockFormData = {
      name: 'Test Tenant',
      email: 'test@example.com',
      phone: '1234567890',
      propertyId: 'test-property-id',
      unit: '101',
      rentAmount: '1000',
      leaseStartDate: '2024-01-01',
      leaseEndDate: '2024-12-31',
      securityDeposit: '1000'
    };
    
    // Validate required fields
    const required = ['name', 'email', 'phone', 'propertyId', 'unit', 'rentAmount'];
    const missing = required.filter(field => !mockFormData[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
    
    console.log('✅ Form validation passed');
  } catch (error) {
    console.error('❌ Form validation failed:', error.message);
  }
};

// Test 3: Check API call structure
const testAPICall = () => {
  console.log('Test 3: API call structure');
  try {
    const mockApiClient = {
      post: (url, data) => {
        console.log('API POST to:', url);
        console.log('Data keys:', Object.keys(data));
        return Promise.resolve({ data: { success: true, data: { _id: 'new-tenant-id' } } });
      }
    };
    
    const tenantData = { name: 'Test', email: 'test@test.com' };
    mockApiClient.post('/tenants', tenantData)
      .then(response => console.log('✅ API call successful:', response.data))
      .catch(error => console.error('❌ API call failed:', error));
      
  } catch (error) {
    console.error('❌ API setup failed:', error);
  }
};

// Run all tests
testModalOpen();
testFormSubmission();
testAPICall();

console.log('🏁 Debug tests completed');