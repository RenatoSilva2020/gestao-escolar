
export enum UserRole {
  TEACHER = 'TEACHER',
  SUPERVISOR = 'SUPERVISOR'
}

export interface User {
  id: string;
  name: string;
  masp: string;
  role: UserRole;
  subject?: string;
  chRegimeBasico?: number;
  chExtraClasse?: string;
  schedule?: {
    segunda: string;
    terca: string;
    quarta: string;
    quinta: string;
    sexta: string;
  };
}

export interface WeeklyActivity {
  id: string;
  startDate: string;
  endDate: string;
  descriptions: string[]; // Fixed 6 lines as per requirement
}

export interface MonthlyReport {
  teacherId: string;
  month: string;
  year: number;
  weeks: WeeklyActivity[];
  lastUpdated: string;
}

export interface ActivityType {
  id: string;
  name: string;
}
