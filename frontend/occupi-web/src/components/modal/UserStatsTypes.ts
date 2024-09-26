// types.ts
export interface DayStats {
    weekday: string;
    ratio: number;
    avgArrival: string;
    avgDeparture: string;
    hours: number[];
  }
  
  export interface WorkRatio {
    ratio: number;
    days: DayStats[];
  }
  
  export interface ArrivalDeparture {
    overallavgArrival: string;
    overallavgDeparture: string;
    days: DayStats[];
  }
  
  export interface PeakHours {
    days: DayStats[];
  }
  
  export interface UserStats {
    dailyHours: { date: string; totalHours: number }[];
    workRatio: WorkRatio;
    arrivalDeparture: ArrivalDeparture;
    peakHours: PeakHours;
  }
  
  export interface ChartDataItem {
    weekday: string;
    peak1: number;
    peak2: number;
    peak3: number;
  }

  export interface WorkRatioEntry {
    ratio: number;
    // Add other properties if needed
  }
  
  export interface UserWorkRatioData {
    data: WorkRatioEntry[];
  }
  
  export interface UserHoursEntry {
    totalHours: number;
    // Add other properties if needed
  }
  
  export interface UserHoursData {
    data: UserHoursEntry[];
  }