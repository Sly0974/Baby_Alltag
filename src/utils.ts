import { MealLog, SleepLog, DiaperLog, GrowthLog } from './types';

// Helper to format Date cleanly in German
export function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return 'Heute';
    } else if (d.toDateString() === yesterday.toDateString()) {
      return 'Gestern';
    } else {
      return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
  } catch {
    return '';
  }
}

export function formatDateTime(isoString: string): string {
  return `${formatDate(isoString)}, ${formatTime(isoString)}`;
}

export function getBabyAge(birthDateStr: string): string {
  if (!birthDateStr) return '';
  const birth = new Date(birthDateStr);
  const now = new Date();
  
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    // get days in previous month
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years > 0) {
    if (months > 0) {
      return `${years} ${years === 1 ? 'Jahr' : 'Jahre'} und ${months} ${months === 1 ? 'Monat' : 'Monate'}`;
    }
    return `${years} ${years === 1 ? 'Jahr' : 'Jahre'}`;
  }

  if (months > 0) {
    if (days > 0) {
      return `${months} ${months === 1 ? 'Monat' : 'Monate'} (${days} ${days === 1 ? 'Tag' : 'Tage'})`;
    }
    return `${months} ${months === 1 ? 'Monat' : 'Monate'}`;
  }

  return `${days} ${days === 1 ? 'Tag' : 'Tage'}`;
}

