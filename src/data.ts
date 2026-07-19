import { Child, MealLog, SleepLog, DiaperLog, GrowthLog, MedicineLog, AppointmentLog, Reminder } from './types';

const now = new Date();

// Helper to get ISO strings relative to current date
export const getRelativeISO = (daysAgo: number, hours: number, minutes: number = 0) => {
  const d = new Date(now);
  d.setDate(now.getDate() - daysAgo);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
};

export const initialChildren: Child[] = [
  {
    id: 'child-1',
    name: 'Mia',
    birthDate: getRelativeISO(120, 10).split('T')[0], // exactly 4 months old (120 days)
    gender: 'girl',
    photoUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eb2?w=150&h=150&fit=crop&crop=faces&q=80',
    weight: 6.2,
    height: 61,
    headCircumference: 40.5
  },
  {
    id: 'child-2',
    name: 'Noah',
    birthDate: getRelativeISO(540, 10).split('T')[0], // exactly 18 months old (540 days)
    gender: 'boy',
    photoUrl: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=150&h=150&fit=crop&crop=faces&q=80',
    weight: 11.5,
    height: 82,
    headCircumference: 47.2
  }
];

// Rich set of meal logs for Mia (child-1) and Noah (child-2) spanning the last 7 days
export const initialMealLogs: MealLog[] = [
  // MIA (child-1) - mostly Milch & some early porridge (Brei)
  {
    id: 'meal-1',
    childId: 'child-1',
    timestamp: getRelativeISO(0, 7, 30), // Today 07:30
    category: 'milch',
    subType: 'Muttermilch',
    amount: 150,
    unit: 'ml',
    note: 'Gut getrunken, danach eingeschlafen.',
    loggedBy: 'Mama'
  },
  {
    id: 'meal-2',
    childId: 'child-1',
    timestamp: getRelativeISO(0, 11, 15), // Today 11:15
    category: 'milch',
    subType: 'PRE',
    amount: 120,
    unit: 'ml',
    note: 'Schnell ausgetrunken.',
    loggedBy: 'Papa'
  },
  {
    id: 'meal-3',
    childId: 'child-1',
    timestamp: getRelativeISO(0, 14, 45), // Today 14:45
    category: 'brei',
    subType: 'Gemüse',
    amount: 80,
    unit: 'g',
    note: 'Frühkarotte. Fand sie okay.',
    loggedBy: 'Mama'
  },
  {
    id: 'meal-4',
    childId: 'child-1',
    timestamp: getRelativeISO(1, 8, 0), // Yesterday 08:00
    category: 'milch',
    subType: 'Muttermilch',
    amount: 160,
    unit: 'ml',
    note: '',
    loggedBy: 'Mama'
  },
  {
    id: 'meal-5',
    childId: 'child-1',
    timestamp: getRelativeISO(1, 12, 0), // Yesterday 12:00
    category: 'brei',
    subType: 'Gemüse',
    amount: 70,
    unit: 'g',
    note: 'Kürbisbrei.',
    loggedBy: 'Papa'
  },
  {
    id: 'meal-6',
    childId: 'child-1',
    timestamp: getRelativeISO(1, 15, 30), // Yesterday 15:30
    category: 'milch',
    subType: 'PRE',
    amount: 140,
    unit: 'ml',
    note: 'Wirkte sehr hungrig.',
    loggedBy: 'Oma'
  },
  {
    id: 'meal-7',
    childId: 'child-1',
    timestamp: getRelativeISO(2, 7, 15), // 2 Days Ago 07:15
    category: 'milch',
    subType: 'Muttermilch',
    amount: 150,
    unit: 'ml',
    note: '',
    loggedBy: 'Mama'
  },
  {
    id: 'meal-8',
    childId: 'child-1',
    timestamp: getRelativeISO(2, 11, 45), // 2 Days Ago 11:45
    category: 'milch',
    subType: 'PRE',
    amount: 130,
    unit: 'ml',
    note: '',
    loggedBy: 'Mama'
  },
  {
    id: 'meal-9',
    childId: 'child-1',
    timestamp: getRelativeISO(3, 8, 0), // 3 Days Ago 08:00
    category: 'milch',
    subType: 'Muttermilch',
    amount: 170,
    unit: 'ml',
    note: 'Super Start in den Tag.',
    loggedBy: 'Mama'
  },
  {
    id: 'meal-10',
    childId: 'child-1',
    timestamp: getRelativeISO(3, 13, 0), // 3 Days Ago 13:00
    category: 'milch',
    subType: 'PRE',
    amount: 120,
    unit: 'ml',
    note: '',
    loggedBy: 'Papa'
  },

  // NOAH (child-2) - mostly Brei, Snacks & Getränke
  {
    id: 'meal-n1',
    childId: 'child-2',
    timestamp: getRelativeISO(0, 8, 30), // Today 08:30
    category: 'brei',
    subType: 'Frühstück',
    amount: 180,
    unit: 'g',
    note: 'Haferbrei mit Banane.',
    loggedBy: 'Papa'
  },
  {
    id: 'meal-n2',
    childId: 'child-2',
    timestamp: getRelativeISO(0, 10, 0), // Today 10:00
    category: 'getraenke',
    subType: 'Wasser',
    amount: 100,
    unit: 'ml',
    note: 'Aus dem Becher getrunken.',
    loggedBy: 'Papa'
  },
  {
    id: 'meal-n3',
    childId: 'child-2',
    timestamp: getRelativeISO(0, 12, 30), // Today 12:30
    category: 'brei',
    subType: 'Mittag',
    amount: 220,
    unit: 'g',
    note: 'Kartoffel-Gemüse-Auflauf püriert/zerdrückt.',
    loggedBy: 'Mama'
  },
  {
    id: 'meal-n4',
    childId: 'child-2',
    timestamp: getRelativeISO(0, 15, 30), // Today 15:30
    category: 'getraenke',
    subType: 'Tee',
    amount: 80,
    unit: 'ml',
    note: 'Fencheltee.',
    loggedBy: 'Mama'
  },
  {
    id: 'meal-n5',
    childId: 'child-2',
    timestamp: getRelativeISO(1, 8, 30), // Yesterday 08:30
    category: 'brei',
    subType: 'Frühstück',
    amount: 160,
    unit: 'g',
    note: 'Grießbrei mit Apfelmark.',
    loggedBy: 'Mama'
  },
  {
    id: 'meal-n6',
    childId: 'child-2',
    timestamp: getRelativeISO(1, 12, 15), // Yesterday 12:15
    category: 'brei',
    subType: 'Mittag',
    amount: 200,
    unit: 'g',
    note: 'Nudeln mit Tomaten-Gemüsesauce.',
    loggedBy: 'Papa'
  },
  {
    id: 'meal-n7',
    childId: 'child-2',
    timestamp: getRelativeISO(1, 16, 0), // Yesterday 16:00
    category: 'brei',
    subType: 'Snack',
    amount: 90,
    unit: 'g',
    note: 'Zerdrückte Banane.',
    loggedBy: 'Oma'
  },
  {
    id: 'meal-n8',
    childId: 'child-2',
    timestamp: getRelativeISO(1, 18, 30), // Yesterday 18:30
    category: 'brei',
    subType: 'Abendbrei',
    amount: 190,
    unit: 'g',
    note: 'Milch-Getreide-Brei.',
    loggedBy: 'Mama'
  },
  {
    id: 'meal-n9',
    childId: 'child-2',
    timestamp: getRelativeISO(2, 12, 30), // 2 Days Ago 12:30
    category: 'brei',
    subType: 'Mittag',
    amount: 240,
    unit: 'g',
    note: 'Linseneintopf für Babys.',
    loggedBy: 'Papa'
  }
];

