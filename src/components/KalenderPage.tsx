import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { MealCategory, MealLog } from '../types';
import { formatDate, formatTime } from '../utils';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, Filter, Trash2, Edit3, Check, X, 
  Search, Sliders, ChevronDown, Clock, AlertCircle 
} from 'lucide-react';

type FilterType = 'all' | 'milch' | 'brei' | 'getraenke' | 'schlaf' | 'windeln' | 'medikamente' | 'arzt';
type ViewMode = 'tag' | 'woche' | 'monat';

export default function KalenderPage() {
  const { 
    activeChild, mealLogs, sleepLogs, diaperLogs, medicineLogs, appointmentLogs,
    deleteMealLog, editMealLog, deleteSleepLog, deleteDiaperLog, deleteMedicineLog, deleteAppointmentLog
  } = useApp();

  const [filter, setFilter] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('tag');
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editNote, setEditNote] = useState('');

  // Delete modal state
  const [deleteCandidate, setDeleteCandidate] = useState<FeedItem | null>(null);

  if (!activeChild) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[70vh]">
        <div className="text-4xl mb-4">👶</div>
        <h3 className="text-xl font-bold text-gray-800">Noch kein Baby-Profil angelegt</h3>
        <p className="text-gray-500 mt-2 max-w-sm text-sm">Bitte erstelle ein Baby-Profil im Profil-Tab, um den Verlauf anzusehen.</p>
      </div>
    );
  }

  // Combine ALL logs into a single feed
  interface FeedItem {
    id: string;
    type: 'meal' | 'sleep' | 'diaper' | 'medicine' | 'appointment';
    category?: MealCategory;
    title: string;
    subTitle: string;
    timestamp: string;
    amount?: number;
    unit?: string;
    note: string;
    loggedBy: string;
    raw: any;
  }

  const getCombinedFeed = (): FeedItem[] => {
    const feed: FeedItem[] = [];

    // 1. Meals
    mealLogs
      .filter(l => l.childId === activeChild.id)
      .forEach(l => {
        feed.push({
          id: l.id,
          type: 'meal',
          category: l.category,
          title: `${l.subType} (${l.amount}${l.unit})`,
          subTitle: `Mahlzeit • ${l.subType}`,
          timestamp: l.timestamp,
          amount: l.amount,
          unit: l.unit,
          note: l.note,
          loggedBy: l.loggedBy,
          raw: l
        });
      });

    // 2. Sleep
    sleepLogs
      .filter(l => l.childId === activeChild.id)
      .forEach(l => {
        feed.push({
          id: l.id,
          type: 'sleep',
          title: `Schlaf: ${Math.floor(l.duration / 60)} Std ${l.duration % 60} Min`,
          subTitle: `Schlaf`,
          timestamp: l.startTime,
          note: l.note,
          loggedBy: l.loggedBy,
          raw: l
        });
      });

    // 3. Diapers
    diaperLogs
      .filter(l => l.childId === activeChild.id)
      .forEach(l => {
        feed.push({
          id: l.id,
          type: 'diaper',
          title: `Windelwechsel: ${l.type === 'beides' ? 'Pipi & Groß' : l.type === 'pipi' ? 'Pipi' : 'Groß'}`,
          subTitle: `Windel`,
          timestamp: l.timestamp,
          note: l.note,
          loggedBy: l.loggedBy,
          raw: l
        });
      });

    // 4. Medicines
    medicineLogs
      .filter(l => l.childId === activeChild.id)
      .forEach(l => {
        feed.push({
          id: l.id,
          type: 'medicine',
          title: `${l.name} (${l.dosage})`,
          subTitle: `Medikament • Turnus: ${l.timeOfDay}`,
          timestamp: l.timestamp,
          note: l.note,
          loggedBy: l.loggedBy,
          raw: l
        });
      });

    // 5. Appointments
    appointmentLogs
      .filter(l => l.childId === activeChild.id)
      .forEach(l => {
        feed.push({
          id: l.id,
          type: 'appointment',
          title: `${l.title} (${l.doctor})`,
          subTitle: `Arzttermin`,
          timestamp: l.timestamp,
          note: l.note,
          loggedBy: l.loggedBy,
          raw: l
        });
      });

    // Sort by timestamp descending
    return feed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const feedItems = getCombinedFeed();

  // Filter logic
  const filteredFeed = feedItems.filter(item => {
    // 1. Filter by category type
    if (filter !== 'all') {
      if (filter === 'milch' && (item.type !== 'meal' || item.category !== 'milch')) return false;
      if (filter === 'brei' && (item.type !== 'meal' || item.category !== 'brei')) return false;
      if (filter === 'getraenke' && (item.type !== 'meal' || item.category !== 'getraenke')) return false;
      if (filter === 'schlaf' && item.type !== 'sleep') return false;
      if (filter === 'windeln' && item.type !== 'diaper') return false;
      if (filter === 'medikamente' && item.type !== 'medicine') return false;
      if (filter === 'arzt' && item.type !== 'appointment') return false;
    }

    // 2. Filter by selected date (for Tag / Woche / Monat view)
    const logDate = new Date(item.timestamp);
    const selDate = new Date(selectedDate);

    if (viewMode === 'tag') {
      if (logDate.toDateString() !== selDate.toDateString()) return false;
    } else if (viewMode === 'woche') {
      const oneWeekAgo = new Date(selDate);
      oneWeekAgo.setDate(selDate.getDate() - 7);
      if (logDate < oneWeekAgo || logDate > selDate) return false;
    } else if (viewMode === 'monat') {
      if (logDate.getFullYear() !== selDate.getFullYear() || logDate.getMonth() !== selDate.getMonth()) return false;
    }

    // 3. Search query filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchNote = item.note.toLowerCase().includes(q);
      const matchBy = item.loggedBy.toLowerCase().includes(q);
      if (!matchTitle && !matchNote && !matchBy) return false;
    }

    return true;
  });

  // Delete Action confirmation
  const handleDeleteItemClick = (item: FeedItem) => {
    setDeleteCandidate(item);
  };

  const confirmDelete = () => {
    if (!deleteCandidate) return;
    const item = deleteCandidate;
    
    if (item.type === 'meal') deleteMealLog(item.id);
    else if (item.type === 'sleep') deleteSleepLog(item.id);
    else if (item.type === 'diaper') deleteDiaperLog(item.id);
    else if (item.type === 'medicine') deleteMedicineLog(item.id);
    else if (item.type === 'appointment') deleteAppointmentLog(item.id);

    setDeleteCandidate(null);
  };

  // Inline edit initiator
  const handleStartEdit = (item: FeedItem) => {
    setEditingId(item.id);
    setEditAmount(item.amount || 0);
    setEditNote(item.note);
  };

  const handleSaveEdit = (item: FeedItem) => {
    if (item.type === 'meal') {
      editMealLog({
        ...item.raw,
        amount: Number(editAmount),
        note: editNote
      });
    }
    setEditingId(null);
  };

  // Quick select dates helpers
  const handleShiftDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">Aktivitäts-Verlauf</h2>
          <p className="text-gray-500 text-sm font-medium">Übersicht und Detailbearbeitung aller protokollierten Tage.</p>
        </div>

        {/* View Mode selection */}
        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-100 self-start">
          <button 
            onClick={() => setViewMode('tag')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${viewMode === 'tag' ? 'bg-white text-gray-800 shadow-xs' : 'text-gray-500'}`}
          >
            Tagesansicht
          </button>
          <button 
            onClick={() => setViewMode('woche')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${viewMode === 'woche' ? 'bg-white text-gray-800 shadow-xs' : 'text-gray-500'}`}
          >
            Wochenansicht
          </button>
          <button 
            onClick={() => setViewMode('monat')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${viewMode === 'monat' ? 'bg-white text-gray-800 shadow-xs' : 'text-gray-500'}`}
          >
            Monat
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteCandidate && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[32px] p-6 max-w-sm w-full border border-gray-100 shadow-xl space-y-4"
            >
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Eintrag löschen?
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Möchtest du diesen Eintrag (<strong className="text-gray-700">{deleteCandidate.title}</strong>) wirklich unwiderruflich löschen?
              </p>
              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Ja, Löschen
                </button>
                <button
                  onClick={() => setDeleteCandidate(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Abbrechen
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Filters and Date Navigator */}
        <div className="lg:col-span-1 space-y-5">
          {/* Calendar Picker Card */}
          <div className="bg-white rounded-[32px] border border-gray-50 shadow-xl shadow-gray-200/50 p-5 space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Datum wählen
            </h3>
            
            <div className="space-y-3">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleShiftDate(-1)}
                  className="py-2 bg-gray-50 hover:bg-gray-100 text-xs font-black text-gray-600 rounded-xl border border-gray-100 transition-colors cursor-pointer"
                >
                  ◀ Gestern
                </button>
                <button
                  onClick={() => handleShiftDate(1)}
                  className="py-2 bg-gray-50 hover:bg-gray-100 text-xs font-black text-gray-600 rounded-xl border border-gray-100 transition-colors cursor-pointer"
                >
                  Morgen ▶
                </button>
              </div>
            </div>
          </div>

          {/* Quick Filters Sidebar */}
          <div className="bg-white rounded-[32px] border border-gray-50 shadow-xl shadow-gray-200/50 p-5 space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-indigo-600" />
              Kategorie filtern
            </h3>

            <div className="flex flex-col gap-1.5">
              {[
                { value: 'all', label: 'Alle Aktivitäten', emoji: '✨', hoverBg: 'hover:bg-slate-50' },
                { value: 'milch', label: 'Nur Milch', emoji: '🍼', hoverBg: 'hover:bg-sky-50 text-sky-600' },
                { value: 'brei', label: 'Nur Brei', emoji: '🥣', hoverBg: 'hover:bg-amber-50 text-amber-600' },
                { value: 'getraenke', label: 'Nur Getränke', emoji: '🥤', hoverBg: 'hover:bg-emerald-50 text-emerald-600' },
                { value: 'schlaf', label: 'Nur Schlaf', emoji: '😴', hoverBg: 'hover:bg-indigo-50 text-indigo-600' },
                { value: 'windeln', label: 'Nur Windeln', emoji: '🧷', hoverBg: 'hover:bg-rose-50 text-rose-600' },
                { value: 'medikamente', label: 'Nur Medikamente', emoji: '💊', hoverBg: 'hover:bg-purple-50 text-purple-600' },
                { value: 'arzt', label: 'Nur Arzttermine', emoji: '🩺', hoverBg: 'hover:bg-yellow-50 text-yellow-600' },
              ].map(item => {
                const isActive = filter === item.value;
                return (
                  <button
                    key={item.value}
                    onClick={() => setFilter(item.value as FilterType)}
                    className={`w-full px-3 py-2 text-xs font-bold rounded-xl flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                      isActive 
                        ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/10' 
                        : `text-gray-600 ${item.hoverBg} bg-transparent`
                    }`}
                  >
                    <span className="text-base">{item.emoji}</span>
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Feed Stream with Edit / Delete actions */}
        <div className="lg:col-span-3 space-y-4 bg-white rounded-[32px] border border-gray-50 shadow-xl shadow-gray-200/50 p-6">
          {/* Search bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Suche nach Notizen, Medikamenten, Ärzten..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs text-gray-800 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="flex items-center justify-between border-b border-gray-50 pb-2 text-xs text-gray-400 font-bold">
            <span>
              Zeige {filteredFeed.length} von {feedItems.length} Einträgen
            </span>
            <span>
              {viewMode === 'tag' ? 'Ausgewählter Tag' : viewMode === 'woche' ? 'Letzte 7 Tage' : 'Ausgewählter Monat'}
            </span>
          </div>

          {/* Timeline Feed Stream */}
          {filteredFeed.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-xs space-y-2">
              <p className="text-2xl">🔍</p>
              <p className="font-extrabold text-gray-600">Keine Einträge für diese Auswahl gefunden.</p>
              <p className="text-[11px] font-medium">Passe deine Filter an oder füge neue Aktivitäten hinzu.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {filteredFeed.map(item => {
                const isMilch = item.type === 'meal' && item.category === 'milch';
                const isBrei = item.type === 'meal' && item.category === 'brei';
                const isGetraenk = item.type === 'meal' && item.category === 'getraenke';
                const isSchlaf = item.type === 'sleep';
                const isWindel = item.type === 'diaper';
                const isMed = item.type === 'medicine';
                const isApp = item.type === 'appointment';

                const avatarEmoji = isMilch ? '🍼' : isBrei ? '🥣' : isGetraenk ? '🥤' : isSchlaf ? '😴' : isWindel ? '🧷' : isMed ? '💊' : '🩺';
                const pillColor = isMilch ? 'bg-sky-50 text-sky-600' : isBrei ? 'bg-amber-50 text-amber-600' : isGetraenk ? 'bg-emerald-50 text-emerald-600' : isSchlaf ? 'bg-indigo-50 text-indigo-600' : isWindel ? 'bg-rose-50 text-rose-600' : isMed ? 'bg-purple-50 text-purple-600' : 'bg-yellow-50 text-yellow-600';

                const isEditing = editingId === item.id;

                return (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 bg-gray-50/50 hover:bg-gray-50/80 border border-gray-100 rounded-2xl flex flex-col sm:flex-row sm:items-start justify-between gap-4 group transition-all"
                  >
                    <div className="flex items-start gap-3.5 flex-1">
                      <span className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 ${pillColor}`}>
                        {avatarEmoji}
                      </span>
                      
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h4 className="text-xs font-bold text-gray-800">{item.title}</h4>
                          <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${pillColor}`}>
                            {item.subTitle}
                          </span>
                        </div>

                        <p className="text-[10px] text-gray-400 font-bold">
                          {formatDate(item.timestamp)} um {formatTime(item.timestamp)} • Erstellt von: {item.loggedBy}
                        </p>

                        {/* Note & Custom inline edits */}
                        {isEditing ? (
                          <div className="space-y-2 mt-2 bg-white p-3 rounded-xl border border-gray-100 max-w-md">
                            {item.type === 'meal' && (
                              <div>
                                <label className="block text-[9px] text-gray-400 font-bold mb-0.5">Menge ({item.unit})</label>
                                <input
                                  type="number"
                                  value={editAmount}
                                  onChange={(e) => setEditAmount(Number(e.target.value))}
                                  className="px-2 py-1 border border-gray-200 rounded text-xs w-24 outline-none focus:border-indigo-300"
                                />
                              </div>
                            )}
                            <div>
                              <label className="block text-[9px] text-gray-400 font-bold mb-0.5">Notiz bearbeiten</label>
                              <input
                                type="text"
                                value={editNote}
                                onChange={(e) => setEditNote(e.target.value)}
                                className="w-full px-2 py-1 border border-gray-200 rounded text-xs outline-none focus:border-indigo-300"
                              />
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleSaveEdit(item)}
                                className="flex items-center gap-0.5 px-2 py-1 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white text-[10px] font-bold rounded cursor-pointer transition-all"
                              >
                                <Check className="w-3.5 h-3.5" /> Sichern
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="flex items-center gap-0.5 px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded cursor-pointer hover:bg-gray-200 transition-all"
                              >
                                <X className="w-3.5 h-3.5" /> Abbrechen
                              </button>
                            </div>
                          </div>
                        ) : (
                          item.note && (
                            <p className="text-[10px] text-gray-500 italic mt-1 bg-white/70 px-2 py-1 rounded-md max-w-sm inline-block border border-gray-100/50">
                              "{item.note}"
                            </p>
                          )
                        )}
                      </div>
                    </div>

                    {/* Actions panel */}
                    <div className="flex items-center gap-1 self-end sm:self-start sm:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      {/* Only meals currently support inline amount editing for simplicity */}
                      {item.type === 'meal' && !isEditing && (
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                          title="Eintrag bearbeiten"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteItemClick(item)}
                        className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50/50 rounded-lg transition-colors cursor-pointer"
                        title="Eintrag löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
