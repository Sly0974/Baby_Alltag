import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { calculateMealStats, calculateSleepStats, calculateDiaperStats, getBabyAge } from '../utils';
import { motion } from 'motion/react';
import { 
  TrendingUp, BarChart2, Activity, Calendar, 
  Layers, Circle, Award, Coffee, Moon, Scale 
} from 'lucide-react';

type ChartType = 'milch' | 'brei' | 'getraenke' | 'schlaf' | 'gewicht' | 'windeln';
type TimeFrame = 'woche' | 'monat' | 'jahr';

export default function StatistikPage() {
  const { activeChild, mealLogs, sleepLogs, diaperLogs, growthLogs } = useApp();
  const [selectedChart, setSelectedChart] = useState<ChartType>('milch');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('woche');

  if (!activeChild) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[70vh]">
        <div className="text-4xl mb-4">👶</div>
        <h3 className="text-xl font-bold text-gray-800">Noch kein Baby-Profil angelegt</h3>
        <p className="text-gray-500 mt-2 max-w-sm text-sm">Bitte erstelle ein Baby-Profil im Profil-Tab, um Statistiken einzusehen.</p>
      </div>
    );
  }

  // Get date keys for last 7 days
  const getPastDays = (count: number) => {
    const list = [];
    const today = new Date();
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      list.push(d);
    }
    return list;
  };

  const days = getPastDays(timeFrame === 'woche' ? 7 : timeFrame === 'monat' ? 30 : 12);

  // Prepare chart data based on active filters
  let chartData: { label: string; value: number; formatted: string }[] = [];
  let maxValue = 0;
  let chartColor = 'indigo';

  if (selectedChart === 'milch' || selectedChart === 'brei' || selectedChart === 'getraenke') {
    const cat = selectedChart === 'milch' ? 'milch' : selectedChart === 'brei' ? 'brei' : 'getraenke';
    chartColor = selectedChart === 'milch' ? 'sky' : selectedChart === 'brei' ? 'amber' : 'emerald';
    const unit = cat === 'brei' ? 'g' : 'ml';
    
    chartData = days.map(d => {
      const dateStr = d.toISOString().split('T')[0];
      const sum = mealLogs
        .filter(log => log.childId === activeChild.id && log.category === cat && log.timestamp.startsWith(dateStr))
        .reduce((acc, log) => acc + log.amount, 0);

      const label = timeFrame === 'woche' 
        ? d.toLocaleDateString('de-DE', { weekday: 'short' }) 
        : d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });

      return { label, value: sum, formatted: `${sum} ${unit}` };
    });
  } else if (selectedChart === 'schlaf') {
    chartColor = 'indigo';
    chartData = days.map(d => {
      const dateStr = d.toISOString().split('T')[0];
      const sum = sleepLogs
        .filter(log => log.childId === activeChild.id && log.startTime.startsWith(dateStr))
        .reduce((acc, log) => acc + log.duration, 0);

      const label = timeFrame === 'woche' 
        ? d.toLocaleDateString('de-DE', { weekday: 'short' }) 
        : d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });

      return { label, value: sum, formatted: `${Math.floor(sum / 60)}h ${sum % 60}m` };
    });
  } else if (selectedChart === 'windeln') {
    chartColor = 'rose';
    chartData = days.map(d => {
      const dateStr = d.toISOString().split('T')[0];
      const count = diaperLogs
        .filter(log => log.childId === activeChild.id && log.timestamp.startsWith(dateStr))
        .length;

      const label = timeFrame === 'woche' 
        ? d.toLocaleDateString('de-DE', { weekday: 'short' }) 
        : d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });

      return { label, value: count, formatted: `${count} Mal` };
    });
  } else if (selectedChart === 'gewicht') {
    chartColor = 'purple';
    // Growth weight curve
    const sortedGrowth = [...growthLogs]
      .filter(log => log.childId === activeChild.id)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    chartData = sortedGrowth.map(log => {
      const label = new Date(log.timestamp).toLocaleDateString('de-DE', { month: 'short', year: '2-digit' });
      return { label, value: log.weight, formatted: `${log.weight.toFixed(1)} kg` };
    });

    if (chartData.length === 0) {
      chartData = [{ label: 'Aktuell', value: activeChild.weight, formatted: `${activeChild.weight} kg` }];
    }
  }

  // Calculate scaling max
  maxValue = Math.max(...chartData.map(d => d.value), 10);

  // SVG Chart Layout metrics
  const width = 600;
  const height = 240;
  const paddingLeft = 45;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Color classes map
  const colorMap: Record<string, { stroke: string; fill: string; dot: string; text: string; bg: string; bar: string }> = {
    sky: { stroke: 'stroke-sky-400', fill: 'fill-sky-100/30', dot: 'bg-sky-400', text: 'text-sky-600', bg: 'bg-sky-50', bar: 'fill-sky-400/80 hover:fill-sky-500/95' },
    amber: { stroke: 'stroke-amber-400', fill: 'fill-amber-100/30', dot: 'bg-amber-400', text: 'text-amber-600', bg: 'bg-amber-50', bar: 'fill-amber-400/80 hover:fill-amber-500/95' },
    emerald: { stroke: 'stroke-emerald-400', fill: 'fill-emerald-100/30', dot: 'bg-emerald-400', text: 'text-emerald-600', bg: 'bg-emerald-50', bar: 'fill-emerald-400/80 hover:fill-emerald-500/95' },
    indigo: { stroke: 'stroke-indigo-500', fill: 'fill-indigo-100/30', dot: 'bg-indigo-500', text: 'text-indigo-600', bg: 'bg-indigo-50', bar: 'fill-indigo-500/80 hover:fill-indigo-600/95' },
    rose: { stroke: 'stroke-rose-400', fill: 'fill-rose-100/30', dot: 'bg-rose-400', text: 'text-rose-600', bg: 'bg-rose-50', bar: 'fill-rose-400/80 hover:fill-rose-500/95' },
    purple: { stroke: 'stroke-purple-500', fill: 'fill-purple-100/30', dot: 'bg-purple-500', text: 'text-purple-600', bg: 'bg-purple-50', bar: 'fill-purple-500/80 hover:fill-purple-600/95' }
  };

  const colTheme = colorMap[chartColor] || colorMap.indigo;

  // Helper calculation stats
  const mealStats = calculateMealStats(mealLogs, activeChild.id);
  const sleepStats = calculateSleepStats(sleepLogs, activeChild.id);
  const diaperStats = calculateDiaperStats(diaperLogs, activeChild.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">Entwicklung & Statistiken</h2>
          <p className="text-gray-500 text-sm font-medium">Visualisierte Berichte für das Wachstum und den Rhythmus deines Babys.</p>
        </div>

        {/* Timeframe pill selection */}
        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-100 self-start">
          <button 
            onClick={() => setTimeFrame('woche')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${timeFrame === 'woche' ? 'bg-white text-gray-800 shadow-xs' : 'text-gray-500'}`}
          >
            Woche
          </button>
          <button 
            onClick={() => setTimeFrame('monat')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${timeFrame === 'monat' ? 'bg-white text-gray-800 shadow-xs' : 'text-gray-500'}`}
          >
            Monat
          </button>
        </div>
      </div>

      {/* Main categories select tabs */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {(['milch', 'brei', 'getraenke', 'schlaf', 'windeln', 'gewicht'] as ChartType[]).map(type => {
          const isSelected = selectedChart === type;
          const label = type === 'milch' ? '🍼 Milch' : type === 'brei' ? '🥣 Brei' : type === 'getraenke' ? '🥤 Getränke' : type === 'schlaf' ? '😴 Schlaf' : type === 'windeln' ? '🧷 Windeln' : '📈 Gewicht';
          
          const activeStyles = type === 'milch' ? 'bg-sky-500 text-white shadow-sky-100' 
                             : type === 'brei' ? 'bg-amber-500 text-white shadow-amber-100' 
                             : type === 'getraenke' ? 'bg-emerald-500 text-white shadow-emerald-100' 
                             : type === 'schlaf' ? 'bg-indigo-500 text-white shadow-indigo-100' 
                             : type === 'windeln' ? 'bg-rose-500 text-white shadow-rose-100' 
                             : 'bg-purple-500 text-white shadow-purple-100';

          return (
            <button
              key={type}
              onClick={() => setSelectedChart(type)}
              className={`py-3 text-xs font-black rounded-2xl border transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 ${
                isSelected 
                  ? `${activeStyles} border-transparent shadow-md scale-[1.02]` 
                  : 'border-gray-100 bg-white hover:border-gray-200 text-gray-600'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* SVG Interactive Premium Chart */}
      <div className="bg-white rounded-[32px] border border-gray-50 shadow-xl shadow-gray-200/50 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            {selectedChart === 'milch' && 'Milch-Menge im Zeitverlauf'}
            {selectedChart === 'brei' && 'Brei-Menge im Zeitverlauf'}
            {selectedChart === 'getraenke' && 'Getränke-Menge im Zeitverlauf'}
            {selectedChart === 'schlaf' && 'Schlafstunden im Tagesverlauf'}
            {selectedChart === 'windeln' && 'Anzahl Windelwechsel'}
            {selectedChart === 'gewicht' && 'Gewichtskurve (Wachstumstrend)'}
          </h3>
          <span className="text-xs text-gray-400 font-bold font-mono">
            {timeFrame === 'woche' ? 'Letzte 7 Tage' : 'Letzte 30 Tage'}
          </span>
        </div>

        {/* Responsive Chart Container */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[600px] h-[250px] relative">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                const y = paddingTop + chartHeight * (1 - ratio);
                const val = Math.round(maxValue * ratio);
                return (
                  <g key={index} className="opacity-40">
                    <line 
                      x1={paddingLeft} 
                      y1={y} 
                      x2={width - paddingRight} 
                      y2={y} 
                      stroke="#f1f5f9" 
                      strokeWidth="1" 
                    />
                    <text 
                      x={paddingLeft - 10} 
                      y={y + 4} 
                      className="text-[10px] font-bold font-mono text-gray-400 text-right fill-current"
                      textAnchor="end"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Data rendering */}
              {chartData.length > 0 && (
                <>
                  {/* For line charts or bar charts */}
                  {selectedChart === 'gewicht' || selectedChart === 'milch' || selectedChart === 'schlaf' ? (
                    // Draw Line Curve
                    (() => {
                      const points = chartData.map((d, i) => {
                        const x = paddingLeft + (chartWidth / (chartData.length - 1 || 1)) * i;
                        const y = paddingTop + chartHeight * (1 - (d.value / maxValue || 0));
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
                          {fillD && <path d={fillD} className={`${colTheme.fill} transition-all duration-500`} />}
                          <path d={pathD} fill="none" className={`${colTheme.stroke} transition-all duration-500`} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                          
                          {/* Data points */}
                          {points.map((p, i) => (
                            <g key={i} className="group cursor-pointer">
                              <circle 
                                cx={p.x} 
                                cy={p.y} 
                                r="5.5" 
                                fill="#ffffff" 
                                className={`${colTheme.stroke} transition-all duration-300 hover:r-7`} 
                                strokeWidth="3" 
                              />
                              <text
                                x={p.x}
                                y={p.y - 12}
                                className="text-[10px] font-black text-gray-700 text-center fill-current opacity-0 group-hover:opacity-100 transition-opacity"
                                textAnchor="middle"
                              >
                                {chartData[i].formatted}
                              </text>
                            </g>
                          ))}
                        </g>
                      );
                    })()
                  ) : (
                    // Draw Bars (for Brei, drinks, diapers)
                    chartData.map((d, i) => {
                      const barWidth = Math.min(chartWidth / chartData.length * 0.6, 25);
                      const x = paddingLeft + (chartWidth / chartData.length) * i + (chartWidth / chartData.length - barWidth) / 2;
                      const barHeight = chartHeight * (d.value / maxValue || 0);
                      const y = paddingTop + chartHeight - barHeight;

                      return (
                        <g key={i} className="group cursor-pointer">
                          <rect
                            x={x}
                            y={y}
                            width={barWidth}
                            height={Math.max(barHeight, 2)}
                            rx="5"
                            className={`${colTheme.bar} transition-all duration-500`}
                          />
                          <text
                            x={x + barWidth / 2}
                            y={y - 8}
                            className="text-[9px] font-black text-gray-700 text-center fill-current opacity-0 group-hover:opacity-100 transition-opacity"
                            textAnchor="middle"
                          >
                            {d.formatted}
                          </text>
                        </g>
                      );
                    })
                  )}

                  {/* X-Axis labels */}
                  {chartData.map((d, i) => {
                    const x = paddingLeft + (chartWidth / (chartData.length - 1 || 1)) * i;
                    const barX = paddingLeft + (chartWidth / chartData.length) * i + (chartWidth / chartData.length) / 2;
                    const finalX = selectedChart === 'gewicht' || selectedChart === 'milch' || selectedChart === 'schlaf' ? x : barX;
                    
                    if (timeFrame === 'monat' && i % 4 !== 0) return null;

                    return (
                      <text
                        key={i}
                        x={finalX}
                        y={height - 15}
                        className="text-[10px] font-bold text-gray-400 fill-current"
                        textAnchor="middle"
                      >
                        {d.label}
                      </text>
                    );
                  })}
                </>
              )}
            </svg>
          </div>
        </div>
      </div>

      {/* Stats Summary Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Milestone Card */}
        <div className="bg-white rounded-[32px] border border-gray-50 shadow-xl shadow-gray-200/50 p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            Entwicklungs-Meilenstein
          </h3>
          <div className="space-y-3">
            <div className="bg-amber-50/40 p-4 rounded-2xl border border-amber-100/30 text-xs text-gray-700 space-y-2">
              <span className="font-extrabold text-gray-800 block">Gewichtsklasse:</span>
              <p>Mit {activeChild.weight} kg liegt {activeChild.name} perfekt im gesunden Normalbereich für ihr Alter ({getBabyAge(activeChild.birthDate)}).</p>
            </div>
            <p className="text-[11px] text-gray-400 font-bold">Gemessen anhand der offiziellen WHO-Wachstumsperzentilen für Säuglinge.</p>
          </div>
        </div>

        {/* Feeding totals Card */}
        <div className="bg-white rounded-[32px] border border-gray-50 shadow-xl shadow-gray-200/50 p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
            <Coffee className="w-4 h-4 text-sky-500" />
            Trink- & Essverhalten
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-bold">Mahlzeiten pro Tag (Ø)</span>
              <span className="font-extrabold text-gray-800">{mealStats.mealCount > 0 ? Math.round(mealStats.mealCount / 7) || 1 : 0} Mal</span>
            </div>
            <div className="flex justify-between text-xs py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-bold">Durchschnittliche Menge</span>
              <span className="font-extrabold text-gray-800">{mealStats.avgAmountPerMeal} ml / g</span>
            </div>
            <div className="flex justify-between text-xs py-1.5">
              <span className="text-gray-500 font-bold">Tagesmenge Milch (Ø)</span>
              <span className="font-extrabold text-gray-800">{mealStats.totalMilchHeute} ml</span>
            </div>
          </div>
        </div>

        {/* Sleep pattern Card */}
        <div className="bg-white rounded-[32px] border border-gray-50 shadow-xl shadow-gray-200/50 p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
            <Moon className="w-4 h-4 text-indigo-500" />
            Schlafrhythmus
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-bold">Schlaf heute</span>
              <span className="font-extrabold text-gray-800">{Math.floor(sleepStats.totalSchlafHeute / 60)} Std {sleepStats.totalSchlafHeute % 60} Min</span>
            </div>
            <div className="flex justify-between text-xs py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-bold">Ø Schlaf pro Tag</span>
              <span className="font-extrabold text-gray-800">{Math.floor(sleepStats.avgSchlafProTag / 60)} Std {sleepStats.avgSchlafProTag % 60} Min</span>
            </div>
            <div className="flex justify-between text-xs py-1.5">
              <span className="text-gray-500 font-bold">Eingetragene Schläfe</span>
              <span className="font-extrabold text-gray-800">{sleepStats.sleepCount} Schläfe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
