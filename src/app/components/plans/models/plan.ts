export interface Plan {
  id: string;
  name: string;
  bookingFrequency: number;
  timePeriod: number;
  amount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}