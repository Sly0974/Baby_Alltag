import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { Reminder } from '../types';
import { getCountdownString, formatTime } from '../utils';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, BellOff, Clock, Plus, Trash2, CheckCircle2, 
  Volume2, ShieldAlert, Play, Zap, RefreshCw, Sparkles 
} from 'lucide-react';

export default function ErinnerungenPage() {
  const { 
    activeChild, reminders, addReminder, updateReminder, deleteReminder, triggerReminderCheck 
  } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'milch' | 'brei' | 'getraenke' | 'schlaf' | 'windel' | 'medikament' | 'arzt'>('milch');
  const [type, setType] = useState<'interval' | 'fixed'>('interval');
  const [intervalHours, setIntervalHours] = useState<number>(3);
  const [fixedTime, setFixedTime] = useState<string>('12:00');
  
  const [success, setSuccess] = useState(false);
  const [snoozeSuccess, setSnoozeSuccess] = useState(false);
  const [simulatedNotification, setSimulatedNotification] = useState<{
    text: string;
    stage: '30m' | '10m' | '0m' | null;
    reminder: Reminder | null;
  }>({ text: '', stage: null, reminder: null });

  // Timers to update countdowns in real-time
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(tick => tick + 1);
      triggerReminderCheck(); // Auto-roll interval times forward if they expired
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!activeChild) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[70vh]">
        <div className="text-4xl mb-4">👶</div>
        <h3 className="text-xl font-bold text-gray-800">Noch kein Baby-Profil angelegt</h3>
        <p className="text-gray-500 mt-2 max-w-sm text-sm">Bitte erstelle ein Baby-Profil im Profil-Tab, um Erinnerungen einzurichten.</p>
      </div>
    );
  }

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    // Calculate next trigger time
    let nextTriggerTime = new Date().toISOString();
    if (type === 'interval') {
      nextTriggerTime = new Date(Date.now() + intervalHours * 60 * 60 * 1000).toISOString();
    } else {
      const today = new Date();
      const [h, m] = fixedTime.split(':').map(Number);
      today.setHours(h, m, 0, 0);
      if (today.getTime() < Date.now()) {
        today.setDate(today.getDate() + 1); // Set to tomorrow if already passed today
      }
      nextTriggerTime = today.toISOString();
    }

    addReminder({
      childId: activeChild.id,
      category,
      title,
      type,
      intervalHours: type === 'interval' ? intervalHours : undefined,
      fixedTime: type === 'fixed' ? fixedTime : undefined,
      nextTriggerTime,
      enabled: true,
      notify30: true,
      notify10: true,
      notify0: true
    });

    setTitle('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  const handleToggleReminder = (rem: Reminder) => {
    updateReminder({
      ...rem,
      enabled: !rem.enabled
    });
  };

  // Notification simulation trigger
  const handleSimulateNotification = (rem: Reminder, stage: '30m' | '10m' | '0m') => {
    let text = '';
    if (stage === '30m') text = `BabyCare+ Erinnerung (In 30 Min): "${rem.title}" steht bald an.`;
    else if (stage === '10m') text = `BabyCare+ Warnung (In 10 Min): Bereite dich vor für "${rem.title}".`;
    else text = `BabyCare+ Alarm (JETZT): ${activeChild.name} ist bereit für "${rem.title}"!`;

    setSimulatedNotification({
      text,
      stage,
      reminder: rem
    });
  };

  const handleSnooze = () => {
    if (!simulatedNotification.reminder) return;
    const rem = simulatedNotification.reminder;
    
    // Snooze by 15 mins (0.25 hours)
    const newNext = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    updateReminder({
      ...rem,
      nextTriggerTime: newNext
    });

    setSimulatedNotification({ text: '', stage: null, reminder: null });
    setSnoozeSuccess(true);
    setTimeout(() => setSnoozeSuccess(false), 3000);
  };

  const childReminders = reminders.filter(r => r.childId === activeChild.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Erinnerungen & Wecker</h2>
        <p className="text-gray-500 text-sm">Richte Stunden-Intervalle oder feste Uhrzeiten für Fläschchen, Brei, Medikamente oder Schlafzeiten ein.</p>
      </div>

      {/* Interactive push simulation alert banner if active */}
      <AnimatePresence>
        {simulatedNotification.text && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-5 bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 text-white rounded-[32px] shadow-xl border border-indigo-500 space-y-3 relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-start gap-3 relative z-10">
              <span className="text-3xl animate-bounce">🔔</span>
              <div className="space-y-1">
                <span className="text-xs font-bold bg-indigo-500/80 px-2.5 py-0.5 rounded-full border border-indigo-400">Push-Mitteilung (Simuliert)</span>
                <p className="text-sm font-bold mt-1">{simulatedNotification.text}</p>
                <p className="text-[11px] text-indigo-100">Simuliert auf eurem Smartphone / Tablet von Mama, Papa & Großeltern simultan.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 pt-2 relative z-10">
              <button
                onClick={() => setSimulatedNotification({ text: '', stage: null, reminder: null })}
                className="px-4 py-1.5 bg-white hover:bg-gray-100 text-indigo-600 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Erledigt / Bestätigen
              </button>
              <button
                onClick={handleSnooze}
                className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white border border-indigo-400/50 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1"
              >
                <Clock className="w-3.5 h-3.5" /> Später erinnern (15 Min)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Snooze Success Elegant Notification */}
      <AnimatePresence>
        {snoozeSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-amber-50 text-amber-800 text-xs rounded-xl border border-amber-100 flex items-center gap-2 font-bold shadow-md shadow-amber-500/5"
          >
            <Clock className="w-4 h-4 text-amber-500 animate-spin" />
            Erinnerung wurde erfolgreich um 15 Minuten verschoben! Alle Erziehungspersonen wurden synchronisiert.
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Create Reminder */}
        <div className="lg:col-span-1 bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/50 p-6 space-y-4">
          <h3 className="text-base font-bold text-gray-800 border-b border-gray-50 pb-3 flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-500" />
            Neuer Wecker
          </h3>

          <form onSubmit={handleCreateReminder} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">Titel der Erinnerung</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="z.B. Nachmittags-Fläschchen, U4 Untersuchung..."
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-800 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">Kategorie</label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-800 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 font-bold"
              >
                <option value="milch">🍼 Milch / Stillen</option>
                <option value="brei">🥣 Brei / Beikost</option>
                <option value="getraenke">🥤 Getränke / Wasser</option>
                <option value="schlaf">😴 Schlaf / Nap</option>
                <option value="windel">🧷 Windelwechsel</option>
                <option value="medikament">💊 Medikamentenabgabe</option>
                <option value="arzt">🩺 Arzt- & Vorsorgetermin</option>
              </select>
            </div>

            {/* Interval Mode Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5">Berechnungsart</label>
              <div className="grid grid-cols-2 gap-2 bg-gray-100/80 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setType('interval')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    type === 'interval' ? 'bg-white text-indigo-600 shadow-xs border border-indigo-50/10' : 'text-gray-500'
                  }`}
                >
                  Alle X Stunden
                </button>
                <button
                  type="button"
                  onClick={() => setType('fixed')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    type === 'fixed' ? 'bg-white text-indigo-600 shadow-xs border border-indigo-50/10' : 'text-gray-500'
                  }`}
                >
                  Feste Uhrzeit
                </button>
              </div>
            </div>

            {/* Conditional input options based on type */}
            {type === 'interval' ? (
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5">
                  Intervall: Alle <span className="font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md">{intervalHours} Stunden</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="0.5"
                  value={intervalHours}
                  onChange={(e) => setIntervalHours(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-bold">
                  <span>jede Std</span>
                  <span>alle 3-4 Std (üblich)</span>
                  <span>alle 12 Std</span>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Uhrzeit festlegen</label>
                <input
                  type="time"
                  required
                  value={fixedTime}
                  onChange={(e) => setFixedTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700 font-bold outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md shadow-indigo-500/10 transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Erinnerung anlegen
            </button>

            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-2.5 bg-emerald-50 text-emerald-600 text-xs rounded-xl border border-emerald-100 flex items-center gap-1.5 font-bold"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Erinnerung erfolgreich erstellt!
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* Right Column: List of reminders & Push simulators */}
        <div className="lg:col-span-2 bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/50 p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-800">Geplante Erinnerungen ({childReminders.length})</h3>

          {childReminders.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs">
              Keine aktiven Erinnerungen eingerichtet. Erstelle einen Wecker über das linke Formular.
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
              {childReminders.map(rem => {
                const countdownData = getCountdownString(rem.nextTriggerTime);
                const isEnabled = rem.enabled;
                const emoji = rem.category === 'milch' ? '🍼' : rem.category === 'brei' ? '🥣' : rem.category === 'getraenke' ? '🥤' : rem.category === 'schlaf' ? '😴' : rem.category === 'windel' ? '🧷' : rem.category === 'medikament' ? '💊' : '🩺';

                return (
                  <div 
                    key={rem.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isEnabled 
                        ? 'border-gray-100 bg-gray-50/50' 
                        : 'border-gray-100/50 bg-gray-50/20 opacity-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl mt-0.5">{emoji}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-gray-800">{rem.title}</h4>
                            <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                              {rem.type === 'interval' ? `alle ${rem.intervalHours}h` : `Uhrzeit ${rem.fixedTime}`}
                            </span>
                          </div>
                          
                          <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                            Nächste Fälligkeit: {new Date(rem.nextTriggerTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr
                          </p>
                          
                          {/* Countdown marker */}
                          {isEnabled && (
                            <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mt-1.5 ${
                              countdownData.urgent 
                                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white animate-pulse' 
                                : 'bg-indigo-50 text-indigo-600'
                            }`}>
                              {countdownData.text}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* On/Off Switch & Delete */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleReminder(rem)}
                          className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${isEnabled ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-gray-200'}`}
                        >
                          <span className={`absolute w-4 h-4 rounded-full bg-white top-0.5 transition-all ${isEnabled ? 'left-4.5' : 'left-0.5'}`} />
                        </button>
                        
                        <button 
                          onClick={() => deleteReminder(rem.id)}
                          className="text-gray-300 hover:text-red-500 p-1.5 hover:bg-white rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Interactive push simulators */}
                    {isEnabled && (
                      <div className="mt-4 pt-3.5 border-t border-gray-100 flex flex-wrap items-center gap-1.5">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mr-1.5">Push-Testen:</span>
                        <button
                          onClick={() => handleSimulateNotification(rem, '30m')}
                          className="px-2.5 py-1 bg-white hover:bg-gray-100 text-[10px] font-bold text-gray-600 rounded-lg border border-gray-200/50 cursor-pointer flex items-center gap-1"
                        >
                          <Volume2 className="w-3 h-3 text-gray-400" />
                          30 Min vorher
                        </button>
                        <button
                          onClick={() => handleSimulateNotification(rem, '10m')}
                          className="px-2.5 py-1 bg-white hover:bg-gray-100 text-[10px] font-bold text-gray-600 rounded-lg border border-gray-200/50 cursor-pointer flex items-center gap-1"
                        >
                          <Volume2 className="w-3 h-3 text-gray-400" />
                          10 Min vorher
                        </button>
                        <button
                          onClick={() => handleSimulateNotification(rem, '0m')}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-[10px] font-bold text-indigo-600 rounded-lg border border-indigo-100/50 cursor-pointer flex items-center gap-1"
                        >
                          <Play className="w-3 h-3 text-indigo-400" />
                          Jetzt auslösen!
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
