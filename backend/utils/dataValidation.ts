import Property from '../models/Property';
import Tenant from '../models/Tenant';

export const validatePropertyTenantConnection = async (organizationId: string) => {
  try {
    const properties = await Property.find({ organizationId });
    const tenants = await Tenant.find({ organizationId, status: 'Active' });
    
    const issues = [];
    const fixes = [];
    
    for (const property of properties) {
      const propertyTenants = tenants.filter(t => t.propertyId?.toString() === property._id.toString());
      
      // Check for unit number consistency
      for (const tenant of propertyTenants) {
        if (!tenant.unit || tenant.unit === '') {
          issues.push({
            type: 'missing_unit',
            tenantId: tenant._id,
            tenantName: tenant.name,
            propertyId: property._id,
            propertyName: property.name
          });
        }
        
        const unitNumber = parseInt(tenant.unit);
        if (unitNumber > property.numberOfUnits) {
          issues.push({
            type: 'invalid_unit',
            tenantId: tenant._id,
            tenantName: tenant.name,
            unit: tenant.unit,
            propertyId: property._id,
            propertyName: property.name,
            maxUnits: property.numberOfUnits
          });
        }
      }
      
      // Check for duplicate units
      const unitCounts = {};
      propertyTenants.forEach(tenant => {
        if (tenant.unit) {
          unitCounts[tenant.unit] = (unitCounts[tenant.unit] || 0) + 1;
        }
      });
      
      Object.entries(unitCounts).forEach(([unit, count]) => {
        if (count > 1) {
          issues.push({
            type: 'duplicate_unit',
            unit,
            count,
            propertyId: property._id,
            propertyName: property.name,
            tenants: propertyTenants.filter(t => t.unit === unit).map(t => ({
              id: t._id,
              name: t.name
            }))
          });
        }
      });
    }
    
    return {
      valid: issues.length === 0,
      issues,
      summary: {
        totalProperties: properties.length,
        totalTenants: tenants.length,
        issuesFound: issues.length
      }
    };
  } catch (error) {
    console.error('Data validation error:', error);
    throw error;
  }
};

export const fixDataInconsistencies = async (organizationId: string) => {
  try {
    const validation = await validatePropertyTenantConnection(organizationId);
    const fixes = [];
    
    for (const issue of validation.issues) {
      switch (issue.type) {
        case 'missing_unit':
          // Auto-assign next available unit
          const property = await Property.findById(issue.propertyId);
          const occupiedUnits = await Tenant.find({ 
            propertyId: issue.propertyId, 
            organizationId,
            status: 'Active',
            unit: { $ne: null, $ne: '' }
          }).distinct('unit');
          
          let nextUnit = '1';
          for (let i = 1; i <= property.numberOfUnits; i++) {
            if (!occupiedUnits.includes(i.toString())) {
              nextUnit = i.toString();
              break;
            }
          }
          
          await Tenant.findByIdAndUpdate(issue.tenantId, { unit: nextUnit });
          fixes.push({
            type: 'assigned_unit',
            tenantId: issue.tenantId,
            assignedUnit: nextUnit
          });
          break;
          
        case 'invalid_unit':
          // Move to next available valid unit
          const validProperty = await Property.findById(issue.propertyId);
          const validOccupiedUnits = await Tenant.find({ 
            propertyId: issue.propertyId, 
            organizationId,
            status: 'Active',
            _id: { $ne: issue.tenantId },
            unit: { $ne: null, $ne: '' }
          }).distinct('unit');
          
          let validNextUnit = '1';
          for (let i = 1; i <= validProperty.numberOfUnits; i++) {
            if (!validOccupiedUnits.includes(i.toString())) {
              validNextUnit = i.toString();
              break;
            }
          }
          
          await Tenant.findByIdAndUpdate(issue.tenantId, { unit: validNextUnit });
          fixes.push({
            type: 'corrected_unit',
            tenantId: issue.tenantId,
            oldUnit: issue.unit,
            newUnit: validNextUnit
          });
          break;
          
        case 'duplicate_unit':
          // Keep first tenant, reassign others
          const duplicateTenants = issue.tenants.slice(1); // Skip first tenant
          for (const tenant of duplicateTenants) {
            const dupProperty = await Property.findById(issue.propertyId);
            const dupOccupiedUnits = await Tenant.find({ 
              propertyId: issue.propertyId, 
              organizationId,
              status: 'Active',
              _id: { $ne: tenant.id },
              unit: { $ne: null, $ne: '' }
            }).distinct('unit');
            
            let dupNextUnit = '1';
            for (let i = 1; i <= dupProperty.numberOfUnits; i++) {
              if (!dupOccupiedUnits.includes(i.toString())) {
                dupNextUnit = i.toString();
                break;
              }
            }
            
            await Tenant.findByIdAndUpdate(tenant.id, { unit: dupNextUnit });
            fixes.push({
              type: 'resolved_duplicate',
              tenantId: tenant.id,
              oldUnit: issue.unit,
              newUnit: dupNextUnit
            });
          }
          break;
      }
    }
    
    return {
      fixesApplied: fixes.length,
      fixes,
      validation: await validatePropertyTenantConnection(organizationId)
    };
  } catch (error) {
    console.error('Data fix error:', error);
    throw error;
  }
};