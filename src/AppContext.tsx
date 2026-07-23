import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Child, MealLog, SleepLog, DiaperLog, GrowthLog, 
  MedicineLog, AppointmentLog, Reminder, AppSettings, FamilyRole, QuickAccessItem
} from './types';
import { 
  initialChildren, initialMealLogs, initialSleepLogs, 
  initialDiaperLogs, initialGrowthLogs, initialMedicineLogs, 
  initialAppointmentLogs, initialReminders 
} from './data';

interface AppContextType {
  children: Child[];
  activeChildId: string;
  activeChild: Child | undefined;
  mealLogs: MealLog[];
  sleepLogs: SleepLog[];
  diaperLogs: DiaperLog[];
  growthLogs: GrowthLog[];
  medicineLogs: MedicineLog[];
  appointmentLogs: AppointmentLog[];
  reminders: Reminder[];
  settings: AppSettings;
  currentUser: { email: string; role: FamilyRole } | null;
  quickAccessItems: QuickAccessItem[];
  addQuickAccessItem: (item: Omit<QuickAccessItem, 'id'>) => void;
  deleteQuickAccessItem: (id: string) => void;
  
  // State Setters & Actions
  setCurrentUser: (user: { email: string; role: FamilyRole } | null) => void;
  setActiveChildId: (id: string) => void;
  setActiveFamilyRole: (role: FamilyRole) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  
  // Children
  addChild: (child: Omit<Child, 'id'>) => void;
  updateChild: (child: Child) => void;
  deleteChild: (id: string) => void;
  
  // Log Actions (Add, Edit, Delete)
  addMealLog: (log: Omit<MealLog, 'id' | 'loggedBy'>) => void;
  editMealLog: (log: MealLog) => void;
  deleteMealLog: (id: string) => void;

  addSleepLog: (log: Omit<SleepLog, 'id' | 'loggedBy'>) => void;
  editSleepLog: (log: SleepLog) => void;
  deleteSleepLog: (id: string) => void;

  addDiaperLog: (log: Omit<DiaperLog, 'id' | 'loggedBy'>) => void;
  editDiaperLog: (log: DiaperLog) => void;
  deleteDiaperLog: (id: string) => void;

  addGrowthLog: (log: Omit<GrowthLog, 'id' | 'loggedBy'>) => void;
  editGrowthLog: (log: GrowthLog) => void;
  deleteGrowthLog: (id: string) => void;

  addMedicineLog: (log: Omit<MedicineLog, 'id' | 'loggedBy'>) => void;
  editMedicineLog: (log: MedicineLog) => void;
  deleteMedicineLog: (id: string) => void;

  addAppointmentLog: (log: Omit<AppointmentLog, 'id' | 'loggedBy'>) => void;
  editAppointmentLog: (log: AppointmentLog) => void;
  deleteAppointmentLog: (id: string) => void;

  // Reminders
  addReminder: (reminder: Omit<Reminder, 'id'>) => void;
  updateReminder: (reminder: Reminder) => void;
  deleteReminder: (id: string) => void;
  triggerReminderCheck: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial states or read from localStorage
  const [user, setUser] = useState<{ email: string; role: FamilyRole } | null>(() => {
    const stored = localStorage.getItem('babycare_user');
    return stored ? JSON.parse(stored) : { email: 'bestofsly@gmail.com', role: 'Mama' };
  });

  const [childrenList, setChildrenList] = useState<Child[]>(() => {
    const stored = localStorage.getItem('babycare_children');
    return stored ? JSON.parse(stored) : initialChildren;
  });

  const [activeChildId, setActiveChildIdState] = useState<string>(() => {
    const stored = localStorage.getItem('babycare_active_child_id');
    if (stored) return stored;
    return childrenList[0]?.id || '';
  });

  const [mealLogs, setMealLogs] = useState<MealLog[]>(() => {
    const stored = localStorage.getItem('babycare_meals');
    return stored ? JSON.parse(stored) : initialMealLogs;
  });

  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>(() => {
    const stored = localStorage.getItem('babycare_sleep');
    return stored ? JSON.parse(stored) : initialSleepLogs;
  });

  const [diaperLogs, setDiaperLogs] = useState<DiaperLog[]>(() => {
    const stored = localStorage.getItem('babycare_diapers');
    return stored ? JSON.parse(stored) : initialDiaperLogs;
  });