// Sleep logs
export const initialSleepLogs: SleepLog[] = [
  // Mia (child-1) - sleeps often
  {
    id: 'sleep-1',
    childId: 'child-1',
    startTime: getRelativeISO(0, 9, 0), // Today 09:00 - 10:30
    endTime: getRelativeISO(0, 10, 30),
    duration: 90,
    note: 'Sanft eingeschlafen.',
    loggedBy: 'Mama'
  },
  {
    id: 'sleep-2',
    childId: 'child-1',
    startTime: getRelativeISO(0, 13, 0), // Today 13:00 - 14:15
    endTime: getRelativeISO(0, 14, 15),
    duration: 75,
    note: 'Durch ein Geräusch aufgewacht.',
    loggedBy: 'Papa'
  },
  {
    id: 'sleep-3',
    childId: 'child-1',
    startTime: getRelativeISO(1, 10, 0), // Yesterday 10:00 - 12:00
    endTime: getRelativeISO(1, 12, 0),
    duration: 120,
    note: 'Sehr tiefer Schlaf.',
    loggedBy: 'Mama'
  },
  {
    id: 'sleep-4',
    childId: 'child-1',
    startTime: getRelativeISO(1, 14, 30), // Yesterday 14:30 - 15:30
    endTime: getRelativeISO(1, 15, 30),
    duration: 60,
    note: '',
    loggedBy: 'Oma'
  },
  {
    id: 'sleep-5',
    childId: 'child-1',
    startTime: getRelativeISO(2, 9, 30), // 2 Days Ago 09:30 - 11:30
    endTime: getRelativeISO(2, 11, 30),
    duration: 120,
    note: '',
    loggedBy: 'Mama'
  },

  // Noah (child-2) - Mittagsschlaf
  {
    id: 'sleep-n1',
    childId: 'child-2',
    startTime: getRelativeISO(0, 13, 0), // Today 13:00 - 15:00
    endTime: getRelativeISO(0, 15, 0),
    duration: 120,
    note: 'Sein gewohnter Mittagsschlaf.',
    loggedBy: 'Mama'
  },
  {
    id: 'sleep-n2',
    childId: 'child-2',
    startTime: getRelativeISO(1, 12, 45), // Yesterday 12:45 - 14:30
    endTime: getRelativeISO(1, 14, 30),
    duration: 105,
    note: '',
    loggedBy: 'Papa'
  },
  {
    id: 'sleep-n3',
    childId: 'child-2',
    startTime: getRelativeISO(2, 13, 0), // 2 Days Ago
    endTime: getRelativeISO(2, 14, 45),
    duration: 105,
    note: '',
    loggedBy: 'Mama'
  }
];

