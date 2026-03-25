export interface Sensor {
  _id?: string;
  temperature: number;
  distance: number;
  gasValue: number;
  gasDetected: boolean;
  flameDetected: boolean;
  emergencyPressed: boolean;
  danger: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}
