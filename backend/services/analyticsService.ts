export const getAnalyticsData = async (organizationId: string) => {
  try {
    return {
      totalProperties: 0,
      totalTenants: 0,
      totalRevenue: 0,
      occupancyRate: 0
    };
  } catch (error) {
    console.error('Analytics service error:', error);
    throw error;
  }
};

export default {
  getAnalyticsData
};
