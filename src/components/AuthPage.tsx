import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { FamilyRole } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Mail, Lock, Sparkles, Heart, CheckCircle2, UserCheck } from 'lucide-react';

export default function AuthPage() {
  const { setCurrentUser } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('bestofsly@gmail.com');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<FamilyRole>('Mama');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
      setTimeout(() => {
        setCurrentUser({ email, role });
      }, 1000);
    }, 1200);
  };

  const handleProviderLogin = (provider: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
      setTimeout(() => {
        setCurrentUser({ email: `${provider.toLowerCase()}@babycare.de`, role: 'Mama' });
      }, 1000);
    }, 1200);
  };

  const roles: { value: FamilyRole; label: string; desc: string; emoji: string }[] = [
    { value: 'Mama', label: 'Mama', desc: 'Haupt-Account', emoji: '👩‍🍼' },
    { value: 'Papa', label: 'Papa', desc: 'Mitbesitzer', emoji: '👨‍🍼' },
    { value: 'Oma', label: 'Oma', desc: 'Gast-Zugang', emoji: '👵' },
    { value: 'Opa', label: 'Opa', desc: 'Gast-Zugang', emoji: '👴' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-indigo-200">
      <div className="absolute inset-0 bg-[radial-gradient(#e0e7ff_1px,transparent_1px)] [background-size:16px_16px] opacity-70 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md bg-white rounded-[32px] shadow-2xl shadow-indigo-100/50 p-8 border border-gray-100 relative overflow-hidden z-10"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div 
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10 text-indigo-600 animate-bounce" />
              </div>
              <h2 className="text-2xl font-black text-gray-800">Erfolgreich angemeldet</h2>
              <p className="text-gray-500 mt-2 text-sm font-semibold">Willkommen bei BabyCare+ – Deine Daten werden geladen...</p>
            </motion.div>
          ) : (
            <div key="auth-form">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold mb-3 border border-indigo-100/50">
                  <Heart className="w-3.5 h-3.5 fill-indigo-500 text-indigo-500" />
                  PREMIUM BABY TRACKER
                </div>
                <h1 className="text-3xl font-black tracking-tight text-gray-800 flex items-center justify-center gap-1">
                  BabyCare<span className="text-indigo-600">+</span>
                </h1>
                <p className="text-gray-500 mt-1 text-sm font-semibold">
                  {isLogin ? 'Melde dich an, um eure Familiendaten zu synchronisieren.' : 'Erstelle einen Familien-Account für euer Baby.'}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2">Deine Rolle in der Familie</label>
                  <div className="grid grid-cols-4 gap-2">
                    {roles.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRole(r.value)}
                        className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          role === r.value 
                            ? 'border-indigo-400 bg-indigo-50/50 shadow-sm shadow-indigo-100' 
                            : 'border-gray-100 hover:border-gray-200 bg-white'
                        }`}
                      >
                        <span className="text-xl mb-1">{r.emoji}</span>
                        <span className="text-[11px] font-bold text-gray-700">{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="E-Mail-Adresse"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-gray-800 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-gray-400 font-bold"
                    />
                  </div>

                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Passwort"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-gray-800 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-gray-400 font-bold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      {isLogin ? 'Anmelden' : 'Registrieren'}
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100" />
                </div>
                <span className="relative bg-white px-3 text-xs text-gray-400">Oder über</span>
              </div>

              {/* Third-Party Logins */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleProviderLogin('Google')}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl border border-gray-100 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.64l3.15-3.15C17.45 1.74 14.89 1 12 1 7.35 1 3.4 3.65 1.45 7.5l3.85 3c.9-2.7 3.4-4.46 6.7-4.46z" />
                    <path fill="#4285F4" d="M23.45 12.3c0-.82-.07-1.6-.2-2.3H12v4.4h6.43c-.28 1.44-1.1 2.66-2.33 3.48l3.6 2.8c2.1-1.94 3.32-4.8 3.32-8.38z" />
                    <path fill="#FBBC05" d="M5.3 14.5c-.23-.7-.35-1.44-.35-2.2s.12-1.5.35-2.2L1.45 7.1C.53 8.94 0 11.02 0 13.2s.53 4.26 1.45 6.1l3.85-3z" />
                    <path fill="#34A853" d="M12 23c3.24 0 5.97-1.08 7.96-2.9l-3.6-2.8c-1.1.74-2.5 1.2-4.36 1.2-3.3 0-5.8-1.76-6.7-4.46l-3.85 3C3.4 20.35 7.35 23 12 23z" />
                  </svg>
                  Google Login
                </button>
                <button
                  type="button"
                  onClick={() => handleProviderLogin('Apple')}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl border border-gray-100 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-gray-800" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.62.71-1.16 1.85-1.01 2.96 1.12.09 2.27-.58 2.94-1.39" />
                  </svg>
                  Apple Login
                </button>
              </div>

              {/* Toggle Login/Signup */}
              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-bold cursor-pointer"
                >
                  {isLogin ? 'Noch keinen Account? Registrieren' : 'Bereits registriert? Jetzt anmelden'}
                </button>
              </div>

              {/* Demo Mode / Offline-First Disclaimer */}
              <div className="mt-6 flex items-start gap-2 bg-slate-50 p-3 rounded-2xl text-[11px] text-gray-500 border border-gray-100">
                <Shield className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Offline-Modus aktiv:</strong> Alle Daten werden primär sicher lokal in deinem Browser verschlüsselt gespeichert und synchronisieren sich automatisch mit der Cloud (Firebase), sobald du online bist.
                </span>
              </div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
