import { ActionType, ShiftType } from "@prisma/client";

export interface ShiftFormData {
  employeeName: string;
  actionType: ActionType;
  shiftDate: Date;
  startTime: string;
  endTime: string;
  shiftType: ShiftType;
}

export interface Shift {
  id: string;
  employeeName: string;
  actionType: ActionType;
  shiftDate: string;
  startTime: string;
  endTime: string;
  shiftType: ShiftType;
  confirmed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReportSummary {
  employeeName: string;
  CANCEL: number;
  MODIFY: number;
  ADD: number;
  total: number;
}

export interface ReportResponse {
  summary: ReportSummary[];
  totalRecords: number;
}

export interface HeatMapResponse {
  heatMapData: number[][];
  hourlyTotals: number[];
  dailyTotals: number[];
  totalCancellations: number;
  dateRange: {
    start: string | null;
    end: string | null;
  };
}