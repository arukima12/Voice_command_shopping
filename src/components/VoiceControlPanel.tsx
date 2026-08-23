import React, { useState } from 'react';
import { Mic, MicOff, HelpCircle, Globe, X } from 'lucide-react';

interface VoiceControlPanelProps {
  isListening: boolean;
  transcript: string;
  error: string | null;
  activeLanguage: string;
  onLanguageChange: (langCode: string) => void;
  onStartListening: () => void;
  onStopListening: () => void;
  onManualSubmit: (text: string) => void;
}

const LANGUAGES = [
  { code: 'en-US', label: 'English', short: 'EN', placeholder: 'Try "Add 2 bottles of organic milk" or "Find items under $5"' },
  { code: 'es-ES', label: 'Español', short: 'ES', placeholder: 'Prueba con "Agregar 2 botellas de leche orgánica" o "Buscar menos de $5"' },
  { code: 'fr-FR', label: 'Français', short: 'FR', placeholder: 'Essayez "Ajouter 2 bouteilles de lait bio" ou "Trouver sous 5 dollars"' },
  { code: 'de-DE', label: 'Deutsch', short: 'DE', placeholder: 'Probiere "Füge 2 Flaschen Bio-Milch hinzu" oder "Suche unter 5 Dollar"' }
];

const CHEAT_SHEETS: Record<string, { title: string; commands: string[] }> = {
  'en-US': {
    title: 'Voice Command Guide',
    commands: [
      '“Add 2 packages of organic eggs”',
      '“Add 1 loaf of sourdough bread”',
      '“Remove white bread”',
      '“Check eggs”',
      '“Uncheck sourdough bread”',
      '“Find organic items”',
      '“Find items under $5”',
      '“Clear all items”'
    ]
  },
  'es-ES': {
    title: 'Guía de Comandos',
    commands: [
      '“Agregar 2 paquetes de huevos orgánicos”',
      '“Añadir 1 pan de masa madre”',
      '“Quitar pan blanco”',
      '“Marcar huevos”',
      '“Desmarcar pan”',
      '“Buscar orgánico”',
      '“Buscar artículos bajo $5”',
      '“Borrar toda la lista”'
    ]
  },
  'fr-FR': {
    title: 'Guide des Commandes',
    commands: [
      '“Ajouter 2 paquets d\'œufs bio”',
      '“Prendre 1 pain de campagne”',
      '“Supprimer le pain blanc”',
      '“Cocher les œufs”',
      '“Décocher le pain”',
      '“Chercher bio”',
      '“Trouver des articles à moins de 5 dollars”',
      '“Effacer toute la liste”'
    ]
  },
  'de-DE': {
    title: 'Befehlsanleitung',
    commands: [
      '“Füge 2 Packungen Bio-Eier hinzu”',
      '“Brauche 1 Sauerteigbrot”',
      '“Lösche Weißbrot”',
      '“Abhaken Eier”',
      '“Haken weg Brot”',
      '“Suche Bio”',
      '“Finde Artikel unter 5 Dollar”',
      '“Liste leeren”'
    ]
  }
};

