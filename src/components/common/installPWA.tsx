import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Check if user has already dismissed it recently
      const lastDismissed = localStorage.getItem('pwa_prompt_dismissed');
      const now = new Date().getTime();
      
      // Show if not dismissed or dismissed more than 7 days ago
      if (!lastDismissed || (now - parseInt(lastDismissed)) > 7 * 24 * 60 * 60 * 1000) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // We used the prompt, and can't use it again
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', new Date().getTime().toString());
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-4 right-4 z-[100] md:left-auto md:right-8 md:w-80"
        >
          <div className="bg-bg-side border border-brand-500/30 p-5 shadow-2xl relative overflow-hidden group">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-brand-500/10 transition-colors" />
            
            <button 
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 text-text-muted hover:text-text-stark transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#1A1A1A] border border-border-dim rounded-xl flex items-center justify-center text-brand-500 shrink-0">
                <Download className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[11px] font-bold text-text-stark uppercase tracking-wider mb-1">Install App</h3>
                <p className="text-[9px] text-text-dim uppercase leading-relaxed tracking-tight mb-4">
                  Akses ProMan HPP lebih cepat & stabil dengan menginstall aplikasi di layar utama.
                </p>
                
                <button
                  onClick={handleInstall}
                  className="w-full py-2 bg-brand-500 text-bg-deep text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-brand-400 transition-colors cursor-pointer"
                >
                  Install Sekarang
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
