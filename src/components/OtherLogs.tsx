import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { DiaperType } from '../types';
import { formatDate, formatTime, calculateSleepStats, calculateDiaperStats } from '../utils';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Moon, Trash2, Check, Clock, Plus, Scale, Shield, 
  Calendar, Award, Activity, Pill, UserCheck, AlertCircle 
} from 'lucide-react';

type SubTab = 'schlaf' | 'windeln' | 'wachstum' | 'medikamente' | 'arzt';

export default function OtherLogs() {
  const { 
    activeChild, sleepLogs, diaperLogs, growthLogs, medicineLogs, appointmentLogs,
    addSleepLog, editSleepLog, deleteSleepLog,
    addDiaperLog, editDiaperLog, deleteDiaperLog,
    addGrowthLog, editGrowthLog, deleteGrowthLog,
    addMedicineLog, editMedicineLog, deleteMedicineLog,
    addAppointmentLog, editAppointmentLog, deleteAppointmentLog
  } = useApp();

  const [activeTab, setActiveTab] = useState<SubTab>('schlaf');
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Common Date/Time States (prefilled with current)
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [note, setNote] = useState('');

  // 1. Sleep States
  const [sleepStartDate, setSleepStartDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [sleepStartTime, setSleepStartTime] = useState<string>('13:00');
  const [sleepEndDate, setSleepEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [sleepEndTime, setSleepEndTime] = useState<string>('14:30');

  // 2. Diaper States
  const [diaperType, setDiaperType] = useState<DiaperType>('pipi');

  // 3. Growth States
  const [weight, setWeight] = useState<number>(activeChild ? activeChild.weight : 6.0);
  const [height, setHeight] = useState<number>(activeChild ? activeChild.height : 60);
  const [headCirc, setHeadCirc] = useState<number>(activeChild ? activeChild.headCircumference : 40);

  // 4. Medicine States
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medTime, setMedTime] = useState('Morgens');
  const [medReminder, setMedReminder] = useState(true);

  // 5. Appointment States
  const [appTitle, setAppTitle] = useState('');
  const [appDoctor, setAppDoctor] = useState('');
  const [appReminder, setAppReminder] = useState(true);

  if (!activeChild) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[70vh]">
        <div className="text-4xl mb-4">👶</div>
        <h3 className="text-xl font-bold text-gray-800">Noch kein Baby-Profil angelegt</h3>
        <p className="text-gray-500 mt-2 max-w-sm text-sm">Bitte erstelle ein Baby-Profil im Profil-Tab, um diese Protokolle einzusehen.</p>
      </div>
    );
  }

  const triggerSuccess = () => {
    setSuccess(true);
    setNote('');
    setErrorMsg('');
    setTimeout(() => setSuccess(false), 2000);
  };

  const handleSleepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const start = new Date(`${sleepStartDate}T${sleepStartTime}`);
    const end = new Date(`${sleepEndDate}T${sleepEndTime}`);
    
    let duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60)); // in minutes
    if (duration < 0) {
      setErrorMsg('Das Schlafende muss nach dem Schlafbeginn liegen.');
      return;
    }

    addSleepLog({
      childId: activeChild.id,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      duration,
      note
    });
    triggerSuccess();
  };

  const handleDiaperSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const timestamp = new Date(`${date}T${time}`).toISOString();
    addDiaperLog({
      childId: activeChild.id,
      timestamp,
      type: diaperType,
      note
    });
    triggerSuccess();
  };

  const handleGrowthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const timestamp = new Date(`${date}T${time}`).toISOString();
    addGrowthLog({
      childId: activeChild.id,
      timestamp,
      weight: Number(weight),
      height: Number(height),
      headCircumference: Number(headCirc),
      note
    });
    triggerSuccess();
  };

  const handleMedicineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const timestamp = new Date(`${date}T${time}`).toISOString();
    addMedicineLog({
      childId: activeChild.id,
      timestamp,
      name: medName,
      dosage: medDosage,
      timeOfDay: medTime,
      reminderActive: medReminder,
      note
    });
    setMedName('');
    setMedDosage('');
    triggerSuccess();
  };

  const handleAppointmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const timestamp = new Date(`${date}T${time}`).toISOString();
    addAppointmentLog({
      childId: activeChild.id,
      timestamp,
      title: appTitle,
      doctor: appDoctor,
      note,
      reminderActive: appReminder
    });
    setAppTitle('');
    setAppDoctor('');
    triggerSuccess();
  };

  // Filter logs for this active child
  const childSleep = sleepLogs.filter(log => log.childId === activeChild.id);
  const childDiapers = diaperLogs.filter(log => log.childId === activeChild.id);
  const childGrowth = growthLogs.filter(log => log.childId === activeChild.id);
  const childMedicines = medicineLogs.filter(log => log.childId === activeChild.id);
  const childAppointments = appointmentLogs.filter(log => log.childId === activeChild.id);

  // Stats
  const sleepStats = calculateSleepStats(sleepLogs, activeChild.id);
  const diaperStats = calculateDiaperStats(diaperLogs, activeChild.id);

  return (
    <div className="space-y-6">
      {/* Sub Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-1.5 bg-gray-100/80 p-1.5 rounded-2xl border border-gray-200/50 self-start">
        <button
          onClick={() => { setActiveTab('schlaf'); setNote(''); setErrorMsg(''); }}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'schlaf' ? 'bg-white text-indigo-600 shadow-xs border border-indigo-100/10' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          😴 Schlaf
        </button>
        <button
          onClick={() => { setActiveTab('windeln'); setNote(''); setErrorMsg(''); }}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'windeln' ? 'bg-white text-pink-600 shadow-xs border border-pink-100/10' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🧷 Windeln
        </button>
        <button
          onClick={() => { setActiveTab('wachstum'); setNote(''); setErrorMsg(''); }}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'wachstum' ? 'bg-white text-emerald-600 shadow-xs border border-emerald-100/10' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          📈 Wachstum
        </button>
        <button
          onClick={() => { setActiveTab('medikamente'); setNote(''); setErrorMsg(''); }}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'medikamente' ? 'bg-white text-purple-600 shadow-xs border border-purple-100/10' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          💊 Medikamente
        </button>
        <button
          onClick={() => { setActiveTab('arzt'); setNote(''); setErrorMsg(''); }}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'arzt' ? 'bg-white text-amber-600 shadow-xs border border-amber-100/10' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🩺 Arzttermine
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form Column */}
        <div className="lg:col-span-1 bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/50 p-6 space-y-4">
          <h3 className="text-base font-bold text-gray-800 border-b border-gray-50 pb-3 flex items-center gap-2">
            {activeTab === 'schlaf' && '😴 Schlafzeit loggen'}
            {activeTab === 'windeln' && '🧷 Windelwechsel loggen'}
            {activeTab === 'wachstum' && '📈 Wachstum messen'}
            {activeTab === 'medikamente' && '💊 Medikament verabreichen'}
            {activeTab === 'arzt' && '🩺 Arzttermin eintragen'}
          </h3>

          {/* Form Selector depending on Sub-Tab */}
          {activeTab === 'schlaf' && (
            <form onSubmit={handleSleepSubmit} className="space-y-4">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2.5 rounded-2xl border border-gray-100">
                  <div className="col-span-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Schlafbeginn</div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">Datum</label>
                    <input
                      type="date"
                      required
                      value={sleepStartDate}
                      onChange={(e) => setSleepStartDate(e.target.value)}
                      className="w-full bg-white border border-gray-100 rounded-xl px-2.5 py-1.5 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">Uhrzeit</label>
                    <input
                      type="time"
                      required
                      value={sleepStartTime}
                      onChange={(e) => setSleepStartTime(e.target.value)}
                      className="w-full bg-white border border-gray-100 rounded-xl px-2.5 py-1.5 text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2.5 rounded-2xl border border-gray-100">
                  <div className="col-span-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Schlafende</div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">Datum</label>
                    <input
                      type="date"
                      required
                      value={sleepEndDate}
                      onChange={(e) => setSleepEndDate(e.target.value)}
                      className="w-full bg-white border border-gray-100 rounded-xl px-2.5 py-1.5 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">Uhrzeit</label>
                    <input
                      type="time"
                      required
                      value={sleepEndTime}
                      onChange={(e) => setSleepEndTime(e.target.value)}
                      className="w-full bg-white border border-gray-100 rounded-xl px-2.5 py-1.5 text-xs outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Notiz</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="z.B. unruhig geschlafen, aufgewacht..."
                    rows={2}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none resize-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-3 bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md shadow-indigo-500/10 active:scale-[0.98] transition-all">
                Schlaf speichern
              </button>
            </form>
          )}

          {activeTab === 'windeln' && (
            <form onSubmit={handleDiaperSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">Zustand</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['pipi', 'gross', 'beides'] as DiaperType[]).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setDiaperType(type)}
                      className={`py-3 flex flex-col items-center justify-center rounded-2xl border text-center transition-all cursor-pointer ${
                        diaperType === type 
                          ? 'border-indigo-300 bg-indigo-50/50 text-indigo-600' 
                          : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200'
                      }`}
                    >
                      <span className="text-xl mb-1">
                        {type === 'pipi' && '💧'}
                        {type === 'gross' && '💩'}
                        {type === 'beides' && '✨'}
                      </span>
                      <span className="text-[10px] font-bold uppercase">
                        {type === 'pipi' && 'Pipi'}
                        {type === 'gross' && 'Groß'}
                        {type === 'beides' && 'Beides'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Datum</label>
                  <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-2.5 py-2 text-xs outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Uhrzeit</label>
                  <input type="time" required value={time} onChange={(e) => setTime(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-2.5 py-2 text-xs outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Notiz</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="z.B. wunde Haut..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none resize-none placeholder:text-gray-400"
                />
              </div>

              <button type="submit" className="w-full py-3 bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md shadow-indigo-500/10 active:scale-[0.98] transition-all">
                Windel speichern
              </button>
            </form>
          )}

          {activeTab === 'wachstum' && (
            <form onSubmit={handleGrowthSubmit} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Gewicht (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max="30"
                    required
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Größe (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="30"
                    max="120"
                    required
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Kopfumfang (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="25"
                    max="60"
                    required
                    value={headCirc}
                    onChange={(e) => setHeadCirc(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">Datum</label>
                    <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-2.5 py-2 text-xs outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">Uhrzeit</label>
                    <input type="time" required value={time} onChange={(e) => setTime(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-2.5 py-2 text-xs outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Notiz</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="U-Untersuchung..."
                    rows={2}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none resize-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-3 bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md shadow-indigo-500/10 active:scale-[0.98] transition-all">
                Messdaten speichern
              </button>
            </form>
          )}

          {activeTab === 'medikamente' && (
            <form onSubmit={handleMedicineSubmit} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Medikamentenname</label>
                  <input
                    type="text"
                    required
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                    placeholder="z.B. Vitamin D3"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Dosierung</label>
                  <input
                    type="text"
                    required
                    value={medDosage}
                    onChange={(e) => setMedDosage(e.target.value)}
                    placeholder="z.B. 1 Tablette, 3 Tropfen"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Uhrzeit / Turnus</label>
                  <input
                    type="text"
                    required
                    value={medTime}
                    onChange={(e) => setMedTime(e.target.value)}
                    placeholder="z.B. Morgens, alle 12 Std"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none placeholder:text-gray-400"
                  />
                </div>

                <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                  <input
                    type="checkbox"
                    id="medRem"
                    checked={medReminder}
                    onChange={(e) => setMedReminder(e.target.checked)}
                    className="rounded accent-indigo-500 w-4 h-4"
                  />
                  <label htmlFor="medRem" className="text-xs text-gray-600 font-bold cursor-pointer select-none">
                    Erinnerung aktivieren
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">Datum</label>
                    <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-2.5 py-2 text-xs outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">Uhrzeit</label>
                    <input type="time" required value={time} onChange={(e) => setTime(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-2.5 py-2 text-xs outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Notiz</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="z.B. mit etwas Milch gegeben..."
                    rows={2}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none resize-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-3 bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md shadow-indigo-500/10 active:scale-[0.98] transition-all">
                Einnahme speichern
              </button>
            </form>
          )}

          {activeTab === 'arzt' && (
            <form onSubmit={handleAppointmentSubmit} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Grund / Titel</label>
                  <input
                    type="text"
                    required
                    value={appTitle}
                    onChange={(e) => setAppTitle(e.target.value)}
                    placeholder="z.B. U5 Untersuchung, Impfung"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Kinderarzt / Praxis</label>
                  <input
                    type="text"
                    required
                    value={appDoctor}
                    onChange={(e) => setAppDoctor(e.target.value)}
                    placeholder="z.B. Dr. Julia Becker"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none placeholder:text-gray-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">Datum</label>
                    <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-2.5 py-2 text-xs outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">Uhrzeit</label>
                    <input type="time" required value={time} onChange={(e) => setTime(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-2.5 py-2 text-xs outline-none" />
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                  <input
                    type="checkbox"
                    id="appRem"
                    checked={appReminder}
                    onChange={(e) => setAppReminder(e.target.checked)}
                    className="rounded accent-indigo-500 w-4 h-4"
                  />
                  <label htmlFor="appRem" className="text-xs text-gray-600 font-bold cursor-pointer select-none">
                    Erinnerung aktivieren (Push-Nachricht)
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Notiz</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="z.B. Impfpass mitbringen, vorher Fieber messen..."
                    rows={2}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none resize-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-3 bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md shadow-indigo-500/10 active:scale-[0.98] transition-all">
                Arzttermin eintragen
              </button>
            </form>
          )}

          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-2.5 bg-emerald-50 text-emerald-600 text-xs rounded-xl border border-emerald-100 flex items-center gap-1.5 font-bold"
              >
                <Check className="w-4 h-4" /> Protokolleintrag erfolgreich gespeichert!
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-2.5 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 flex items-center gap-1.5 font-bold"
              >
                <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Statistics & History Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats Block for current Tab */}
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/50 p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              {activeTab === 'schlaf' && 'Schlaf-Statistik & Berechnungen'}
              {activeTab === 'windeln' && 'Windel-Übersicht Heute'}
              {activeTab === 'wachstum' && 'Aktuelle Maße & Wachstumskurve'}
              {activeTab === 'medikamente' && 'Medikamenten-Übersicht'}
              {activeTab === 'arzt' && 'Anstehende Kinderarztbesuche'}
            </h3>

            {activeTab === 'schlaf' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                    <span className="text-[10px] text-indigo-600 font-bold block uppercase">Heute Schlaf</span>
                    <span className="text-xl font-bold text-gray-800 mt-1">
                      {Math.floor(sleepStats.totalSchlafHeute / 60)}h {sleepStats.totalSchlafHeute % 60}m
                    </span>
                  </div>
                  <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                    <span className="text-[10px] text-indigo-600 font-bold block uppercase">Wochensumme</span>
                    <span className="text-xl font-bold text-gray-800 mt-1">
                      {Math.floor(sleepStats.totalSchlafWoche / 60)}h {sleepStats.totalSchlafWoche % 60}m
                    </span>
                  </div>
                  <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                    <span className="text-[10px] text-indigo-600 font-bold block uppercase">Ø Schlaf/Tag</span>
                    <span className="text-xl font-bold text-gray-800 mt-1">
                      {Math.floor(sleepStats.avgSchlafProTag / 60)}h {sleepStats.avgSchlafProTag % 60}m
                    </span>
                  </div>
                </div>
                <div className="text-[11px] text-gray-500 flex items-start gap-1.5 p-3 bg-indigo-50/20 rounded-xl border border-indigo-100/30">
                  <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Dauer und Tagessumme werden automatisch anhand der eingegebenen Uhrzeiten berechnet.</span>
                </div>
              </div>
            )}

            {activeTab === 'windeln' && (
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-pink-50/40 p-3 rounded-xl text-center border border-pink-50">
                  <span className="text-xs text-gray-400 font-bold">Heute Gesamt</span>
                  <span className="block text-lg font-bold text-gray-800">{diaperStats.totalHeute}</span>
                </div>
                <div className="bg-sky-50/50 p-3 rounded-xl text-center border border-sky-50">
                  <span className="text-xs text-gray-400 font-bold">Pipi 💧</span>
                  <span className="block text-lg font-bold text-sky-600">{diaperStats.pipiCount}</span>
                </div>
                <div className="bg-orange-50/50 p-3 rounded-xl text-center border border-orange-50">
                  <span className="text-xs text-gray-400 font-bold">Groß 💩</span>
                  <span className="block text-lg font-bold text-orange-600">{diaperStats.grossCount}</span>
                </div>
                <div className="bg-purple-50/50 p-3 rounded-xl text-center border border-purple-50">
                  <span className="text-xs text-gray-400 font-bold">Beides ✨</span>
                  <span className="block text-lg font-bold text-purple-600">{diaperStats.beidesCount}</span>
                </div>
              </div>
            )}

            {activeTab === 'wachstum' && (
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-emerald-50/40 p-3 rounded-xl border border-emerald-50 text-center">
                  <span className="text-xs text-gray-500">Gewicht</span>
                  <span className="block text-lg font-bold text-emerald-600 mt-1">{activeChild.weight.toFixed(1)} kg</span>
                  <span className="text-[9px] text-gray-400 font-bold">letzte Änderung</span>
                </div>
                <div className="bg-emerald-50/40 p-3 rounded-xl border border-emerald-50 text-center">
                  <span className="text-xs text-gray-500">Körpergröße</span>
                  <span className="block text-lg font-bold text-emerald-600 mt-1">{activeChild.height} cm</span>
                  <span className="text-[9px] text-gray-400 font-bold">Wachstumsschritt</span>
                </div>
                <div className="bg-emerald-50/40 p-3 rounded-xl border border-emerald-50 text-center">
                  <span className="text-xs text-gray-500">Kopfumfang</span>
                  <span className="block text-lg font-bold text-emerald-600 mt-1">{activeChild.headCircumference} cm</span>
                  <span className="text-[9px] text-gray-400 font-bold">Kopfumfang</span>
                </div>
              </div>
            )}

            {activeTab === 'medikamente' && (
              <div className="p-4 bg-purple-50/30 rounded-2xl border border-purple-100 text-xs text-gray-600 flex items-center gap-2">
                <Pill className="w-5 h-5 text-purple-500" />
                <span>
                  Trage verabreichte Tabletten, Säfte oder Salben ein. Die App erinnert dich bei Bedarf zu vordefinierten Uhrzeiten daran.
                </span>
              </div>
            )}

            {activeTab === 'arzt' && (
              <div className="p-4 bg-amber-50/30 rounded-2xl border border-amber-100 text-xs text-gray-600 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                <span>
                  Verwalte anstehende Vorsorgeuntersuchungen (U3 - U9) oder Impftermine. Erhalte Push-Erinnerungen vor dem Termin.
                </span>
              </div>
            )}
          </div>

          {/* History Timeline of entries for that active Tab */}
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/50 p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-800">
              {activeTab === 'schlaf' && `Schlaf-Historie (${childSleep.length})`}
              {activeTab === 'windeln' && `Windel-Historie (${childDiapers.length})`}
              {activeTab === 'wachstum' && `Wachstumsschritte (${childGrowth.length})`}
              {activeTab === 'medikamente' && `Medikamentengabe (${childMedicines.length})`}
              {activeTab === 'arzt' && `Kommende Termine (${childAppointments.length})`}
            </h3>

            {/* List entries */}
            <div className="max-h-[350px] overflow-y-auto pr-1 space-y-2.5 divide-y divide-gray-50">
              {/* Schlaf */}
              {activeTab === 'schlaf' && childSleep.length === 0 && <div className="text-center text-xs text-gray-400 py-6">Keine Schlafeinträge vorhanden.</div>}
              {activeTab === 'schlaf' && childSleep.map(log => (
                <div key={log.id} className="flex items-center justify-between py-3 group first:pt-0">
                  <div className="flex items-start gap-3">
                    <span className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-lg">😴</span>
                    <div>
                      <h4 className="text-xs font-bold text-gray-800">
                        {Math.floor(log.duration / 60)} Std {log.duration % 60} Min geschlafen
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-0.5 font-bold">
                        {formatDate(log.startTime)} von {formatTime(log.startTime)} bis {formatTime(log.endTime)} • Von {log.loggedBy}
                      </p>
                      {log.note && <p className="text-[10px] text-gray-500 mt-1 bg-gray-50 px-2 py-1 rounded">"{log.note}"</p>}
                    </div>
                  </div>
                  <button onClick={() => deleteSleepLog(log.id)} className="text-gray-300 hover:text-red-500 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Windeln */}
              {activeTab === 'windeln' && childDiapers.length === 0 && <div className="text-center text-xs text-gray-400 py-6">Keine Windeleinträge vorhanden.</div>}
              {activeTab === 'windeln' && childDiapers.map(log => (
                <div key={log.id} className="flex items-center justify-between py-3 group first:pt-0">
                  <div className="flex items-start gap-3">
                    <span className="w-9 h-9 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center text-lg">
                      {log.type === 'pipi' ? '💧' : log.type === 'gross' ? '💩' : '✨'}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-gray-800 capitalize">
                        Windelwechsel: {log.type === 'beides' ? 'Pipi & Groß' : log.type}
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-0.5 font-bold">
                        {formatDate(log.timestamp)} um {formatTime(log.timestamp)} • Von {log.loggedBy}
                      </p>
                      {log.note && <p className="text-[10px] text-gray-500 mt-1 bg-gray-50 px-2 py-1 rounded">"{log.note}"</p>}
                    </div>
                  </div>
                  <button onClick={() => deleteDiaperLog(log.id)} className="text-gray-300 hover:text-red-500 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Wachstum */}
              {activeTab === 'wachstum' && childGrowth.length === 0 && <div className="text-center text-xs text-gray-400 py-6">Keine Wachstumsdaten vorhanden.</div>}
              {activeTab === 'wachstum' && childGrowth.map(log => (
                <div key={log.id} className="flex items-center justify-between py-3 group first:pt-0">
                  <div className="flex items-start gap-3">
                    <span className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-lg">📈</span>
                    <div>
                      <h4 className="text-xs font-bold text-gray-800">
                        {log.weight.toFixed(1)} kg / {log.height} cm / {log.headCircumference} cm
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-0.5 font-bold">
                        Eingetragen am {formatDate(log.timestamp)} • Von {log.loggedBy}
                      </p>
                      {log.note && <p className="text-[10px] text-gray-500 mt-1 bg-gray-50 px-2 py-1 rounded">"{log.note}"</p>}
                    </div>
                  </div>
                  <button onClick={() => deleteGrowthLog(log.id)} className="text-gray-300 hover:text-red-500 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Medikamente */}
              {activeTab === 'medikamente' && childMedicines.length === 0 && <div className="text-center text-xs text-gray-400 py-6">Keine Medikamentengabe vorhanden.</div>}
              {activeTab === 'medikamente' && childMedicines.map(log => (
                <div key={log.id} className="flex items-center justify-between py-3 group first:pt-0">
                  <div className="flex items-start gap-3">
                    <span className="w-9 h-9 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center text-lg">💊</span>
                    <div>
                      <h4 className="text-xs font-bold text-gray-800">
                        {log.name} ({log.dosage})
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-0.5 font-bold">
                        Geben um {log.timeOfDay} • Am {formatDate(log.timestamp)} • Von {log.loggedBy}
                      </p>
                      {log.note && <p className="text-[10px] text-gray-500 mt-1 bg-gray-50 px-2 py-1 rounded">"{log.note}"</p>}
                    </div>
                  </div>
                  <button onClick={() => deleteMedicineLog(log.id)} className="text-gray-300 hover:text-red-500 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Arzttermine */}
              {activeTab === 'arzt' && childAppointments.length === 0 && <div className="text-center text-xs text-gray-400 py-6">Keine Arzttermine eingetragen.</div>}
              {activeTab === 'arzt' && childAppointments.map(log => (
                <div key={log.id} className="flex items-center justify-between py-3 group first:pt-0">
                  <div className="flex items-start gap-3">
                    <span className="w-9 h-9 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center text-lg">🩺</span>
                    <div>
                      <h4 className="text-xs font-bold text-gray-800">
                        {log.title} bei {log.doctor}
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-0.5 font-bold">
                        Am {formatDate(log.timestamp)} um {formatTime(log.timestamp)} • Von {log.loggedBy}
                      </p>
                      {log.note && <p className="text-[10px] text-gray-500 mt-1 bg-gray-50 px-2 py-1 rounded">"{log.note}"</p>}
                    </div>
                  </div>
                  <button onClick={() => deleteAppointmentLog(log.id)} className="text-gray-300 hover:text-red-500 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
