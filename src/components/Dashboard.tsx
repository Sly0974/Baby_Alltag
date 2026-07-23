import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { 
  formatDate, formatTime, getBabyAge, calculateMealStats, 
  calculateSleepStats, calculateDiaperStats, getCountdownString 
} from '../utils';
import { MealCategory, MealSubType, QuickAccessItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, Plus, Coffee, Moon, Sparkles, AlertCircle, 
  Trash2, User, ChevronRight, Activity, Zap, Check, Clock,
  Edit2, X, SlidersHorizontal
} from 'lucide-react';

export default function Dashboard() {
  const { 
    activeChild, children, setActiveChildId, mealLogs, sleepLogs, 
    diaperLogs, reminders, addMealLog, activeChildId,
    addSleepLog, addDiaperLog, addMedicineLog,
    quickAccessItems, addQuickAccessItem, deleteQuickAccessItem
  } = useApp();

  const [quickSuccess, setQuickSuccess] = useState(false);
  const [countdown, setCountdown] = useState({ text: '--:--', urgent: false });

  // Quick access customization state
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Custom quick-access form fields
  const [newType, setNewType] = useState<'meal' | 'sleep' | 'diaper' | 'medicine'>('meal');
  const [newTitle, setNewTitle] = useState('');
  const [newEmoji, setNewEmoji] = useState('🍼');
  
  // Meal fields
  const [newMealCategory, setNewMealCategory] = useState<'milch' | 'brei' | 'getraenke'>('milch');
  const [newMealSubType, setNewMealSubType] = useState('PRE');
  const [newAmount, setNewAmount] = useState<number>(120);
  const [newUnit, setNewUnit] = useState<'ml' | 'g'>('ml');
  
  // Sleep fields
  const [newDuration, setNewDuration] = useState<number>(60);
  
  // Diaper fields
  const [newDiaperType, setNewDiaperType] = useState<'pipi' | 'gross' | 'beides'>('pipi');
  
  // Medicine fields
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');

  // Update default emoji depending on type/category selection
  useEffect(() => {
    if (newType === 'meal') {
      if (newMealCategory === 'milch') setNewEmoji('🍼');
      else if (newMealCategory === 'brei') setNewEmoji('🥣');
      else if (newMealCategory === 'getraenke') setNewEmoji('🥤');
    } else if (newType === 'sleep') {
      setNewEmoji('😴');
    } else if (newType === 'diaper') {
      if (newDiaperType === 'pipi') setNewEmoji('💧');
      else if (newDiaperType === 'gross') setNewEmoji('💩');
      else if (newDiaperType === 'beides') setNewEmoji('✨');
    } else if (newType === 'medicine') {
      setNewEmoji('💊');
    }
  }, [newType, newMealCategory, newDiaperType]);

  // Filter reminders for the active child
  const childReminders = reminders.filter(r => r.childId === activeChildId && r.enabled);
  const nextReminder = childReminders.length > 0 
    ? [...childReminders].sort((a, b) => new Date(a.nextTriggerTime).getTime() - new Date(b.nextTriggerTime).getTime())[0]
    : null;

  // Refresh countdown timer every 10 seconds
  useEffect(() => {
    if (!nextReminder) {
      setCountdown({ text: '--:--', urgent: false });
      return;
    }
    const update = () => {
      setCountdown(getCountdownString(nextReminder.nextTriggerTime));
    };
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, [nextReminder]);

  if (!activeChild) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[70vh]">
        <div className="text-4xl mb-4">👶</div>
        <h3 className="text-xl font-bold text-slate-800">Noch kein Baby-Profil angelegt</h3>
        <p className="text-slate-500 mt-2 max-w-sm text-sm">Bitte erstelle ein Baby-Profil im Profil-Tab, um das Dashboard zu nutzen.</p>
      </div>
    );
  }

  // Calculate statistics for the active child
  const mealStats = calculateMealStats(mealLogs, activeChild.id);
  const sleepStats = calculateSleepStats(sleepLogs, activeChild.id);
  const diaperStats = calculateDiaperStats(diaperLogs, activeChild.id);

  // Quick log execution
  const handleExecuteQuickAccess = (item: QuickAccessItem) => {
    const timestamp = new Date().toISOString();
    
    if (item.type === 'meal' && item.mealCategory) {
      addMealLog({
        childId: activeChild.id,
        timestamp,
        category: item.mealCategory,
        subType: (item.mealSubType || '') as any,
        amount: item.amount || 0,
        unit: item.unit || 'ml',
        note: 'Schnellzugriff'
      });
    } else if (item.type === 'sleep') {
      const duration = item.durationMinutes || 60;
      const start = new Date(Date.now() - duration * 60 * 1000);
      addSleepLog({
        childId: activeChild.id,
        startTime: start.toISOString(),
        endTime: timestamp,
        duration,
        note: 'Schnellzugriff'
      });
    } else if (item.type === 'diaper' && item.diaperType) {
      addDiaperLog({
        childId: activeChild.id,
        timestamp,
        type: item.diaperType,
        note: 'Schnellzugriff'
      });
    } else if (item.type === 'medicine' && item.medName) {
      addMedicineLog({
        childId: activeChild.id,
        timestamp,
        name: item.medName,
        dosage: item.medDosage || '',
        timeOfDay: new Date(timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
        reminderActive: false,
        note: 'Schnellzugriff'
      });
    }
    
    setQuickSuccess(true);
    setTimeout(() => setQuickSuccess(false), 2000);
  };

  const handleAddQuickAccess = (e: React.FormEvent) => {
    e.preventDefault();
    
    let title = newTitle.trim();
    if (!title) {
      if (newType === 'meal') {
        title = `${newAmount}${newUnit} ${newMealSubType}`;
      } else if (newType === 'sleep') {
        title = `${newDuration} Min. Schlaf`;
      } else if (newType === 'diaper') {
        title = newDiaperType === 'pipi' ? 'Windel Pipi' : newDiaperType === 'gross' ? 'Windel Groß' : 'Windel Beides';
      } else if (newType === 'medicine') {
        title = `${newMedName} (${newMedDosage})`;
      }
    }
    
    addQuickAccessItem({
      type: newType,
      title,
      emoji: newEmoji,
      mealCategory: newType === 'meal' ? newMealCategory : undefined,
      mealSubType: newType === 'meal' ? (newMealSubType as any) : undefined,
      amount: newType === 'meal' ? newAmount : undefined,
      unit: newType === 'meal' ? newUnit : undefined,
      durationMinutes: newType === 'sleep' ? newDuration : undefined,
      diaperType: newType === 'diaper' ? newDiaperType : undefined,
      medName: newType === 'medicine' ? newMedName : undefined,
      medDosage: newType === 'medicine' ? newMedDosage : undefined,
    });
    
    setNewTitle('');
    setNewMedName('');
    setNewMedDosage('');
    setIsAdding(false);
  };

  const babyAge = getBabyAge(activeChild.birthDate);
  const genderGradient = activeChild.gender === 'girl' 
    ? 'from-pink-50 to-rose-100/70 border-pink-100' 
    : activeChild.gender === 'boy' 
    ? 'from-[#eef2ff] to-[#e0e7ff] border-indigo-100' 
    : 'from-purple-50 to-indigo-100/70 border-purple-100';

  const genderText = activeChild.gender === 'girl' ? 'text-rose-600 bg-rose-50' : activeChild.gender === 'boy' ? 'text-indigo-600 bg-indigo-50' : 'text-violet-600 bg-violet-50';

  return (
    <div className="space-y-6">
      {/* Top Welcome / Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-1.5">
            Hallo <span className="wave inline-block text-2xl">👋</span>
          </h2>
          <p className="text-gray-500 text-sm">Hier ist die Übersicht für den heutigen Tag.</p>
        </div>

        {/* Baby Selector Pills */}
        <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-2xl border border-gray-200/50 self-start">
          {children.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveChildId(c.id)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                c.id === activeChild.id 
                  ? 'bg-white text-indigo-600 shadow-sm border border-indigo-50' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Baby card */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-[32px] border p-6 bg-gradient-to-br ${genderGradient} shadow-xl shadow-indigo-100/30`}
      >
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/20 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          {/* Baby Photo */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-200 to-pink-200 p-1 shadow-md">
              <img 
                src={activeChild.photoUrl || 'https://images.unsplash.com/photo-1519689680058-324335c77eb2?w=150&h=150&fit=crop'} 
                alt={activeChild.name}
                referrerPolicy="no-referrer"
                className="w-full h-full rounded-full object-cover bg-white"
              />
            </div>
            <span className={`absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-sm border border-white font-bold ${genderText}`}>
              {activeChild.gender === 'girl' ? '♀' : activeChild.gender === 'boy' ? '♂' : '👶'}
            </span>
          </div>

          {/* Baby Info */}
          <div className="text-center md:text-left space-y-1.5 flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">{activeChild.name}</h1>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${genderText} md:self-center self-center`}>
                {babyAge}
              </span>
            </div>
            
            <p className="text-gray-500 text-xs font-semibold">Geboren am {new Date(activeChild.birthDate).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}</p>

            {/* Growth Metrics */}
            <div className="grid grid-cols-3 gap-2 mt-4 max-w-sm bg-white/60 backdrop-blur-xs rounded-2xl p-2.5 border border-white/80 text-gray-700">
              <div className="text-center">
                <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Gewicht</span>
                <span className="text-sm font-bold text-indigo-950">{activeChild.weight.toFixed(1)} kg</span>
              </div>
              <div className="text-center border-x border-indigo-100/50">
                <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Größe</span>
                <span className="text-sm font-bold text-indigo-950">{activeChild.height} cm</span>
              </div>
              <div className="text-center">
                <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Kopf</span>
                <span className="text-sm font-bold text-indigo-950">{activeChild.headCircumference} cm</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Grid: Bento Boxes for Summary Today */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Milch */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="bg-sky-50/40 hover:bg-sky-50 border border-sky-100/70 rounded-[24px] p-4 flex flex-col justify-between h-36 transition-all shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100/50">Milch</span>
            <span className="text-lg">🍼</span>
          </div>
          <div>
            <span className="block text-2xl font-black text-gray-800">{mealStats.totalMilchHeute} <span className="text-xs font-bold text-gray-400">ml</span></span>
            <span className="text-[10px] text-gray-500 font-semibold">Woche: {mealStats.totalMilchWoche} ml</span>
          </div>
        </motion.div>

        {/* Brei */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="bg-orange-50/40 hover:bg-orange-50 border border-orange-100/70 rounded-[24px] p-4 flex flex-col justify-between h-36 transition-all shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100/50">Brei</span>
            <span className="text-lg">🥣</span>
          </div>
          <div>
            <span className="block text-2xl font-black text-gray-800">{mealStats.totalBreiHeute} <span className="text-xs font-bold text-gray-400">g</span></span>
            <span className="text-[10px] text-gray-500 font-semibold">Woche: {mealStats.totalBreiWoche} g</span>
          </div>
        </motion.div>

        {/* Getränke */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="bg-emerald-50/40 hover:bg-emerald-50 border border-emerald-100/70 rounded-[24px] p-4 flex flex-col justify-between h-36 transition-all shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100/50">Getränke</span>
            <span className="text-lg">🥤</span>
          </div>
          <div>
            <span className="block text-2xl font-black text-gray-800">{mealStats.totalGetraenkeHeute} <span className="text-xs font-bold text-gray-400">ml</span></span>
            <span className="text-[10px] text-gray-500 font-semibold">Woche: {mealStats.totalGetraenkeWoche} ml</span>
          </div>
        </motion.div>

        {/* Schlaf */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="bg-indigo-50/40 hover:bg-indigo-50 border border-indigo-100/70 rounded-[24px] p-4 flex flex-col justify-between h-36 transition-all shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100/50">Schlaf</span>
            <Moon className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <span className="block text-2xl font-black text-gray-800">
              {Math.floor(sleepStats.totalSchlafHeute / 60)}<span className="text-xs font-bold text-gray-400">h</span> {sleepStats.totalSchlafHeute % 60}<span className="text-xs font-bold text-gray-400">m</span>
            </span>
            <span className="text-[10px] text-gray-500 font-semibold">Ø: {Math.floor(sleepStats.avgSchlafProTag / 60)}h {sleepStats.avgSchlafProTag % 60}m</span>
          </div>
        </motion.div>

        {/* Windeln */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="bg-pink-50/40 hover:bg-pink-50 border border-pink-100/70 rounded-[24px] p-4 flex flex-col justify-between h-36 transition-all col-span-2 md:col-span-1 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full border border-pink-100/50">Windeln</span>
            <span className="text-lg">🧷</span>
          </div>
          <div>
            <span className="block text-2xl font-black text-gray-800">{diaperStats.totalHeute} <span className="text-xs font-bold text-gray-400">Wechsel</span></span>
            <div className="flex items-center gap-1 text-[9px] text-gray-500 mt-1 font-bold">
              <span className="bg-sky-50 text-sky-700 px-1 py-0.5 rounded border border-sky-100">💧 {diaperStats.pipiCount}</span>
              <span className="bg-orange-50 text-orange-700 px-1 py-0.5 rounded border border-orange-100">💩 {diaperStats.grossCount}</span>
              <span className="bg-indigo-50 text-indigo-700 px-1 py-0.5 rounded border border-indigo-100">✨ {diaperStats.beidesCount}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Two Columns: Reminder/Countdown & Quick-Log */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reminder Countdown Box */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/50 p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            Nächste Mahlzeit & Erinnerung
          </h3>

          {nextReminder ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xl font-bold text-gray-800">{nextReminder.title}</h4>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5 font-medium">
                    {nextReminder.category === 'milch' ? '🍼 Milch' : nextReminder.category === 'brei' ? '🥣 Brei' : '🥤 Getränk'}
                    <span>•</span>
                    Geplant um {new Date(nextReminder.nextTriggerTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className={`px-4 py-2 rounded-2xl font-black text-sm shadow-sm border shrink-0 ${
                  countdown.urgent 
                    ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white border-transparent animate-pulse' 
                    : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                }`}>
                  {countdown.text}
                </div>
              </div>

              {/* Countdown Progress Slider representation */}
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: countdown.urgent ? '90%' : '50%' }}
                  className={`h-full rounded-full ${countdown.urgent ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-[#748FFC]'}`}
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-indigo-50/50 rounded-2xl text-[11px] text-indigo-950 border border-indigo-100/50 font-medium">
                <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>
                  Benachrichtigungen sind aktiv (30 Min vorher, 10 Min vorher, bei Fälligkeit).
                </span>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-gray-400 text-xs space-y-2">
              <p>Keine aktiven Erinnerungen für {activeChild.name} geplant.</p>
              <p className="text-[10px] text-gray-500">Du kannst im Tab "Erinnerungen" feste Zeiten oder Stundenintervalle anlegen.</p>
            </div>
          )}
        </div>

        {/* Quick Log Form */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/50 p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#748FFC]" />
                Schnellzugriff (1-Klick)
              </h3>
              <p className="text-xs text-gray-500">Schnelles Protokollieren mit deinen Vorlagen.</p>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(!isEditing);
                  if (isAdding) setIsAdding(false);
                }}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isEditing 
                    ? 'bg-amber-50 text-amber-600 border border-amber-200' 
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'
                }`}
                title="Schnellzugriff bearbeiten"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(!isAdding);
                  if (isEditing) setIsEditing(false);
                }}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isAdding 
                    ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' 
                    : 'bg-[#748FFC] text-white hover:bg-[#5c7cfa] shadow-sm'
                }`}
                title="Vorlage hinzufügen"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isAdding ? (
              <motion.form
                key="add-form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddQuickAccess}
                className="bg-slate-50/50 p-4 rounded-[24px] border border-slate-100 space-y-3 overflow-hidden text-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-700">Neue Schnellvorlage</span>
                  <button 
                    type="button" 
                    onClick={() => setIsAdding(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Type selector */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Kategorie</label>
                  <div className="grid grid-cols-4 gap-1 bg-white p-1 rounded-xl border border-slate-100">
                    {(['meal', 'sleep', 'diaper', 'medicine'] as const).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setNewType(t)}
                        className={`py-1.5 rounded-lg font-bold text-[10px] text-center transition-all cursor-pointer ${
                          newType === t 
                            ? 'bg-[#748FFC] text-white shadow-xs' 
                            : 'text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {t === 'meal' ? 'Mahlzeit' : t === 'sleep' ? 'Schlaf' : t === 'diaper' ? 'Windel' : 'Medizin'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conditional Fields based on Type */}
                {newType === 'meal' && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500">Mahlzeittyp</label>
                        <select
                          value={newMealCategory}
                          onChange={(e) => setNewMealCategory(e.target.value as any)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 outline-none font-medium"
                        >
                          <option value="milch">🥛 Milch</option>
                          <option value="brei">🥣 Brei / Beikost</option>
                          <option value="getraenke">🥤 Getränk</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500">Name (z.B. PRE, Wasser, Brei)</label>
                        <input
                          type="text"
                          required
                          value={newMealSubType}
                          onChange={(e) => setNewMealSubType(e.target.value)}
                          placeholder="z.B. PRE"
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 outline-none font-medium text-slate-700"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500">Menge</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={newAmount}
                          onChange={(e) => setNewAmount(Number(e.target.value))}
                          placeholder="z.B. 120"
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 outline-none font-medium text-slate-700"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500">Einheit</label>
                        <div className="grid grid-cols-2 gap-1 bg-white p-1 rounded-xl border border-slate-100">
                          {(['ml', 'g'] as const).map(u => (
                            <button
                              key={u}
                              type="button"
                              onClick={() => setNewUnit(u)}
                              className={`py-1 rounded-lg font-bold text-center transition-all cursor-pointer ${
                                newUnit === u 
                                  ? 'bg-[#748FFC] text-white' 
                                  : 'text-slate-500 hover:bg-slate-50'
                              }`}
                            >
                              {u}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {newType === 'sleep' && (
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Dauer (in Minuten)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newDuration}
                      onChange={(e) => setNewDuration(Number(e.target.value))}
                      placeholder="z.B. 60"
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 outline-none font-medium text-slate-700"
                    />
                  </div>
                )}

                {newType === 'diaper' && (
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Inhalt</label>
                    <select
                      value={newDiaperType}
                      onChange={(e) => setNewDiaperType(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 outline-none font-medium text-slate-700"
                    >
                      <option value="pipi">💧 Nass (Pipi)</option>
                      <option value="gross">💩 Stuhl (Groß)</option>
                      <option value="beides">✨ Beides (Nass + Stuhl)</option>
                    </select>
                  </div>
                )}

                {newType === 'medicine' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500">Medikament</label>
                      <input
                        type="text"
                        required
                        value={newMedName}
                        onChange={(e) => setNewMedName(e.target.value)}
                        placeholder="z.B. Vitamin D3"
                        className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 outline-none font-medium text-slate-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500">Dosis</label>
                      <input
                        type="text"
                        required
                        value={newMedDosage}
                        onChange={(e) => setNewMedDosage(e.target.value)}
                        placeholder="z.B. 1 Tropfen"
                        className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 outline-none font-medium text-slate-700"
                      />
                    </div>
                  </div>
                )}

                {/* Common Fields: Title and Emoji */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="col-span-2 space-y-1">
                    <label className="font-bold text-slate-500">Name / Kurztitel (Optional)</label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="z.B. Mittags-Schlaf"
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 outline-none font-medium text-slate-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Emoji</label>
                    <input
                      type="text"
                      required
                      value={newEmoji}
                      onChange={(e) => setNewEmoji(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 outline-none font-medium text-center text-lg"
                    />
                  </div>
                </div>

                {/* Emoji Palette */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Emoji-Auswahl</label>
                  <div className="flex flex-wrap gap-1 bg-white p-2 rounded-xl border border-slate-100 max-h-20 overflow-y-auto">
                    {['🍼', '🥣', '🥤', '😴', '💧', '💩', '✨', '💊', '🍎', '🍌', '🥦', '🥛', '🧸', '🧷', '🌡️', '🩹', '❤️', '🌟'].map(em => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setNewEmoji(em)}
                        className={`text-lg p-1 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer ${
                          newEmoji === em ? 'bg-indigo-50 border border-indigo-200' : ''
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit / Cancel Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all cursor-pointer"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[#748FFC] hover:bg-[#5c7cfa] text-white rounded-xl font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Hinzufügen
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="items-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {quickAccessItems.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-slate-200 rounded-[20px] text-slate-400 text-xs">
                    <p>Keine Schnellvorlagen vorhanden.</p>
                    <p className="text-[10px] mt-0.5 text-slate-500">Klicke oben rechts auf das "+" Symbol, um eine neue anzulegen.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {quickAccessItems.map((item) => {
                      // Dynamically calculate theme/colors for each type
                      let borderClass = "border-slate-100 hover:border-slate-300 hover:bg-slate-50/50";
                      let typeLabel = "Aktivität";
                      
                      if (item.type === 'meal') {
                        if (item.mealCategory === 'milch') {
                          borderClass = "border-sky-100 hover:border-sky-300 hover:bg-sky-50/50";
                          typeLabel = "Milch";
                        } else if (item.mealCategory === 'brei') {
                          borderClass = "border-orange-100 hover:border-orange-300 hover:bg-orange-50/50";
                          typeLabel = "Brei-Mahlzeit";
                        } else {
                          borderClass = "border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50/50";
                          typeLabel = "Getränk";
                        }
                      } else if (item.type === 'sleep') {
                        borderClass = "border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50/50";
                        typeLabel = `${item.durationMinutes} Min. Schlaf`;
                      } else if (item.type === 'diaper') {
                        borderClass = "border-pink-100 hover:border-pink-300 hover:bg-pink-50/50";
                        typeLabel = item.diaperType === 'pipi' ? 'Pipi Windel' : item.diaperType === 'gross' ? 'Stuhl Windel' : 'Beides Windel';
                      } else if (item.type === 'medicine') {
                        borderClass = "border-purple-100 hover:border-purple-300 hover:bg-purple-50/50";
                        typeLabel = `Medizin: ${item.medName}`;
                      }

                      return (
                        <div key={item.id} className="relative group">
                          <button
                            onClick={() => {
                              if (!isEditing) {
                                handleExecuteQuickAccess(item);
                              }
                            }}
                            className={`w-full flex flex-col items-center justify-center p-3 rounded-[20px] border text-gray-700 transition-all cursor-pointer ${borderClass} ${
                              isEditing ? 'opacity-70 cursor-default border-dashed border-red-200' : ''
                            }`}
                          >
                            <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">{item.emoji}</span>
                            <span className="text-xs font-bold text-gray-800 line-clamp-1">{item.title}</span>
                            <span className="text-[9px] text-gray-400 mt-0.5 line-clamp-1">{typeLabel}</span>
                          </button>
                          
                          {/* Trash button for edit mode */}
                          {isEditing && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteQuickAccessItem(item.id);
                              }}
                              className="absolute -top-1.5 -right-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-1 shadow-md hover:scale-110 transition-all cursor-pointer z-10"
                              title="Löschen"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {quickSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 font-bold"
              >
                <Check className="w-4 h-4 shrink-0" />
                Aktivität wurde erfolgreich aufgezeichnet!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
