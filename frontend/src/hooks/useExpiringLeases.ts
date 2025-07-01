export interface IExpiringLease {
  _id: string;
  name: string;
  propertyId: {
    name: string;
    _id: string;
  };
  leaseEndDate: string;
  unit: string;
  email: string;
}