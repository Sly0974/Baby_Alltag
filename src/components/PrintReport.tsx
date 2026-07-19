import React from 'react';
import { useApp } from '../AppContext';
import { getBabyAge } from '../utils';
import { 
  Heart, Calendar, Scale, Ruler, Clock, 
  Baby, Moon, Coffee, Pill, ShieldCheck 
} from 'lucide-react';

export default function PrintReport() {
  const { 
    activeChild, 
    mealLogs, 
    sleepLogs, 
    diaperLogs, 
    growthLogs, 
    medicineLogs, 
    appointmentLogs 
  } = useApp();

  if (!activeChild) return null;

  // Generate date range for the past 7 days
  const getPast7Days = () => {
    const list = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      list.push(d);
    }
    return list;
  };

  const pastDays = getPast7Days();

  // Helper to parse dates without timezone shifts
  const getLocalDateString = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Prepare chart data for Milch
  const milchData = pastDays.map(d => {
    const dateStr = getLocalDateString(d);
    const sum = mealLogs
      .filter(log => log.childId === activeChild.id && log.category === 'milch' && log.timestamp.startsWith(dateStr))
      .reduce((acc, log) => acc + log.amount, 0);
    return {
      label: d.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit' }),
      value: sum
    };
  });

  // Prepare chart data for Brei
  const breiData = pastDays.map(d => {
    const dateStr = getLocalDateString(d);
    const sum = mealLogs
      .filter(log => log.childId === activeChild.id && log.category === 'brei' && log.timestamp.startsWith(dateStr))
      .reduce((acc, log) => acc + log.amount, 0);
    return {
      label: d.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit' }),
      value: sum
    };
  });

  // Prepare chart data for Schlaf (hours)
  const schlafData = pastDays.map(d => {
    const dateStr = getLocalDateString(d);
    const totalMinutes = sleepLogs
      .filter(log => log.childId === activeChild.id && log.startTime.startsWith(dateStr))
      .reduce((acc, log) => acc + log.duration, 0);
    return {
      label: d.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit' }),
      value: Number((totalMinutes / 60).toFixed(1))
    };
  });

  // Prepare chart data for Windeln
  const windelData = pastDays.map(d => {
    const dateStr = getLocalDateString(d);
    const count = diaperLogs
      .filter(log => log.childId === activeChild.id && log.timestamp.startsWith(dateStr))
      .length;
    return {
      label: d.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit' }),
      value: count
    };
  });

  // Growth Trend (Weight and Height)
  const sortedGrowth = [...growthLogs]
    .filter(log => log.childId === activeChild.id)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .slice(-7); // Last 7 measurements

  // Check notes for body temperatures (e.g., matching pattern "37.5" or "Fieber" or similar)
  const temperatureLogs = [
    ...mealLogs.map(l => ({ timestamp: l.timestamp, note: l.note })),
    ...sleepLogs.map(l => ({ timestamp: l.startTime, note: l.note })),
    ...diaperLogs.map(l => ({ timestamp: l.timestamp, note: l.note })),
    ...growthLogs.map(l => ({ timestamp: l.timestamp, note: l.note })),
    ...medicineLogs.map(l => ({ timestamp: l.timestamp, note: l.note }))
  ]
    .filter(item => {
      if (!item.note) return false;
      const regex = /(\d{2}[.,]\d)\s*(°C|C)/gi;
      return regex.test(item.note) || item.note.toLowerCase().includes('fieber') || item.note.toLowerCase().includes('temp');
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5); // Last 5 recorded temp notes

  // Assemble chronological logs of the past 7 days combined
  interface ChronoItem {
    id: string;
    timestamp: string;
    type: string;
    description: string;
    loggedBy: string;
    color: string;
  }

  const combinedChronological: ChronoItem[] = [];

  const past7DaysStrings = pastDays.map(d => getLocalDateString(d));

  // 1. Add meals
  mealLogs
    .filter(log => log.childId === activeChild.id && past7DaysStrings.some(day => log.timestamp.startsWith(day)))
    .forEach(log => {
      combinedChronological.push({
        id: log.id,
        timestamp: log.timestamp,
        type: 'Mahlzeit',
        description: `🍼 ${log.subType}: ${log.amount} ${log.unit}${log.note ? ` (${log.note})` : ''}`,
        loggedBy: log.loggedBy,
        color: log.category === 'milch' ? 'sky' : log.category === 'brei' ? 'amber' : 'emerald'
      });
    });

  // 2. Add sleep
  sleepLogs
    .filter(log => log.childId === activeChild.id && past7DaysStrings.some(day => log.startTime.startsWith(day)))
    .forEach(log => {
      const hrs = Math.floor(log.duration / 60);
      const mins = log.duration % 60;
      combinedChronological.push({
        id: log.id,
        timestamp: log.startTime,
        type: 'Schlaf',
        description: `😴 Schlaf: ${hrs > 0 ? `${hrs} Std ` : ''}${mins} Min${log.note ? ` (${log.note})` : ''}`,
        loggedBy: log.loggedBy,
        color: 'indigo'
      });
    });

  // 3. Add diapers
  diaperLogs
    .filter(log => log.childId === activeChild.id && past7DaysStrings.some(day => log.timestamp.startsWith(day)))
    .forEach(log => {
      const label = log.type === 'pipi' ? 'Pipi' : log.type === 'gross' ? 'Stuhlgang' : 'Pipi & Stuhlgang';
      combinedChronological.push({
        id: log.id,
        timestamp: log.timestamp,
        type: 'Windel',
        description: `🧷 Windelwechsel: ${label}${log.note ? ` (${log.note})` : ''}`,
        loggedBy: log.loggedBy,
        color: 'rose'
      });
    });

  // 4. Add medications
  medicineLogs
    .filter(log => log.childId === activeChild.id && past7DaysStrings.some(day => log.timestamp.startsWith(day)))
    .forEach(log => {
      combinedChronological.push({
        id: log.id,
        timestamp: log.timestamp,
        type: 'Medikament',
        description: `💊 ${log.name} (${log.dosage}) - ${log.timeOfDay}${log.note ? ` (${log.note})` : ''}`,
        loggedBy: log.loggedBy,
        color: 'purple'
      });
    });

  // 5. Add Appointments
  appointmentLogs
    .filter(log => log.childId === activeChild.id && past7DaysStrings.some(day => log.timestamp.startsWith(day)))
    .forEach(log => {
      combinedChronological.push({
        id: log.id,
        timestamp: log.timestamp,
        type: 'Arzttermin',
        description: `🏥 ${log.title} bei ${log.doctor}${log.note ? ` (${log.note})` : ''}`,
        loggedBy: log.loggedBy,
        color: 'teal'
      });
    });

  // Sort chronological combined logs descending by timestamp
  combinedChronological.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Group chronological items by date
  const groupedChronology: { [key: string]: ChronoItem[] } = {};
  combinedChronological.forEach(item => {
    const d = new Date(item.timestamp);
    const dateStr = d.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
    if (!groupedChronology[dateStr]) {
      groupedChronology[dateStr] = [];
    }
    groupedChronology[dateStr].push(item);
  });

  // Helper to draw a clean, custom inline SVG chart
  const renderSVGChart = (
    data: { label: string; value: number }[],
    color: 'sky' | 'amber' | 'indigo' | 'rose' | 'purple',
    unit: string,
    isBarChart: boolean = false
  ) => {
    const width = 280;
    const height = 110;
    const paddingLeft = 35;
    const paddingRight = 10;
    const paddingTop = 15;
    const paddingBottom = 20;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const maxVal = Math.max(...data.map(d => d.value), 5);

    // Color theme configuration
    const colorThemes = {
      sky: { stroke: '#38bdf8', fill: 'rgba(224,242,254,0.4)', bar: '#38bdf8' },
      amber: { stroke: '#fbbf24', fill: 'rgba(254,243,199,0.4)', bar: '#fbbf24' },
      indigo: { stroke: '#6366f1', fill: 'rgba(224,231,255,0.4)', bar: '#6366f1' },
      rose: { stroke: '#f43f5e', fill: 'rgba(253,244,245,0.4)', bar: '#f43f5e' },
      purple: { stroke: '#a855f7', fill: 'rgba(243,232,255,0.4)', bar: '#a855f7' }
    };
    const activeColor = colorThemes[color] || colorThemes.indigo;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[110px] overflow-visible">
        {/* Grid lines */}
        {[0, 0.5, 1].map((ratio, idx) => {
          const y = paddingTop + chartHeight * (1 - ratio);
          const gridVal = Math.round(maxVal * ratio);
          return (
            <g key={idx}>
              <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#f1f5f9" strokeWidth="1" />
              <text x={paddingLeft - 6} y={y + 3} className="text-[7px] font-bold font-mono text-gray-400 fill-current" textAnchor="end">
                {gridVal}
              </text>
            </g>
          );
        })}

        {/* Chart rendering */}
        {isBarChart ? (
          data.map((d, i) => {
            const barWidth = chartWidth / data.length * 0.6;
            const x = paddingLeft + (chartWidth / data.length) * i + (chartWidth / data.length - barWidth) / 2;
            const barHeight = chartHeight * (d.value / maxVal || 0);
            const y = paddingTop + chartHeight - barHeight;
            return (
              <g key={i}>
                <rect x={x} y={y} width={barWidth} height={Math.max(barHeight, 2)} rx="2" fill={activeColor.bar} />
                <text x={x + barWidth / 2} y={y - 3} className="text-[6px] font-black font-mono text-gray-700 fill-current" textAnchor="middle">
                  {d.value}
                </text>
              </g>
            );
          })
        ) : (
          (() => {
            const points = data.map((d, i) => {
              const x = paddingLeft + (chartWidth / (data.length - 1 || 1)) * i;
              const y = paddingTop + chartHeight * (1 - (d.value / maxVal || 0));
              return { x, y };
            });

            const pathD = points.reduce((acc, p, i) => {
              return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
            }, '');

            const fillD = points.length > 0
              ? `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
              : '';

            return (
              <g>
                {fillD && <path d={fillD} fill={activeColor.fill} />}
                <path d={pathD} fill="none" stroke={activeColor.stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {points.map((p, i) => (
                  <g key={i}>
                    <circle cx={p.x} cy={p.y} r="3.5" fill="#ffffff" stroke={activeColor.stroke} strokeWidth="1.8" />
                    <text x={p.x} y={p.y - 4} className="text-[6px] font-black font-mono text-gray-700 fill-current" textAnchor="middle">
                      {data[i].value}
                    </text>
                  </g>
                ))}
              </g>
            );
          })()
        )}

        {/* X labels */}
        {data.map((d, i) => {
          const x = paddingLeft + (chartWidth / (data.length - 1 || 1)) * i;
          const barX = paddingLeft + (chartWidth / data.length) * i + (chartWidth / data.length) / 2;
          return (
            <text key={i} x={isBarChart ? barX : x} y={height - 5} className="text-[7px] font-bold text-gray-400 fill-current" textAnchor="middle">
              {d.label}
            </text>
          );
        })}
      </svg>
    );
  };

  return (
    <div id="babycare-print-report" className="hidden print:block bg-white text-gray-800 p-8 min-h-screen font-sans antialiased text-sm leading-relaxed max-w-[21cm] mx-auto">
      
      {/* Decorative colored bar */}
      <div className="h-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-lg -mx-8 -mt-8 mb-8" />

      {/* ========================================================
          KOPFBEREICH / HERO HEADER
          ======================================================== */}
      <div className="flex flex-col items-center justify-center text-center space-y-4 border-b border-gray-100 pb-8 mb-8">
        
        {/* Big centered profile image with golden frame */}
        <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-indigo-100 shadow-xl mb-2">
          <img 
            src={activeChild.photoUrl} 
            alt={activeChild.name} 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover" 
          />
        </div>

        <div>
          <span className="text-[10px] tracking-widest uppercase font-black text-indigo-600 bg-indigo-50 px-3.5 py-1.5 rounded-full border border-indigo-100/50">
            Offizieller Entwicklungsbericht
          </span>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mt-3">{activeChild.name}</h1>
          
          <div className="flex justify-center items-center gap-6 mt-3 text-xs text-gray-500 font-semibold flex-wrap">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-500" />
              Geboren am {new Date(activeChild.birthDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1.5">
              <Baby className="w-4 h-4 text-purple-500" />
              Alter: {getBabyAge(activeChild.birthDate)}
            </span>
          </div>
        </div>

        <div className="w-full max-w-md bg-gray-50/60 rounded-2xl p-4 border border-gray-100/60 text-center flex justify-around text-[11px] text-gray-400 font-bold mt-2">
          <div>
            <span>Aktuelles Gewicht</span>
            <p className="text-base text-gray-800 font-black mt-0.5">{activeChild.weight.toFixed(1)} kg</p>
          </div>
          <div className="border-r border-gray-200" />
          <div>
            <span>Aktuelle Körpergröße</span>
            <p className="text-base text-gray-800 font-black mt-0.5">{activeChild.height} cm</p>
          </div>
          <div className="border-r border-gray-200" />
          <div>
            <span>Erstellungsdatum</span>
            <p className="text-base text-gray-800 font-black mt-0.5">{new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
      </div>

      {/* ========================================================
          STATISTIK SECTION (VISUALIZED CHARTS)
          ======================================================== */}
      <div className="space-y-6 break-inside-avoid">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
          <Heart className="w-5 h-5 text-indigo-600 fill-indigo-500" />
          <h2 className="text-lg font-extrabold text-gray-800 uppercase tracking-wider">Aktivitäts-Statistiken (Letzte 7 Tage)</h2>
        </div>

        {/* Grid layout of vector charts */}
        <div className="grid grid-cols-2 gap-6">
          
          {/* Milchverlauf */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-gray-800 uppercase tracking-wide">🥛 Milchmenge (ml)</span>
              <span className="text-[9px] font-bold text-sky-500 bg-sky-50 px-2 py-0.5 rounded-md">Gesamt</span>
            </div>
            {renderSVGChart(milchData, 'sky', 'ml', false)}
          </div>

          {/* Essensverlauf / Brei */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-gray-800 uppercase tracking-wide">🥣 Breimenge (g)</span>
              <span className="text-[9px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md">Balken</span>
            </div>
            {renderSVGChart(breiData, 'amber', 'g', true)}
          </div>

          {/* Schlafverlauf */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-gray-800 uppercase tracking-wide">😴 Schlafstunden (Std.)</span>
              <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">Dauer</span>
            </div>
            {renderSVGChart(schlafData, 'indigo', 'Std', false)}
          </div>

          {/* Windeln */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-gray-800 uppercase tracking-wide">🧷 Windelwechsel (Anzahl)</span>
              <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md">Häufigkeit</span>
            </div>
            {renderSVGChart(windelData, 'rose', 'Mal', true)}
          </div>

        </div>
      </div>

      {/* Page break to keep physical layouts extremely structured */}
      <div className="page-break" />

      {/* ========================================================
          GROWTH & HEALTH SECTION (Weight, Height, Medicine, Temperature)
          ======================================================== */}
      <div className="space-y-6 mt-8 break-inside-avoid">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
          <Scale className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-extrabold text-gray-800 uppercase tracking-wider">Körperentwicklung & Gesundheit</h2>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Growth Data Table */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <span className="text-xs font-black text-gray-800 uppercase tracking-wide block">📈 Letzte Messwerte (Gewicht & Größe)</span>
            <div className="overflow-hidden border border-gray-100 rounded-xl">
              <table className="w-full text-[10px] text-left text-gray-600">
                <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-[9px]">
                  <tr>
                    <th className="px-3 py-2">Datum</th>
                    <th className="px-3 py-2 text-right">Gewicht</th>
                    <th className="px-3 py-2 text-right">Größe</th>
                    <th className="px-3 py-2 text-right">Kopfumf.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {sortedGrowth.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-4 text-center text-gray-400">Keine Messwerte protokolliert</td>
                    </tr>
                  ) : (
                    sortedGrowth.map((g, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="px-3 py-2">{new Date(g.timestamp).toLocaleDateString('de-DE')}</td>
                        <td className="px-3 py-2 text-right font-bold text-gray-800">{g.weight.toFixed(1)} kg</td>
                        <td className="px-3 py-2 text-right font-bold text-gray-800">{g.height} cm</td>
                        <td className="px-3 py-2 text-right text-gray-500">{g.headCircumference} cm</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Temperature & Medicine Notes */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <span className="text-xs font-black text-gray-800 uppercase tracking-wide block">🌡️ Körpertemperatur (aus Notizen) & Medikamente</span>
            
            <div className="space-y-2">
              {/* Temperature notes extracts */}
              <div className="border border-gray-100 rounded-xl p-2.5 space-y-1.5 bg-rose-50/25">
                <span className="text-[9px] font-black text-rose-600 uppercase tracking-wider block">Körpertemperatur Notizen</span>
                {temperatureLogs.length === 0 ? (
                  <p className="text-[10px] text-gray-400 font-bold">Keine Fieber- oder Temperatur-Einträge gefunden.</p>
                ) : (
                  temperatureLogs.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[10px] border-b border-gray-100/50 last:border-none pb-1 last:pb-0">
                      <span className="text-gray-500 font-medium">{new Date(item.timestamp).toLocaleDateString('de-DE')}</span>
                      <span className="font-extrabold text-rose-700">{item.note}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Active medication lists */}
              <div className="border border-gray-100 rounded-xl p-2.5 space-y-1.5 bg-purple-50/25">
                <span className="text-[9px] font-black text-purple-600 uppercase tracking-wider block">Medikamenten-Log</span>
                {medicineLogs.filter(m => m.childId === activeChild.id).length === 0 ? (
                  <p className="text-[10px] text-gray-400 font-bold">Keine Medikamente protokolliert.</p>
                ) : (
                  medicineLogs
                    .filter(m => m.childId === activeChild.id)
                    .slice(0, 3)
                    .map((item, idx) => (
                      <div key={idx} className="flex justify-between text-[10px] border-b border-gray-100/50 last:border-none pb-1 last:pb-0">
                        <span className="text-gray-500 font-medium">{item.name} ({item.dosage})</span>
                        <span className="font-extrabold text-purple-700">{item.timeOfDay}</span>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page break before combined chronological timeline to ensure perfect page layout spacing */}
      <div className="page-break" />

      {/* ========================================================
          CHRONOLOGISCHER VERLAUF SECTION (grouped daily combined list)
          ======================================================== */}
      <div className="space-y-6 mt-8 break-inside-avoid">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
          <Clock className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-extrabold text-gray-800 uppercase tracking-wider">Chronologischer Verlauf (Vergangene 7 Tage)</h2>
        </div>

        {Object.keys(groupedChronology).length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-100 font-bold text-gray-400">
            Keine Aktivitäten für die letzten 7 Tage protokolliert.
          </div>
        ) : (
          <div className="space-y-6">
            {Object.keys(groupedChronology).map((dayKey) => (
              <div key={dayKey} className="space-y-2 break-inside-avoid">
                <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100/30 inline-block">
                  📅 {dayKey}
                </span>

                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100">
                  {groupedChronology[dayKey].map((item, idx) => {
                    const timeStr = new Date(item.timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
                    
                    return (
                      <div key={item.id || idx} className="p-3.5 flex items-start justify-between text-[11px] gap-4 hover:bg-gray-50/30">
                        <div className="flex items-center gap-3">
                          <span className="font-bold font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md shrink-0">
                            {timeStr}
                          </span>
                          <span className="text-gray-700 font-semibold leading-relaxed">
                            {item.description}
                          </span>
                        </div>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider shrink-0 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md">
                          Eintrag: {item.loggedBy}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer copyright */}
      <div className="border-t border-gray-100 mt-12 pt-6 flex items-center justify-between text-[10px] text-gray-400 font-bold">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
          BabyCare+ Premium Bericht
        </span>
        <span>Seite 1 von 1 (A4 Format)</span>
      </div>

    </div>
  );
}