// Diaper logs
export const initialDiaperLogs: DiaperLog[] = [
  // Mia (child-1)
  {
    id: 'diaper-1',
    childId: 'child-1',
    timestamp: getRelativeISO(0, 8, 15), // Today
    type: 'beides',
    note: 'Sehr voll.',
    loggedBy: 'Mama'
  },
  {
    id: 'diaper-2',
    childId: 'child-1',
    timestamp: getRelativeISO(0, 12, 0),
    type: 'pipi',
    note: '',
    loggedBy: 'Papa'
  },
  {
    id: 'diaper-3',
    childId: 'child-1',
    timestamp: getRelativeISO(0, 16, 0),
    type: 'pipi',
    note: '',
    loggedBy: 'Mama'
  },
  {
    id: 'diaper-4',
    childId: 'child-1',
    timestamp: getRelativeISO(1, 7, 45), // Yesterday
    type: 'beides',
    note: '',
    loggedBy: 'Mama'
  },
  {
    id: 'diaper-5',
    childId: 'child-1',
    timestamp: getRelativeISO(1, 13, 0),
    type: 'gross',
    note: '',
    loggedBy: 'Papa'
  },

  // Noah (child-2)
  {
    id: 'diaper-n1',
    childId: 'child-2',
    timestamp: getRelativeISO(0, 9, 0), // Today
    type: 'pipi',
    note: '',
    loggedBy: 'Papa'
  },
  {
    id: 'diaper-n2',
    childId: 'child-2',
    timestamp: getRelativeISO(0, 15, 30),
    type: 'gross',
    note: 'Normaler Stuhl.',
    loggedBy: 'Mama'
  },
  {
    id: 'diaper-n3',
    childId: 'child-2',
    timestamp: getRelativeISO(1, 9, 30), // Yesterday
    type: 'beides',
    note: '',
    loggedBy: 'Mama'
  }
];

// Growth logs (history over months)
export const initialGrowthLogs: GrowthLog[] = [
  // Mia (child-1)
  {
    id: 'growth-1',
    childId: 'child-1',
    timestamp: getRelativeISO(120, 12), // Birth
    weight: 3.2,
    height: 50,
    headCircumference: 34.0,
    note: 'Geburt.',
    loggedBy: 'Hebamme'
  },
  {
    id: 'growth-2',
    childId: 'child-1',
    timestamp: getRelativeISO(90, 12), // 1 Month
    weight: 4.1,
    height: 53.5,
    headCircumference: 36.2,
    note: 'U3 Untersuchung.',
    loggedBy: 'Mama'
  },
  {
    id: 'growth-3',
    childId: 'child-1',
    timestamp: getRelativeISO(60, 12), // 2 Month
    weight: 4.9,
    height: 56.0,
    headCircumference: 37.8,
    note: 'Entwickelt sich prächtig.',
    loggedBy: 'Mama'
  },
  {
    id: 'growth-4',
    childId: 'child-1',
    timestamp: getRelativeISO(30, 12), // 3 Month
    weight: 5.6,
    height: 58.5,
    headCircumference: 39.1,
    note: '',
    loggedBy: 'Papa'
  },
  {
    id: 'growth-5',
    childId: 'child-1',
    timestamp: getRelativeISO(0, 12), // 4 Month (Today)
    weight: 6.2,
    height: 61,
    headCircumference: 40.5,
    note: 'U4 Untersuchung heute gemacht.',
    loggedBy: 'Mama'
  },

  // Noah (child-2)
  {
    id: 'growth-n1',
    childId: 'child-2',
    timestamp: getRelativeISO(540, 12), // Birth
    weight: 3.5,
    height: 51,
    headCircumference: 35.0,
    note: 'Geburt.',
    loggedBy: 'Hebamme'
  },
  {
    id: 'growth-n2',
    childId: 'child-2',
    timestamp: getRelativeISO(360, 12), // 6 Months
    weight: 7.8,
    height: 67,
    headCircumference: 43.0,
    note: '',
    loggedBy: 'Mama'
  },
  {
    id: 'growth-n3',
    childId: 'child-2',
    timestamp: getRelativeISO(180, 12), // 12 Months
    weight: 9.8,
    height: 75,
    headCircumference: 45.5,
    note: 'U6 Untersuchung.',
    loggedBy: 'Mama'
  },
  {
    id: 'growth-n4',
    childId: 'child-2',
    timestamp: getRelativeISO(0, 12), // 18 Months (Today)
    weight: 11.5,
    height: 82,
    headCircumference: 47.2,
    note: 'Aktueller Stand.',
    loggedBy: 'Papa'
  }
];

