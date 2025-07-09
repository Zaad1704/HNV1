import apiClient from '../api/client';

class SmartWorkflowService {
  // Payment Received Workflow
  async paymentReceived(payment: any) {
    const workflows = [];
    
    // Generate receipt automatically
    workflows.push(
      apiClient.post('/receipts/generate', { 
        paymentId: payment._id,
        automatic: true 
      })
    );
    
    // Update cash flow
    workflows.push(
      apiClient.post('/cashflow/update', {
        type: 'income',
        amount: payment.amount,
        propertyId: payment.propertyId,
        date: payment.paymentDate
      })
    );
    
    // Clear reminders for tenant
    workflows.push(
      apiClient.put(`/reminders/clear/${payment.tenantId}`, {
        type: 'payment_reminder'
      })
    );
    
    // Update tenant status
    workflows.push(
      apiClient.put(`/tenants/${payment.tenantId}`, {
        status: 'Current',
        lastPaymentDate: payment.paymentDate
      })
    );
    
    await Promise.all(workflows);
  }

  // Maintenance Completed Workflow
  async maintenanceCompleted(maintenance: any) {
    const workflows = [];
    
    // Generate expense if cost exists
    if (maintenance.actualCost > 0) {
      workflows.push(
        apiClient.post('/expenses', {
          description: `Maintenance: ${maintenance.description}`,
          amount: maintenance.actualCost,
          propertyId: maintenance.propertyId,
          category: 'Maintenance',
          maintenanceId: maintenance._id,
          automatic: true
        })
      );
    }
    
    // Update property status
    workflows.push(
      apiClient.put(`/properties/${maintenance.propertyId}`, {
        lastMaintenanceDate: new Date(),
        maintenanceStatus: 'Up to date'
      })
    );
    
    // Notify tenant
    if (maintenance.tenantId) {
      workflows.push(
        apiClient.post('/notifications', {
          tenantId: maintenance.tenantId,
          type: 'maintenance_completed',
          message: `Your maintenance request has been completed: ${maintenance.description}`,
          automatic: true
        })
      );
    }
    
    // Schedule follow-up if needed
    if (maintenance.followUpRequired) {
      workflows.push(
        apiClient.post('/reminders', {
          title: 'Maintenance Follow-up',
          propertyId: maintenance.propertyId,
          tenantId: maintenance.tenantId,
          scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          automatic: true
        })
      );
    }
    
    await Promise.all(workflows);
  }

  // Expense Added Workflow
  async expenseAdded(expense: any) {
    const workflows = [];
    
    // Update cash flow
    workflows.push(
      apiClient.post('/cashflow/update', {
        type: 'expense',
        amount: expense.amount,
        propertyId: expense.propertyId,
        category: expense.category,
        date: expense.date
      })
    );
    
    // Check budget limits
    const budgetCheck = await apiClient.get(`/budgets/check/${expense.propertyId}/${expense.category}`);
    
    if (budgetCheck.data.exceeded) {
      // Request approval for over-budget expense
      workflows.push(
        apiClient.post('/approvals', {
          type: 'expense_over_budget',
          expenseId: expense._id,
          amount: expense.amount,
          budgetLimit: budgetCheck.data.limit,
          automatic: true
        })
      );
    }
    
    // Categorize expense automatically
    workflows.push(
      apiClient.put(`/expenses/${expense._id}/categorize`, {
        automatic: true
      })
    );
    
    await Promise.all(workflows);
  }

  // Tenant Added Workflow
  async tenantAdded(tenant: any) {
    const workflows = [];
    
    // Create welcome reminder
    workflows.push(
      apiClient.post('/reminders', {
        title: 'Welcome New Tenant',
        tenantId: tenant._id,
        message: 'Welcome to your new home! Here are important details...',
        scheduledDate: new Date(),
        automatic: true
      })
    );
    
    // Update property occupancy
    workflows.push(
      apiClient.put(`/properties/${tenant.propertyId}/occupancy`, {
        action: 'add_tenant',
        automatic: true
      })
    );
    
    // Create first rent reminder
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    
    workflows.push(
      apiClient.post('/reminders', {
        title: 'Monthly Rent Reminder',
        tenantId: tenant._id,
        message: 'Your monthly rent payment is due.',
        scheduledDate: nextMonth,
        recurring: true,
        frequency: 'monthly',
        automatic: true
      })
    );
    
    await Promise.all(workflows);
  }
}

export const smartWorkflowService = new SmartWorkflowService();