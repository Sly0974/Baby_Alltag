export type Gender = 'boy' | 'girl' | 'other';

export interface Child {
  id: string;
  name: string;
  birthDate: string; // YYYY-MM-DD
  gender: Gender;
  photoUrl: string; // Avatar reference or placeholder
  weight: number; // in kg
  height: number; // in cm
  headCircumference: number; // in cm
}

export type MealCategory = 'milch' | 'brei' | 'getraenke';

export type MealSubType = 
  // Milch
  | 'Muttermilch' | 'PRE' | '1er' | '2er' | 'Spezialmilch' | 'Stillen'
  // Brei
  | 'Gemüse' | 'Obst' | 'Abendbrei' | 'Frühstück' | 'Mittag' | 'Snack'
  // Getränke
  | 'Wasser' | 'Tee' | 'Saft';

export interface MealLog {
  id: string;
  childId: string;
  timestamp: string; // ISO String
  category: MealCategory;
  subType: MealSubType;
  amount: number; // ml or g
  unit: 'ml' | 'g';
  note: string;
  loggedBy: string; // Mama, Papa, etc.
}

export interface SleepLog {
  id: string;
  childId: string;
  startTime: string; // ISO String
  endTime: string; // ISO String
  duration: number; // in minutes (calculated)
  note: string;
  loggedBy: string;
}

export type DiaperType = 'pipi' | 'gross' | 'beides';

export interface DiaperLog {
  id: string;
  childId: string;
  timestamp: string; // ISO String
  type: DiaperType;
  note: string;
  loggedBy: string;
}

export interface GrowthLog {
  id: string;
  childId: string;
  timestamp: string; // ISO String
  weight: number; // kg
  height: number; // cm
  headCircumference: number; // cm
  note: string;
  loggedBy: string;
}

export interface MedicineLog {
  id: string;
  childId: string;
  timestamp: string; // ISO String
  name: string;
  dosage: string;
  timeOfDay: string; // e.g. "Morgens", "14:00"
  reminderActive: boolean;
  note: string;
  loggedBy: string;
}

export interface AppointmentLog {
  id: string;
  childId: string;
  timestamp: string; // ISO String (Date + Time)
  title: string;
  doctor: string;
  note: string;
  reminderActive: boolean;
  loggedBy: string;
}

export interface Reminder {
  id: string;
  childId: string;
  category: 'milch' | 'brei' | 'getraenke' | 'schlaf' | 'windel' | 'medikament' | 'arzt';
  title: string;
  type: 'interval' | 'fixed';
  intervalHours?: number; // e.g. every 3 hours
  fixedTime?: string; // "HH:MM"
  lastTriggered?: string; // ISO string
  nextTriggerTime: string; // ISO string (calculated)
  enabled: boolean;
  notify30: boolean; // 30 mins before
  notify10: boolean; // 10 mins before
  notify0: boolean;  // at time
}

export type FamilyRole = 'Mama' | 'Papa' | 'Oma' | 'Opa';

export type ThemeType = 'light' | 'dark' | 'system';
export type LanguageType = 'de' | 'en';

export interface AppSettings {
  theme: ThemeType;
  language: LanguageType;
  activeFamilyRole: FamilyRole;
}
