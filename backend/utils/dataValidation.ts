import Property from '../models/Property';
import Tenant from '../models/Tenant';

export const validatePropertyTenantConnection = async (organizationId: string) => {
  try {
    // Find all properties and tenants for the organization
    const [properties, tenants] = await Promise.all([
      Property.find({ organizationId }).lean(),
      Tenant.find({ organizationId }).lean()
    ]);

    const issues = [];

    // Check for tenants without valid properties
    for (const tenant of tenants) {
      if (tenant.propertyId) {
        const property = properties.find(p => p._id.toString() === tenant.propertyId.toString());
        if (!property) {
          issues.push({
            type: 'orphaned_tenant',
            tenantId: tenant._id,
            tenantName: tenant.name,
            invalidPropertyId: tenant.propertyId
          });
        }
      }
    }

    // Check for properties with unit count mismatches
    for (const property of properties) {
      const propertyTenants = tenants.filter(t => 
        t.propertyId && t.propertyId.toString() === property._id.toString()
      );
      
      if (propertyTenants.length > property.numberOfUnits) {
        issues.push({
          type: 'unit_overflow',
          propertyId: property._id,
          propertyName: property.name,
          maxUnits: property.numberOfUnits,
          currentTenants: propertyTenants.length
        });
      }

      // Check for duplicate unit assignments
      const unitAssignments = propertyTenants.map(t => t.unit).filter(Boolean);
      const duplicateUnits = unitAssignments.filter((unit, index) => 
        unitAssignments.indexOf(unit) !== index
      );
      
      if (duplicateUnits.length > 0) {
        issues.push({
          type: 'duplicate_units',
          propertyId: property._id,
          propertyName: property.name,
          duplicateUnits: [...new Set(duplicateUnits)]
        });
      }
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
    return {
      valid: false,
      error: error.message,
      issues: []
    };
  }
};

export const fixDataInconsistencies = async (organizationId: string) => {
  try {
    const validation = await validatePropertyTenantConnection(organizationId);
    const fixes = [];

    for (const issue of validation.issues) {
      switch (issue.type) {
        case 'orphaned_tenant':
          // Set propertyId to null for orphaned tenants
          await Tenant.findByIdAndUpdate(issue.tenantId, { propertyId: null });
          fixes.push(`Fixed orphaned tenant: ${issue.tenantName}`);
          break;
          
        case 'duplicate_units':
          // Reassign duplicate units
          const duplicateTenants = await Tenant.find({
            propertyId: issue.propertyId,
            unit: { $in: issue.duplicateUnits }
          });
          
          for (let i = 1; i < duplicateTenants.length; i++) {
            const newUnit = await findNextAvailableUnit(issue.propertyId, organizationId);
            if (newUnit) {
              await Tenant.findByIdAndUpdate(duplicateTenants[i]._id, { unit: newUnit });
              fixes.push(`Reassigned tenant ${duplicateTenants[i].name} to unit ${newUnit}`);
            }
          }
          break;
      }
    }

    return {
      success: true,
      fixes,
      fixedIssues: fixes.length
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      fixes: []
    };
  }
};

const findNextAvailableUnit = async (propertyId: string, organizationId: string) => {
  const property = await Property.findById(propertyId);
  if (!property) return null;

  const occupiedUnits = await Tenant.find({ propertyId, organizationId })
    .distinct('unit')
    .lean();

  for (let i = 1; i <= property.numberOfUnits; i++) {
    if (!occupiedUnits.includes(i.toString())) {
      return i.toString();
    }
  }
  
  return null;
};