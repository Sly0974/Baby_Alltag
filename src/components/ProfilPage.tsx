import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Child, Gender } from '../types';
import { getBabyAge } from '../utils';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserPlus, Edit2, Trash2, Check, X, Camera, Upload,
  Baby, Heart, Sparkles, Scale, LayoutGrid, Star, AlertCircle 
} from 'lucide-react';

export default function ProfilPage() {
  const { 
    children, activeChildId, setActiveChildId, addChild, updateChild, deleteChild 
  } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<Gender>('girl');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1519689680058-324335c77eb2?w=150&h=150&fit=crop');
  const [weight, setWeight] = useState<number>(3.5);
  const [height, setHeight] = useState<number>(50);
  const [headCircumference, setHeadCircumference] = useState<number>(35);

  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [deleteCandidate, setDeleteCandidate] = useState<{ id: string, name: string } | null>(null);

  // Custom photo upload state and handlers
  const [isDragOver, setIsDragOver] = useState(false);

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Bitte lade nur Bilddateien hoch (PNG, JPG, etc.).');
      return;
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };

    img.onload = () => {
      // Create canvas to downscale/crop to square 200x200
      const canvas = document.createElement('canvas');
      const size = 200;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Calculate crop to center-square
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
        setPhotoUrl(compressedBase64);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  // Preselected elegant infant photos for quick avatars
  const avatarPresets = [
    'https://images.unsplash.com/photo-1519689680058-324335c77eb2?w=150&h=150&fit=crop&q=80', // Girl cute
    'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=150&h=150&fit=crop&q=80', // Boy cute
    'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=150&h=150&fit=crop&q=80', // Newborn
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&q=80', // Smiling baby
  ];

  const handleStartAdd = () => {
    setIsAdding(true);
    setEditingChild(null);
    setName('');
    setBirthDate('');
    setGender('girl');
    setPhotoUrl(avatarPresets[0]);
    setWeight(3.5);
    setHeight(50);
    setHeadCircumference(35);
    setErrorMsg('');
  };

  const handleStartEdit = (child: Child) => {
    setEditingChild(child);
    setIsAdding(false);
    setName(child.name);
    setBirthDate(child.birthDate);
    setGender(child.gender);
    setPhotoUrl(child.photoUrl);
    setWeight(child.weight);
    setHeight(child.height);
    setHeadCircumference(child.headCircumference);
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !birthDate) {
      setErrorMsg('Bitte Name und Geburtsdatum eingeben.');
      return;
    }

    if (editingChild) {
      updateChild({
        id: editingChild.id,
        name,
        birthDate,
        gender,
        photoUrl,
        weight: Number(weight),
        height: Number(height),
        headCircumference: Number(headCircumference)
      });
      setEditingChild(null);
    } else {
      addChild({
        name,
        birthDate,
        gender,
        photoUrl,
        weight: Number(weight),
        height: Number(height),
        headCircumference: Number(headCircumference)
      });
      setIsAdding(false);
    }

    setSuccess(true);
    setErrorMsg('');
    setTimeout(() => setSuccess(false), 2000);
  };

  const handleDeleteTrigger = (id: string, name: string) => {
    if (children.length <= 1) {
      setErrorMsg('Es muss mindestens ein Babyprofil vorhanden sein.');
      setTimeout(() => setErrorMsg(''), 4000);
      return;
    }
    setDeleteCandidate({ id, name });
  };

  const confirmDelete = () => {
    if (deleteCandidate) {
      deleteChild(deleteCandidate.id);
      setDeleteCandidate(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Kinderprofile verwalten</h2>
          <p className="text-gray-500 text-sm">Füge neue Babyprofile hinzu oder passe bestehende Daten an.</p>
        </div>

        {!isAdding && !editingChild && (
          <button
            onClick={handleStartAdd}
            className="px-4 py-2.5 bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/10 cursor-pointer flex items-center gap-1.5 self-start active:scale-95 transition-all"
          >
            <UserPlus className="w-4 h-4" /> Profil hinzufügen
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-red-50 text-red-600 text-xs rounded-2xl border border-red-100 font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          {errorMsg}
        </div>
      )}

      {success && (
        <div className="p-3.5 bg-emerald-50 text-emerald-600 text-xs rounded-2xl border border-emerald-100 font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
          Änderungen erfolgreich gespeichert!
        </div>
      )}

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
                Profil löschen?
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Möchtest du das Profil von <strong className="text-gray-700">{deleteCandidate.name}</strong> wirklich löschen? Alle zugehörigen Protokolleinträge werden ausgeblendet.
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

      <AnimatePresence mode="wait">
        {/* Profile editor form */}
        {(isAdding || editingChild) ? (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/50 p-6"
          >
            <div className="flex items-center justify-between border-b border-gray-50 pb-3 mb-5">
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Baby className="w-5 h-5 text-indigo-600" />
                {editingChild ? `Profil von ${editingChild.name} bearbeiten` : 'Neues Babyprofil erstellen'}
              </h3>
              <button 
                onClick={() => { setIsAdding(false); setEditingChild(null); }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Form Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Name des Kindes</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="z.B. Emma, Liam..."
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-800 outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Geburtsdatum</label>
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-800 outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Geschlecht</label>
                  <div className="grid grid-cols-3 gap-2 bg-gray-100/80 p-1 rounded-xl">
                    {(['girl', 'boy', 'other'] as Gender[]).map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          gender === g 
                            ? 'bg-white text-indigo-600 shadow-xs border border-indigo-100/10' 
                            : 'text-gray-500'
                        }`}
                      >
                        {g === 'girl' && '♀ Mädchen'}
                        {g === 'boy' && '♂ Junge'}
                        {g === 'other' && '👶 Andere'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Avatar presets switcher & File Upload */}
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-gray-400 mb-1">Profilbild wählen / hochladen</label>
                  
                  <div className="flex items-center gap-4">
                    {/* Current Photo Preview */}
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-500 shadow-md shadow-indigo-500/10 shrink-0">
                      <img src={photoUrl} alt="Vorschau" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/15 flex items-center justify-center pointer-events-none">
                        <Camera className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    
                    {/* Drag and Drop Zone or Click to Upload */}
                    <div 
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('profile-file-upload')?.click()}
                      className={`flex-1 p-3.5 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                        isDragOver 
                          ? 'border-indigo-500 bg-indigo-50/40 scale-[1.01]' 
                          : 'border-gray-200 hover:border-indigo-400 hover:bg-gray-50/50'
                      }`}
                    >
                      <Upload className="w-5 h-5 text-indigo-500 mb-1" />
                      <span className="text-[10px] font-bold text-gray-700">Eigenes Bild hochladen</span>
                      <span className="text-[8px] text-gray-400">Drag & Drop oder Klicken</span>
                      <input 
                        id="profile-file-upload"
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Presets & Eigene Bilder</span>
                    <div className="flex gap-2.5 items-center flex-wrap">
                      {avatarPresets.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setPhotoUrl(preset)}
                          className={`relative w-10 h-10 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                            photoUrl === preset ? 'border-indigo-500 scale-105 shadow-md shadow-indigo-500/10' : 'border-transparent opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={preset} alt="preset" className="w-full h-full object-cover" />
                        </button>
                      ))}

                      {/* If the current photoUrl is custom (not in presets), show it as a custom option */}
                      {!avatarPresets.includes(photoUrl) && (
                        <button
                          type="button"
                          onClick={() => setPhotoUrl(photoUrl)}
                          className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-500 scale-105 shadow-md shadow-indigo-500/10 cursor-pointer group"
                        >
                          <img src={photoUrl} alt="Eigener Upload" className="w-full h-full object-cover" />
                          <span className="absolute inset-0 bg-black/10 flex items-center justify-center">
                            <span className="bg-indigo-600 text-[7px] text-white font-black px-1 py-0.2 rounded-md">AKTIV</span>
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Form Inputs (Initial Measures) */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Aktuelles Gewicht (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-800 outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Körpergröße (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-800 outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Kopfumfang (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={headCircumference}
                    onChange={(e) => setHeadCircumference(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-800 outline-none focus:bg-white"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md shadow-indigo-500/10 active:scale-95 transition-all"
                  >
                    Speichern
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsAdding(false); setEditingChild(null); }}
                    className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-xl cursor-pointer transition-colors"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        ) : (
          /* Profile Cards List */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {children.map(child => {
              const isActive = child.id === activeChildId;
              const babyAge = getBabyAge(child.birthDate);
              const gradient = child.gender === 'girl' 
                ? 'from-pink-50/50 to-rose-50/50 border-pink-100' 
                : child.gender === 'boy' 
                ? 'from-sky-50/50 to-indigo-50/50 border-sky-100' 
                : 'from-purple-50/50 to-indigo-50/50 border-purple-100';

              const btnColor = child.gender === 'girl' 
                ? 'bg-gradient-to-tr from-pink-500 to-rose-500 text-white shadow-pink-200' 
                : child.gender === 'boy' 
                ? 'bg-gradient-to-tr from-sky-500 to-indigo-500 text-white shadow-sky-200' 
                : 'bg-gradient-to-tr from-purple-500 to-indigo-500 text-white shadow-purple-200';

              return (
                <motion.div
                  key={child.id}
                  whileHover={{ y: -3 }}
                  className={`bg-gradient-to-br ${gradient} border p-5 rounded-[32px] flex flex-col justify-between h-56 relative shadow-xl shadow-gray-200/40`}
                >
                  {isActive && (
                    <span className="absolute top-4 right-4 bg-indigo-600 text-white px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-sm">
                      <Star className="w-2.5 h-2.5 fill-white" />
                      Aktiv
                    </span>
                  )}

                  <div className="flex items-start gap-4">
                    <img 
                      src={child.photoUrl || 'https://images.unsplash.com/photo-1519689680058-324335c77eb2?w=150&h=150&fit=crop'} 
                      alt={child.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                    />
                    
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-gray-800">{child.name}</h3>
                      <p className="text-xs text-gray-500 font-bold">{babyAge}</p>
                      <p className="text-[10px] text-gray-400 font-bold">Geboren am {new Date(child.birthDate).toLocaleDateString('de-DE')}</p>
                    </div>
                  </div>

                  {/* Growth indicators */}
                  <div className="grid grid-cols-3 gap-1 bg-white/60 backdrop-blur-xs rounded-xl p-2 border border-white/60 text-center text-[10px] font-bold text-gray-600 mt-2">
                    <div>
                      <span className="block text-[8px] text-gray-400">Gewicht</span>
                      <strong className="text-gray-800">{child.weight.toFixed(1)} kg</strong>
                    </div>
                    <div className="border-x border-gray-200/50">
                      <span className="block text-[8px] text-gray-400">Größe</span>
                      <strong className="text-gray-800">{child.height} cm</strong>
                    </div>
                    <div>
                      <span className="block text-[8px] text-gray-400">Kopf</span>
                      <strong className="text-gray-800">{child.headCircumference} cm</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-gray-200/40">
                    <button
                      onClick={() => setActiveChildId(child.id)}
                      disabled={isActive}
                      className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${
                        isActive 
                          ? 'bg-gray-200/80 text-gray-500 cursor-default' 
                          : `${btnColor} active:scale-[0.97] cursor-pointer shadow-md`
                      }`}
                    >
                      {isActive ? 'Aktives Profil' : 'Aktivieren'}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEdit(child)}
                        className="p-1.5 bg-white text-gray-400 hover:text-gray-600 rounded-lg border border-gray-100 shadow-2xs transition-all cursor-pointer"
                        title="Profil bearbeiten"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteTrigger(child.id, child.name)}
                        className="p-1.5 bg-white text-gray-400 hover:text-red-500 rounded-lg border border-gray-100 shadow-2xs transition-all cursor-pointer"
                        title="Profil löschen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
