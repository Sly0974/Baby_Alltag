import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { MealCategory, MealSubType } from '../types';
import { calculateMealStats, formatTime, formatDate } from '../utils';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, Plus, Coffee, Moon, Sparkles, AlertCircle, 
  Trash2, PlusCircle, Check, HelpCircle, Utensils, Droplet 
} from 'lucide-react';

export default function MahlzeitenPage() {
  const { activeChild, mealLogs, addMealLog, deleteMealLog } = useApp();

  const [category, setCategory] = useState<MealCategory>('milch');
  const [subType, setSubType] = useState<MealSubType>('PRE');
  const [amount, setAmount] = useState<number>(150);
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [note, setNote] = useState('');
  const [success, setSuccess] = useState(false);

  if (!activeChild) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[70vh]">
        <div className="text-4xl mb-4">👶</div>
        <h3 className="text-xl font-bold text-slate-800">Noch kein Baby-Profil angelegt</h3>
        <p className="text-slate-500 mt-2 max-w-sm text-sm">Bitte erstelle ein Baby-Profil im Profil-Tab, um die Mahlzeiten zu protokollieren.</p>
      </div>
    );
  }

  const handleCategoryChange = (cat: MealCategory) => {
    setCategory(cat);
    if (cat === 'milch') {
      setSubType('PRE');
      setAmount(150);
    } else if (cat === 'brei') {
      setSubType('Gemüse');
      setAmount(120);
    } else {
      setSubType('Wasser');
      setAmount(80);
    }
  };

  const subTypes: Record<MealCategory, MealSubType[]> = {
    milch: ['Muttermilch', 'PRE', '1er', '2er', 'Spezialmilch', 'Stillen'],
    brei: ['Gemüse', 'Obst', 'Abendbrei', 'Frühstück', 'Mittag', 'Snack'],
    getraenke: ['Wasser', 'Tee', 'Saft']
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const timestamp = new Date(`${date}T${time}`).toISOString();
    const unit = category === 'brei' ? 'g' : 'ml';
    
    addMealLog({
      childId: activeChild.id,
      timestamp,
      category,
      subType,
      amount: Number(amount),
      unit,
      note
    });

    setNote('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  // Stats calculations
  const stats = calculateMealStats(mealLogs, activeChild.id);
  const childMeals = mealLogs.filter(log => log.childId === activeChild.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Mahlzeiten protokollieren</h2>
        <p className="text-gray-500 text-sm">Erfasse Milch, Brei und Getränke für {activeChild.name}.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Add Meal Form */}
        <div className="lg:col-span-1 bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/50 p-6 space-y-5">
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 border-b border-gray-50 pb-3">
            <PlusCircle className="w-5 h-5 text-indigo-500" />
            Eintrag hinzufügen
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Tabs */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Kategorie</label>
              <div className="grid grid-cols-3 gap-1.5 bg-gray-100/80 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleCategoryChange('milch')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    category === 'milch' ? 'bg-white text-sky-600 shadow-xs border border-indigo-50/10' : 'text-gray-500'
                  }`}
                >
                  🍼 Milch
                </button>
                <button
                  type="button"
                  onClick={() => handleCategoryChange('brei')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    category === 'brei' ? 'bg-white text-orange-600 shadow-xs border border-indigo-50/10' : 'text-gray-500'
                  }`}
                >
                  🥣 Brei
                </button>
                <button
                  type="button"
                  onClick={() => handleCategoryChange('getraenke')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    category === 'getraenke' ? 'bg-white text-emerald-600 shadow-xs border border-indigo-50/10' : 'text-gray-500'
                  }`}
                >
                  🥤 Getränk
                </button>
              </div>
            </div>

            {/* Sub-Type list (Pills) */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Typ</label>
              <div className="flex flex-wrap gap-1.5">
                {subTypes[category].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSubType(type)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      subType === type 
                        ? 'border-indigo-300 bg-indigo-50 text-indigo-600 shadow-xs shadow-indigo-100' 
                        : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Datum</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-800 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Uhrzeit</label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-800 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* Amount with range slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-400">Menge</label>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50/50 px-2 py-0.5 rounded-md border border-indigo-100/45">
                  {amount} {category === 'brei' ? 'g' : 'ml'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={category === 'brei' ? "400" : "300"}
                step={category === 'brei' ? "5" : "10"}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[9px] text-gray-400 mt-1 font-bold">
                <span>0</span>
                <span>Mittel ({category === 'brei' ? '150g' : '150ml'})</span>
                <span>Max ({category === 'brei' ? '400g' : '300ml'})</span>
              </div>
            </div>

            {/* Note text field */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">Notiz</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="z.B. gut vertragen, alles aufgegessen..."
                rows={2}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-800 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 resize-none placeholder:text-gray-400"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/10 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              Speichern
            </button>

            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-2.5 bg-emerald-50 text-emerald-600 text-xs rounded-xl border border-emerald-100 flex items-center gap-1.5 font-bold"
                >
                  <Check className="w-4 h-4" /> Mahlzeit erfolgreich aufgezeichnet!
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* Right column: Calculations / Statistics Overview & History List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Calculations Stats Block */}
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/50 p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              Automatische Berechnungen & Statistiken
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-sky-50/40 p-3.5 rounded-2xl border border-sky-50">
                <span className="block text-[10px] text-sky-600 font-bold uppercase tracking-wider">Milch Gesamt</span>
                <span className="block text-lg font-bold text-gray-800 mt-1">{stats.totalMilchHeute} ml</span>
                <span className="text-[9px] text-gray-400 font-bold">Woche: {stats.totalMilchWoche} ml</span>
              </div>

              <div className="bg-orange-50/40 p-3.5 rounded-2xl border border-orange-50">
                <span className="block text-[10px] text-orange-600 font-bold uppercase tracking-wider">Brei Gesamt</span>
                <span className="block text-lg font-bold text-gray-800 mt-1">{stats.totalBreiHeute} g</span>
                <span className="text-[9px] text-gray-400 font-bold">Woche: {stats.totalBreiWoche} g</span>
              </div>

              <div className="bg-emerald-50/40 p-3.5 rounded-2xl border border-emerald-50">
                <span className="block text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Getränke</span>
                <span className="block text-lg font-bold text-gray-800 mt-1">{stats.totalGetraenkeHeute} ml</span>
                <span className="text-[9px] text-gray-400 font-bold">Woche: {stats.totalGetraenkeWoche} ml</span>
              </div>

              <div className="bg-purple-50/40 p-3.5 rounded-2xl border border-purple-50">
                <span className="block text-[10px] text-purple-600 font-bold uppercase tracking-wider">Ø Mahlzeit</span>
                <span className="block text-lg font-bold text-gray-800 mt-1">{stats.avgAmountPerMeal} ml/g</span>
                <span className="text-[9px] text-gray-400 font-bold">Ø Tag: {stats.avgAmountPerDay} ml/g</span>
              </div>
            </div>

            {/* Mini records */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs p-3 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                <span className="text-[10px] text-gray-400 font-bold block">Größte Mahlzeit</span>
                <span className="font-bold text-gray-700">{stats.largestMeal || 0} ml/g</span>
              </div>
              <div className="border-x border-gray-200/50">
                <span className="text-[10px] text-gray-400 font-bold block">Kleinste Mahlzeit</span>
                <span className="font-bold text-gray-700">{stats.smallestMeal === Infinity ? 0 : stats.smallestMeal} ml/g</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold block">Gesamtanzahl</span>
                <span className="font-bold text-gray-700">{stats.mealCount} Mal geloggt</span>
              </div>
            </div>
          </div>

          {/* Meals History Timeline */}
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/50 p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-800">Protokollierte Mahlzeiten ({childMeals.length})</h3>

            {childMeals.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-xs">
                Keine Mahlzeiten für {activeChild.name} eingetragen.
              </div>
            ) : (
              <div className="max-h-[380px] overflow-y-auto pr-1 space-y-2 divide-y divide-gray-50">
                {childMeals.map(log => {
                  const isMilch = log.category === 'milch';
                  const isBrei = log.category === 'brei';
                  const themeColor = isMilch ? 'text-sky-600 bg-sky-50' : isBrei ? 'text-orange-600 bg-orange-50' : 'text-emerald-600 bg-emerald-50';

                  return (
                    <div key={log.id} className="flex items-center justify-between py-3 group first:pt-0">
                      <div className="flex items-start gap-3">
                        <span className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${themeColor}`}>
                          {isMilch ? '🍼' : isBrei ? '🥣' : '🥤'}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-gray-800">{log.subType}</h4>
                            <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-bold">
                              {log.amount} {log.unit}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-0.5 font-semibold">
                            {formatDate(log.timestamp)} um {formatTime(log.timestamp)} • Erstellt von: {log.loggedBy}
                          </p>
                          {log.note && (
                            <p className="text-[10px] text-gray-500 italic mt-1 bg-gray-50 px-2 py-1 rounded-md max-w-sm">
                              "{log.note}"
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => deleteMealLog(log.id)}
                        className="text-gray-300 hover:text-red-500 p-2 rounded-lg hover:bg-red-50/50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                        title="Eintrag löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