export const VoiceControlPanel: React.FC<VoiceControlPanelProps> = ({
  isListening,
  transcript,
  error,
  activeLanguage,
  onLanguageChange,
  onStartListening,
  onStopListening,
  onManualSubmit
}) => {
  const [manualText, setManualText] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  const currentLang = LANGUAGES.find(l => l.code === activeLanguage) || LANGUAGES[0];
  const cheatSheet = CHEAT_SHEETS[activeLanguage] || CHEAT_SHEETS['en-US'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualText.trim()) {
      onManualSubmit(manualText);
      setManualText('');
    }
  };

  return (
    <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 md:p-8 flex flex-col transition-colors">
      {/* Top row: Language Toggle and Help */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
          <div className="flex border border-neutral-200 dark:border-neutral-800 rounded p-0.5 bg-neutral-50 dark:bg-neutral-900">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => onLanguageChange(lang.code)}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded transition-all ${
                  activeLanguage === lang.code
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                    : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                {lang.short}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowHelp(!showHelp)}
          className="flex items-center gap-1.5 text-xs font-mono font-medium tracking-tight text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          <span>{showHelp ? 'HIDE GUIDE' : 'SHOW GUIDE'}</span>
        </button>
      </div>

      {/* Main Microphone Button & Waveform */}
      <div className="flex flex-col items-center justify-center my-6">
        <button
          onClick={isListening ? onStopListening : onStartListening}
          aria-label={isListening ? 'Stop listening' : 'Start listening'}
          className={`relative w-24 h-24 rounded-full flex items-center justify-center border transition-all duration-300 ${
            isListening
              ? 'bg-black border-black text-white dark:bg-white dark:border-white dark:text-black scale-105 shadow-lg shadow-neutral-200/50 dark:shadow-neutral-950/50'
              : 'bg-white border-neutral-200 text-black hover:border-black dark:bg-black dark:border-neutral-800 dark:text-white dark:hover:border-neutral-100'
          }`}
        >
          {isListening ? (
            <MicOff className="w-8 h-8 animate-pulse" />
          ) : (
            <Mic className="w-8 h-8" />
          )}

          {/* Pulsing ring indicator around mic when listening */}
          {isListening && (
            <span className="absolute inset-0 rounded-full border border-black dark:border-white animate-ping opacity-25"></span>
          )}
        </button>

        {/* Visual Waveform Bouncing Bars */}
        <div className="h-10 flex items-center justify-center gap-1 mt-6 w-full">
          {isListening ? (
            Array.from({ length: 9 }).map((_, i) => (
              <span
                key={i}
                className="w-1 bg-black dark:bg-white rounded-full transition-all duration-200"
                style={{
                  height: `${15 + Math.random() * 25}px`,
                  animation: `bounceWave 0.6s ease-in-out infinite alternate`,
                  animationDelay: `${i * 0.08}s`
                }}
              />
            ))
          ) : (
            <div className="text-xs font-mono tracking-tight text-neutral-400 dark:text-neutral-500 uppercase">
              Click Mic to Speak Command
            </div>
          )}
        </div>
      </div>

      {/* Transcript / Result display */}
      <div className="min-h-[70px] border border-neutral-100 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-950/20 p-4 rounded text-center mb-6 transition-all">
        {transcript ? (
          <p className="text-sm font-medium tracking-tight text-neutral-900 dark:text-neutral-100 italic leading-relaxed">
            "{transcript}"
          </p>
        ) : (
          <p className="text-xs font-mono text-neutral-400 dark:text-neutral-500">
            {currentLang.placeholder}
          </p>
        )}
        {error && (
          <div className="mt-3 text-xs font-mono text-neutral-500 dark:text-neutral-400 flex items-center justify-center gap-1.5 border-t border-neutral-200/50 dark:border-neutral-800/50 pt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-600 animate-pulse"></span>
            {error}
          </div>
        )}
      </div>

      {/* Manual Input Fallback */}
      <form onSubmit={handleSubmit} className="flex gap-2 w-full mt-auto">
        <input
          type="text"
          value={manualText}
          onChange={(e) => setManualText(e.target.value)}
          placeholder={currentLang.placeholder}
          className="flex-1 px-4 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded font-sans focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 focus:border-transparent text-neutral-800 dark:text-neutral-200 transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
        />
        <button
          type="submit"
          className="px-5 py-2.5 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-mono font-semibold tracking-wider rounded transition-colors"
        >
          SUBMIT
        </button>
      </form>

      {/* Guide/Cheat Sheet Overlay Panel */}
      {showHelp && (
        <div className="mt-8 border-t border-neutral-200 dark:border-neutral-800 pt-6 animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-mono font-bold tracking-widest text-neutral-900 dark:text-neutral-100 uppercase">
              {cheatSheet.title}
            </h3>
            <button
              onClick={() => setShowHelp(false)}
              className="text-neutral-400 dark:text-neutral-600 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <ul className="space-y-2 text-xs font-mono text-neutral-500 dark:text-neutral-400">
            {cheatSheet.commands.map((cmd, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-neutral-300 dark:text-neutral-700">•</span>
                <button
                  type="button"
                  onClick={() => onManualSubmit(cmd.replace(/[“”]/g, ''))}
                  className="text-left hover:underline hover:text-black dark:hover:text-white transition-colors"
                >
                  {cmd}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Simple global CSS injected for the waveform bouncing */}
      <style>{`
        @keyframes bounceWave {
          0% {
            transform: scaleY(0.3);
          }
          100% {
            transform: scaleY(1);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
