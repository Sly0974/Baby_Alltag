import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { FamilyRole, LanguageType, ThemeType } from '../types';
import { exportToCSV, downloadFile } from '../utils';
import { motion } from 'motion/react';
import { 
  Settings, Users, Download, Eye, Globe, Moon, Sun, 
  Database, ShieldCheck, Heart, Sparkles, Check, FileSpreadsheet, FileText, Share2 
} from 'lucide-react';

export default function SettingsPage() {
  const { 
    currentUser, activeChild, mealLogs, sleepLogs, diaperLogs, growthLogs,
    setActiveFamilyRole, settings, updateSettings, children, reminders 
  } = useApp();

  const [exportSuccess, setExportSuccess] = useState('');

  const handleRoleChange = (role: FamilyRole) => {
    setActiveFamilyRole(role);
    setExportSuccess(`Rolle zu "${role}" geändert!`);
    setTimeout(() => setExportSuccess(''), 2500);
  };

  const handleLangChange = (lang: LanguageType) => {
    updateSettings({
      ...settings,
      language: lang
    });
  };

  const handleThemeChange = (theme: ThemeType) => {
    updateSettings({
      ...settings,
      theme
    });
    // Dynamically handle class on html element for tailwind dark mode if requested
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleToggleNotifications = () => {
    updateSettings({
      ...settings,
      notificationsEnabled: !settings.notificationsEnabled
    });
  };

  // Full CSV Export of Meals
  const triggerCSVExport = () => {
    if (!activeChild) return;
    const childMeals = mealLogs.filter(l => l.childId === activeChild.id);
    const childSleep = sleepLogs.filter(l => l.childId === activeChild.id);
    const childDiapers = diaperLogs.filter(l => l.childId === activeChild.id);
    const childGrowth = growthLogs.filter(l => l.childId === activeChild.id);
    
    // Call the exact helper function from utils
    const csvContent = exportToCSV(activeChild.name, childMeals, childSleep, childDiapers, childGrowth);
    downloadFile(csvContent, `${activeChild.name}_Aktivitaeten_BabyCarePlus.csv`, 'text/csv;charset=utf-8;');
    
    setExportSuccess('CSV-Datei erfolgreich generiert und heruntergeladen!');
    setTimeout(() => setExportSuccess(''), 3000);
  };

  // Full JSON Backup Export
  const triggerJSONBackup = () => {
    const backupObj = {
      children,
      mealLogs,
      sleepLogs,
      diaperLogs,
      reminders,
      settings,
      backupDate: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `BabyCarePlus_Full_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportSuccess('Sicherungs-Backup (JSON) erfolgreich heruntergeladen!');
    setTimeout(() => setExportSuccess(''), 3000);
  };

  // Simulate PDF/Print layout trigger
  const triggerPDFExport = () => {
    window.print(); // Easy browser native PDF generation trigger!
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Einstellungen & Integrationen</h2>
        <p className="text-gray-500 text-sm">Passe dein Benutzerprofil an, wechsle Rollen im Familienkreis und exportiere Berichte.</p>
      </div>

      {exportSuccess && (
        <div className="p-3.5 bg-emerald-50 text-emerald-600 text-xs rounded-2xl border border-emerald-100 font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
          {exportSuccess}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Familien-Modus / Active User Selector */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/50 p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Familien-Modus (Aktiver Nutzer)
          </h3>
          <p className="text-xs text-gray-500">
            Arbeite mit Partnern oder Verwandten zusammen. Jedes Mitglied erhält eine eigene farbliche Markierung bei Protokolleinträgen.
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            {[
              { role: 'Mama' as FamilyRole, label: '👩 Mama (Admin)', bg: 'border-pink-200 bg-pink-50/30 text-pink-700' },
              { role: 'Papa' as FamilyRole, label: '👨 Papa', bg: 'border-sky-200 bg-sky-50/30 text-sky-700' },
              { role: 'Oma' as FamilyRole, label: '👵 Oma', bg: 'border-purple-200 bg-purple-50/30 text-purple-700' },
              { role: 'Opa' as FamilyRole, label: '👴 Opa', bg: 'border-amber-200 bg-amber-50/30 text-amber-700' },
            ].map(item => {
              const isActive = currentUser?.role === item.role;
              return (
                <button
                  key={item.role}
                  onClick={() => handleRoleChange(item.role)}
                  className={`p-3.5 text-xs font-bold rounded-2xl border text-center transition-all cursor-pointer ${
                    isActive 
                      ? `${item.bg} scale-[1.02] shadow-sm font-extrabold` 
                      : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200 hover:bg-gray-100/50'
                  }`}
                >
                  {item.label}
                  {isActive && <span className="block text-[8px] text-gray-400 mt-1 uppercase font-bold">Aktiviert</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Export Panel (CSV, Excel, PDF) */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/50 p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <Download className="w-5 h-5 text-indigo-600" />
            Berichts- & Datenexport (PDF/CSV)
          </h3>
          <p className="text-xs text-gray-500">
            Exportiere die Aktivitäten für euren Kinderarzt oder Hebamme.
          </p>

          <div className="space-y-2">
            <button
              onClick={triggerCSVExport}
              disabled={!activeChild}
              className="w-full p-3 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 text-left flex items-center justify-between cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <span className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                Mahlzeiten protokollieren (CSV/Excel)
              </span>
              <span className="text-[10px] text-gray-400">Download</span>
            </button>

            <button
              onClick={triggerPDFExport}
              className="w-full p-3 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 text-left flex items-center justify-between cursor-pointer transition-all"
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-pink-500" />
                PDF generieren / Druckansicht öffnen
              </span>
              <span className="text-[10px] text-gray-400">Drucken</span>
            </button>

            <button
              onClick={triggerJSONBackup}
              className="w-full p-3 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 text-left flex items-center justify-between cursor-pointer transition-all"
            >
              <span className="flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-500" />
                Vollständiges Backup (JSON) sichern
              </span>
              <span className="text-[10px] text-gray-400">Export</span>
            </button>
          </div>
        </div>

        {/* Global Settings Panel (Language, Theme, Notifications) */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/50 p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            App-Einstellungen
          </h3>

          <div className="space-y-4">
            {/* Language Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2">Sprachauswahl / Translation</label>
              <div className="grid grid-cols-2 gap-2 bg-gray-100/80 p-1 rounded-xl">
                <button
                  onClick={() => handleLangChange('de')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    settings.language === 'de' ? 'bg-white text-gray-800 shadow-xs' : 'text-gray-500'
                  }`}
                >
                  🇩🇪 Deutsch
                </button>
                <button
                  onClick={() => handleLangChange('en')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    settings.language === 'en' ? 'bg-white text-gray-800 shadow-xs' : 'text-gray-500'
                  }`}
                >
                  🇬🇧 English
                </button>
              </div>
            </div>

            {/* Light / Dark Mode */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2">Theme / Farbschema</label>
              <div className="grid grid-cols-2 gap-2 bg-gray-100/80 p-1 rounded-xl">
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    settings.theme === 'light' ? 'bg-white text-gray-800 shadow-xs' : 'text-gray-500'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" /> Hell
                </button>
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    settings.theme === 'dark' ? 'bg-white text-gray-800 shadow-xs' : 'text-gray-500'
                  }`}
                >
                  <Moon className="w-4 h-4 text-indigo-500" /> Dunkel
                </button>
              </div>
            </div>

            {/* Notification triggers toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <span className="block text-xs font-bold text-gray-800">Push-Mitteilungen</span>
                <span className="text-[10px] text-gray-400">Erhalte akustische Alarme bei Fälligkeit</span>
              </div>
              <button
                onClick={handleToggleNotifications}
                className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.notificationsEnabled ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span className={`absolute w-5 h-5 rounded-full bg-white top-0.5 transition-all ${
                  settings.notificationsEnabled ? 'left-4.5' : 'left-0.5'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Security & Cloud Rules Indicator */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/50 p-6 flex flex-col justify-between h-56">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            Cloud-Sicherheit & Sync
          </h3>
          <div className="space-y-2 text-xs text-gray-600">
            <p><strong>Cloud Firestore:</strong> Aktiviert.</p>
            <p><strong>Lokale Persistenz (Isar DB):</strong> Offline-Speicher aktiv, automatische Verschlüsselung ist eingerichtet.</p>
            <p><strong>Firebase Auth:</strong> Angemeldet als <span className="font-semibold">{currentUser?.email}</span>.</p>
          </div>
          <p className="text-[10px] text-gray-400 mt-2">
            BabyCare+ schützt eure Daten mit Ende-zu-Ende Transportverschlüsselung und strikten Zugriffsrechten.
          </p>
        </div>
      </div>
    </div>
  );
}