// Medicine logs
export const initialMedicineLogs: MedicineLog[] = [
  // Mia
  {
    id: 'med-1',
    childId: 'child-1',
    timestamp: getRelativeISO(0, 9, 0), // Today
    name: 'Vitamin D3 + Fluorid',
    dosage: '1 Tablette',
    timeOfDay: 'Morgens',
    reminderActive: true,
    note: 'In etwas Muttermilch aufgelöst.',
    loggedBy: 'Mama'
  },
  {
    id: 'med-2',
    childId: 'child-1',
    timestamp: getRelativeISO(1, 9, 0), // Yesterday
    name: 'Vitamin D3 + Fluorid',
    dosage: '1 Tablette',
    timeOfDay: 'Morgens',
    reminderActive: true,
    note: '',
    loggedBy: 'Papa'
  },

  // Noah
  {
    id: 'med-n1',
    childId: 'child-2',
    timestamp: getRelativeISO(1, 18, 0), // Yesterday
    name: 'Dentinox Zahnungsgel',
    dosage: 'Erbsengröße',
    timeOfDay: 'Bedarf (Zahnschmerzen)',
    reminderActive: false,
    note: 'Für die Backenzähne.',
    loggedBy: 'Mama'
  }
];

// Doctor appointments
export const initialAppointmentLogs: AppointmentLog[] = [
  // Mia
  {
    id: 'app-1',
    childId: 'child-1',
    timestamp: getRelativeISO(0, 10, 0), // Today (Finished)
    title: 'U4 Untersuchung & Impfung',
    doctor: 'Dr. Med. Julia Becker',
    note: '6-fach Impfung erhalten. Nächster Termin im August.',
    reminderActive: true,
    loggedBy: 'Mama'
  },
  {
    id: 'app-2',
    childId: 'child-1',
    timestamp: getRelativeISO(-45, 11, 0), // Future (In 45 days)
    title: 'U5 Untersuchung',
    doctor: 'Dr. Med. Julia Becker',
    note: 'Bitte Impfpass mitbringen.',
    reminderActive: true,
    loggedBy: 'Mama'
  },

  // Noah
  {
    id: 'app-n1',
    childId: 'child-2',
    timestamp: getRelativeISO(-60, 9, 30), // Future (In 60 days)
    title: 'U7 Untersuchung (2-Jahres-Check)',
    doctor: 'Dr. Med. Julia Becker',
    note: 'Termin vereinbart.',
    reminderActive: true,
    loggedBy: 'Papa'
  }
];

// Initial Reminders
export const initialReminders: Reminder[] = [
  // Mia (needs feeding every 3 hours)
  {
    id: 'rem-1',
    childId: 'child-1',
    category: 'milch',
    title: 'Nächste Milchmahlzeit',
    type: 'interval',
    intervalHours: 3.5,
    lastTriggered: getRelativeISO(0, 11, 15), // Last fed today at 11:15
    nextTriggerTime: getRelativeISO(0, 14, 45), // 11:15 + 3.5 hours = 14:45 (Already triggered/passed, next calculation will roll over)
    enabled: true,
    notify30: true,
    notify10: true,
    notify0: true
  },
  {
    id: 'rem-2',
    childId: 'child-1',
    category: 'medikament',
    title: 'Vitamin D3 verabreichen',
    type: 'fixed',
    fixedTime: '09:00',
    nextTriggerTime: getRelativeISO(-1, 9, 0), // Tomorrow 09:00 (since today already done or set to tomorrow)
    enabled: true,
    notify30: false,
    notify10: true,
    notify0: true
  },

  // Noah
  {
    id: 'rem-n1',
    childId: 'child-2',
    category: 'brei',
    title: 'Mittagessen',
    type: 'fixed',
    fixedTime: '12:30',
    nextTriggerTime: getRelativeISO(-1, 12, 30),
    enabled: true,
    notify30: true,
    notify10: true,
    notify0: true
  }
];