  const [growthLogs, setGrowthLogs] = useState<GrowthLog[]>(() => {
    const stored = localStorage.getItem('babycare_growth');
    return stored ? JSON.parse(stored) : initialGrowthLogs;
  });

  const [medicineLogs, setMedicineLogs] = useState<MedicineLog[]>(() => {
    const stored = localStorage.getItem('babycare_medicines');
    return stored ? JSON.parse(stored) : initialMedicineLogs;
  });

  const [appointmentLogs, setAppointmentLogs] = useState<AppointmentLog[]>(() => {
    const stored = localStorage.getItem('babycare_appointments');
    return stored ? JSON.parse(stored) : initialAppointmentLogs;
  });

  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const stored = localStorage.getItem('babycare_reminders');
    return stored ? JSON.parse(stored) : initialReminders;
  });

  const [quickAccessItems, setQuickAccessItems] = useState<QuickAccessItem[]>(() => {
    const stored = localStorage.getItem('babycare_quick_access');
    if (stored) return JSON.parse(stored);
    return [
      {
        id: 'quick-1',
        type: 'meal',
        title: '120 ml PRE',
        emoji: '🍼',
        mealCategory: 'milch',
        mealSubType: 'PRE',
        amount: 120,
        unit: 'ml'
      },
      {
        id: 'quick-2',
        type: 'meal',
        title: '150g Gemüse',
        emoji: '🥣',
        mealCategory: 'brei',
        mealSubType: 'Gemüse',
        amount: 150,
        unit: 'g'
      },
      {
        id: 'quick-3',
        type: 'meal',
        title: '80 ml Wasser',
        emoji: '🥤',
        mealCategory: 'getraenke',
        mealSubType: 'Wasser',
        amount: 80,
        unit: 'ml'
      }
    ];
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const stored = localStorage.getItem('babycare_settings');
    return stored ? JSON.parse(stored) : {
      theme: 'light',
      language: 'de',
      activeFamilyRole: (user?.role || 'Mama')
    };
  });

  // Sync state to localStorage on modification
  useEffect(() => {
    localStorage.setItem('babycare_user', user ? JSON.stringify(user) : '');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('babycare_children', JSON.stringify(childrenList));
    if (childrenList.length > 0 && !childrenList.some(c => c.id === activeChildId)) {
      setActiveChildIdState(childrenList[0].id);
    }
  }, [childrenList, activeChildId]);

  useEffect(() => {
    localStorage.setItem('babycare_active_child_id', activeChildId);
  }, [activeChildId]);

  useEffect(() => {
    localStorage.setItem('babycare_meals', JSON.stringify(mealLogs));
  }, [mealLogs]);

  useEffect(() => {
    localStorage.setItem('babycare_sleep', JSON.stringify(sleepLogs));
  }, [sleepLogs]);

  useEffect(() => {
    localStorage.setItem('babycare_diapers', JSON.stringify(diaperLogs));
  }, [diaperLogs]);

  useEffect(() => {
    localStorage.setItem('babycare_growth', JSON.stringify(growthLogs));
  }, [growthLogs]);

  useEffect(() => {
    localStorage.setItem('babycare_medicines', JSON.stringify(medicineLogs));
  }, [medicineLogs]);

  useEffect(() => {
    localStorage.setItem('babycare_appointments', JSON.stringify(appointmentLogs));
  }, [appointmentLogs]);

  useEffect(() => {
    localStorage.setItem('babycare_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('babycare_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('babycare_quick_access', JSON.stringify(quickAccessItems));
  }, [quickAccessItems]);

  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Derived properties
  const activeChild = childrenList.find(c => c.id === activeChildId);

  // Setters
  const setActiveChildId = (id: string) => {
    setActiveChildIdState(id);
  };

  const setActiveFamilyRole = (role: FamilyRole) => {
    setSettings(prev => ({ ...prev, activeFamilyRole: role }));
    if (user) {
      setUser({ ...user, role });
    }
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Actions: CHILDREN
  const addChild = (childData: Omit<Child, 'id'>) => {
    const id = `child-${Date.now()}`;
    const newChild = { ...childData, id };
    setChildrenList(prev => [...prev, newChild]);
    setActiveChildIdState(id);
  };

  const updateChild = (updatedChild: Child) => {
    setChildrenList(prev => prev.map(c => c.id === updatedChild.id ? updatedChild : c));
  };

  const deleteChild = (id: string) => {
    setChildrenList(prev => prev.filter(c => c.id !== id));
  };

  const currentRole = settings.activeFamilyRole || 'Mama';

  // Actions: MEALS
  const addMealLog = (logData: Omit<MealLog, 'id' | 'loggedBy'>) => {
    const newLog: MealLog = {
      ...logData,
      id: `meal-${Date.now()}`,
      loggedBy: currentRole
    };
    setMealLogs(prev => [newLog, ...prev]);
    // Auto-update growth logs if a birth record is added or similar (done manually usually)
    // Re-calculate or trigger reminder updates
    updateRemindersForCategory(logData.childId, logData.category, logData.timestamp);
  };

  const editMealLog = (updatedLog: MealLog) => {
    setMealLogs(prev => prev.map(l => l.id === updatedLog.id ? updatedLog : l));
  };

  const deleteMealLog = (id: string) => {
    setMealLogs(prev => prev.filter(l => l.id !== id));
  };

  // Actions: SLEEP
  const addSleepLog = (logData: Omit<SleepLog, 'id' | 'loggedBy'>) => {
    const newLog: SleepLog = {
      ...logData,
      id: `sleep-${Date.now()}`,
      loggedBy: currentRole
    };
    setSleepLogs(prev => [newLog, ...prev]);
  };

  const editSleepLog = (updatedLog: SleepLog) => {
    setSleepLogs(prev => prev.map(l => l.id === updatedLog.id ? updatedLog : l));
  };

  const deleteSleepLog = (id: string) => {
    setSleepLogs(prev => prev.filter(l => l.id !== id));
  };

  // Actions: DIAPERS
  const addDiaperLog = (logData: Omit<DiaperLog, 'id' | 'loggedBy'>) => {
    const newLog: DiaperLog = {
      ...logData,
      id: `diaper-${Date.now()}`,
      loggedBy: currentRole
    };
    setDiaperLogs(prev => [newLog, ...prev]);
  };

  const editDiaperLog = (updatedLog: DiaperLog) => {
    setDiaperLogs(prev => prev.map(l => l.id === updatedLog.id ? updatedLog : l));
  };

  const deleteDiaperLog = (id: string) => {
    setDiaperLogs(prev => prev.filter(l => l.id !== id));
  };

  // Actions: GROWTH
  const addGrowthLog = (logData: Omit<GrowthLog, 'id' | 'loggedBy'>) => {
    const newLog: GrowthLog = {
      ...logData,
      id: `growth-${Date.now()}`,
      loggedBy: currentRole
    };
    setGrowthLogs(prev => [newLog, ...prev]);

    // Also update the child's main record with newest weight/height
    setChildrenList(prev => prev.map(c => {
      if (c.id === logData.childId) {
        return {
          ...c,
          weight: logData.weight,
          height: logData.height,
          headCircumference: logData.headCircumference
        };
      }
      return c;
    }));
  };

  const editGrowthLog = (updatedLog: GrowthLog) => {
    setGrowthLogs(prev => prev.map(l => l.id === updatedLog.id ? updatedLog : l));
  };

  const deleteGrowthLog = (id: string) => {
    setGrowthLogs(prev => prev.filter(l => l.id !== id));
  };

  // Actions: MEDICINES
  const addMedicineLog = (logData: Omit<MedicineLog, 'id' | 'loggedBy'>) => {
    const newLog: MedicineLog = {
      ...logData,
      id: `med-${Date.now()}`,
      loggedBy: currentRole
    };
    setMedicineLogs(prev => [newLog, ...prev]);
  };

  const editMedicineLog = (updatedLog: MedicineLog) => {
    setMedicineLogs(prev => prev.map(l => l.id === updatedLog.id ? updatedLog : l));
  };

  const deleteMedicineLog = (id: string) => {
    setMedicineLogs(prev => prev.filter(l => l.id !== id));
  };

  // Actions: APPOINTMENTS
  const addAppointmentLog = (logData: Omit<AppointmentLog, 'id' | 'loggedBy'>) => {
    const newLog: AppointmentLog = {
      ...logData,
      id: `app-${Date.now()}`,
      loggedBy: currentRole
    };
    setAppointmentLogs(prev => [newLog, ...prev]);
  };

  const editAppointmentLog = (updatedLog: AppointmentLog) => {
    setAppointmentLogs(prev => prev.map(l => l.id === updatedLog.id ? updatedLog : l));
  };

  const deleteAppointmentLog = (id: string) => {
    setAppointmentLogs(prev => prev.filter(l => l.id !== id));
  };

  // Actions: REMINDERS
  const addReminder = (remData: Omit<Reminder, 'id'>) => {
    const newRem: Reminder = {
      ...remData,
      id: `rem-${Date.now()}`
    };
    setReminders(prev => [...prev, newRem]);
  };

  const updateReminder = (updatedRem: Reminder) => {
    setReminders(prev => prev.map(r => r.id === updatedRem.id ? updatedRem : r));
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  // Auto-recalculate reminders when meal logs are added
  const updateRemindersForCategory = (childId: string, category: 'milch' | 'brei' | 'getraenke', timestamp: string) => {
    setReminders(prev => prev.map(r => {
      if (r.childId === childId && r.category === category && r.type === 'interval' && r.intervalHours) {
        const lastTime = new Date(timestamp);
        const nextTime = new Date(lastTime.getTime() + r.intervalHours * 60 * 60 * 1000);
        return {
          ...r,
          lastTriggered: timestamp,
          nextTriggerTime: nextTime.toISOString()
        };
      }
      return r;
    }));
  };

  // Trigger check / recalculation of all reminders relative to current time
  const triggerReminderCheck = () => {
    setReminders(prev => prev.map(r => {
      if (!r.enabled) return r;
      
      const nowMs = Date.now();
      const nextMs = new Date(r.nextTriggerTime).getTime();
      
      // If next trigger is in the past and it is an interval, push it forward
      if (nextMs < nowMs) {
        if (r.type === 'interval' && r.intervalHours) {
          // Keep adding intervalHours until it is in the future
          let nextTime = nextMs;
          while (nextTime < nowMs) {
            nextTime += r.intervalHours * 60 * 60 * 1000;
          }
          return {
            ...r,
            nextTriggerTime: new Date(nextTime).toISOString()
          };
        } else if (r.type === 'fixed' && r.fixedTime) {
          // Set to next day same time
          const nextDate = new Date();
          const [h, m] = r.fixedTime.split(':').map(Number);
          nextDate.setHours(h, m, 0, 0);
          if (nextDate.getTime() < nowMs) {
            nextDate.setDate(nextDate.getDate() + 1);
          }
          return {
            ...r,
            nextTriggerTime: nextDate.toISOString()
          };
        }
      }
      return r;
    }));
  };

  const addQuickAccessItem = (itemData: Omit<QuickAccessItem, 'id'>) => {
    const newItem: QuickAccessItem = {
      ...itemData,
      id: `quick-${Date.now()}`
    };
    setQuickAccessItems(prev => [...prev, newItem]);
  };

  const deleteQuickAccessItem = (id: string) => {
    setQuickAccessItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <AppContext.Provider value={{
      children: childrenList,
      quickAccessItems,
      addQuickAccessItem,
      deleteQuickAccessItem,
      activeChildId,
      activeChild,
      mealLogs,
      sleepLogs,
      diaperLogs,
      growthLogs,
      medicineLogs,
      appointmentLogs,
      reminders,
      settings,
      currentUser: user,
      
      setCurrentUser: setUser,
      setActiveChildId,
      setActiveFamilyRole,
      updateSettings,
      
      addChild,
      updateChild,
      deleteChild,
      
      addMealLog,
      editMealLog,
      deleteMealLog,
      
      addSleepLog,
      editSleepLog,
      deleteSleepLog,
      
      addDiaperLog,
      editDiaperLog,
      deleteDiaperLog,
      
      addGrowthLog,
      editGrowthLog,
      deleteGrowthLog,
      
      addMedicineLog,
      editMedicineLog,
      deleteMedicineLog,
      
      addAppointmentLog,
      editAppointmentLog,
      deleteAppointmentLog,
      
      addReminder,
      updateReminder,
      deleteReminder,
      triggerReminderCheck
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