// Check if a date falls in today, this week, this month
export function isToday(isoString: string): boolean {
  const d = new Date(isoString);
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

export function isThisWeek(isoString: string): boolean {
  const d = new Date(isoString);
  const today = new Date();
  
  // Calculate start of current week (Monday)
  const startOfWeek = new Date(today);
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  return d >= startOfWeek && d < endOfWeek;
}

export function isThisMonth(isoString: string): boolean {
  const d = new Date(isoString);
  const today = new Date();
  return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth();
}

// Calculations for Meals
export interface MealStats {
  totalMilchHeute: number;
  totalMilchWoche: number;
  totalMilchMonat: number;
  
  totalBreiHeute: number;
  totalBreiWoche: number;
  totalBreiMonat: number;
  
  totalGetraenkeHeute: number;
  totalGetraenkeWoche: number;
  totalGetraenkeMonat: number;
  
  avgAmountPerMeal: number; // overall
  avgAmountPerDay: number;
  mealCount: number;
  largestMeal: number;
  smallestMeal: number;
}

export function calculateMealStats(mealLogs: MealLog[], childId: string): MealStats {
  const childMeals = mealLogs.filter(log => log.childId === childId);

  // Totals for Category + Timeframe
  let totalMilchHeute = 0;
  let totalMilchWoche = 0;
  let totalMilchMonat = 0;

  let totalBreiHeute = 0;
  let totalBreiWoche = 0;
  let totalBreiMonat = 0;

  let totalGetraenkeHeute = 0;
  let totalGetraenkeWoche = 0;
  let totalGetraenkeMonat = 0;

  let largestMeal = 0;
  let smallestMeal = Infinity;
  let sumAmounts = 0;
  let countAmounts = 0;

  // Day tracking to calculate average per day
  const dayTotals: { [key: string]: number } = {};

  childMeals.forEach(log => {
    const isT = isToday(log.timestamp);
    const isW = isThisWeek(log.timestamp);
    const isM = isThisMonth(log.timestamp);

    const dateKey = log.timestamp.split('T')[0];
    dayTotals[dateKey] = (dayTotals[dateKey] || 0) + log.amount;

    if (log.amount > 0) {
      sumAmounts += log.amount;
      countAmounts++;
      if (log.amount > largestMeal) largestMeal = log.amount;
      if (log.amount < smallestMeal) smallestMeal = log.amount;
    }

    if (log.category === 'milch') {
      if (isT) totalMilchHeute += log.amount;
      if (isW) totalMilchWoche += log.amount;
      if (isM) totalMilchMonat += log.amount;
    } else if (log.category === 'brei') {
      if (isT) totalBreiHeute += log.amount;
      if (isW) totalBreiWoche += log.amount;
      if (isM) totalBreiMonat += log.amount;
    } else if (log.category === 'getraenke') {
      if (isT) totalGetraenkeHeute += log.amount;
      if (isW) totalGetraenkeWoche += log.amount;
      if (isM) totalGetraenkeMonat += log.amount;
    }
  });

  const dayKeys = Object.keys(dayTotals);
  const avgAmountPerDay = dayKeys.length > 0 
    ? Math.round(dayKeys.reduce((acc, k) => acc + dayTotals[k], 0) / dayKeys.length)
    : 0;

  return {
    totalMilchHeute,
    totalMilchWoche,
    totalMilchMonat,
    totalBreiHeute,
    totalBreiWoche,
    totalBreiMonat,
    totalGetraenkeHeute,
    totalGetraenkeWoche,
    totalGetraenkeMonat,
    avgAmountPerMeal: countAmounts > 0 ? Math.round(sumAmounts / countAmounts) : 0,
    avgAmountPerDay,
    mealCount: childMeals.length,
    largestMeal,
    smallestMeal: smallestMeal === Infinity ? 0 : smallestMeal
  };
}

// Calculations for Sleep
export interface SleepStats {
  totalSchlafHeute: number; // in mins
  totalSchlafWoche: number; // in mins
  totalSchlafMonat: number; // in mins
  avgSchlafProTag: number; // in mins
  sleepCount: number;
}

export function calculateSleepStats(sleepLogs: SleepLog[], childId: string): SleepStats {
  const childSleep = sleepLogs.filter(log => log.childId === childId);

  let totalSchlafHeute = 0;
  let totalSchlafWoche = 0;
  let totalSchlafMonat = 0;

  const dayTotals: { [key: string]: number } = {};

  childSleep.forEach(log => {
    const duration = log.duration || 0;
    const isT = isToday(log.startTime);
    const isW = isThisWeek(log.startTime);
    const isM = isThisMonth(log.startTime);

    const dateKey = log.startTime.split('T')[0];
    dayTotals[dateKey] = (dayTotals[dateKey] || 0) + duration;

    if (isT) totalSchlafHeute += duration;
    if (isW) totalSchlafWoche += duration;
    if (isM) totalSchlafMonat += duration;
  });

  const dayKeys = Object.keys(dayTotals);
  const avgSchlafProTag = dayKeys.length > 0
    ? Math.round(dayKeys.reduce((acc, k) => acc + dayTotals[k], 0) / dayKeys.length)
    : 0;

  return {
    totalSchlafHeute,
    totalSchlafWoche,
    totalSchlafMonat,
    avgSchlafProTag,
    sleepCount: childSleep.length
  };
}

// Calculations for Diapers
export interface DiaperStats {
  pipiCount: number;
  grossCount: number;
  beidesCount: number;
  totalHeute: number;
}

export function calculateDiaperStats(diaperLogs: DiaperLog[], childId: string): DiaperStats {
  const childDiaper = diaperLogs.filter(log => log.childId === childId);
  
  let pipiCount = 0;
  let grossCount = 0;
  let beidesCount = 0;
  let totalHeute = 0;

  childDiaper.forEach(log => {
    if (log.type === 'pipi') pipiCount++;
    else if (log.type === 'gross') grossCount++;
    else if (log.type === 'beides') beidesCount++;

    if (isToday(log.timestamp)) {
      totalHeute++;
    }
  });

  return {
    pipiCount,
    grossCount,
    beidesCount,
    totalHeute
  };
}

// Countdown Calculation to next reminder
export function getCountdownString(nextTriggerTimeStr: string): { text: string; urgent: boolean } {
  if (!nextTriggerTimeStr) return { text: '--:--', urgent: false };
  
  const now = new Date().getTime();
  const target = new Date(nextTriggerTimeStr).getTime();
  const diff = target - now;

  if (diff <= 0) {
    return { text: 'Fällig!', urgent: true };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  const urgent = diff < 30 * 60 * 1000; // less than 30 mins

  if (hours > 0) {
    return { text: `In ${hours} Std ${minutes} Min`, urgent };
  }
  return { text: `In ${minutes} Min`, urgent };
}

// EXPORTS: CSV, Excel, HTML/PDF
export function exportToCSV(
  childName: string,
  mealLogs: MealLog[],
  sleepLogs: SleepLog[],
  diaperLogs: DiaperLog[],
  growthLogs: GrowthLog[]
): string {
  let csv = `BabyCare+ Export für ${childName}\nErstellt am: ${new Date().toLocaleDateString('de-DE')}\n\n`;

  // Meals Section
  csv += `MAHLZEITEN\nDatum;Uhrzeit;Kategorie;Typ;Menge;Einheit;Erstellt von;Notiz\n`;
  mealLogs.forEach(log => {
    const d = new Date(log.timestamp);
    csv += `"${d.toLocaleDateString('de-DE')}";"${d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}";"${log.category}";"${log.subType}";"${log.amount}";"${log.unit}";"${log.loggedBy}";"${log.note.replace(/"/g, '""')}"\n`;
  });

  // Sleep Section
  csv += `\nSCHLAF\nStart;Ende;Dauer (Minuten);Erstellt von;Notiz\n`;
  sleepLogs.forEach(log => {
    const s = new Date(log.startTime);
    const e = new Date(log.endTime);
    csv += `"${s.toLocaleString('de-DE')}";"${e.toLocaleString('de-DE')}";"${log.duration}";"${log.loggedBy}";"${log.note.replace(/"/g, '""')}"\n`;
  });

  // Diapers Section
  csv += `\nWINDELN\nDatum;Uhrzeit;Typ;Erstellt von;Notiz\n`;
  diaperLogs.forEach(log => {
    const d = new Date(log.timestamp);
    csv += `"${d.toLocaleDateString('de-DE')}";"${d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}";"${log.type}";"${log.loggedBy}";"${log.note.replace(/"/g, '""')}"\n`;
  });

  // Growth Section
  csv += `\nWACHSTUM\nDatum;Gewicht (kg);Größe (cm);Kopfumfang (cm);Erstellt von;Notiz\n`;
  growthLogs.forEach(log => {
    const d = new Date(log.timestamp);
    csv += `"${d.toLocaleDateString('de-DE')}";"${log.weight}";"${log.height}";"${log.headCircumference}";"${log.loggedBy}";"${log.note.replace(/"/g, '""')}"\n`;
  });

  return csv;
}

export function downloadFile(content: string, fileName: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
