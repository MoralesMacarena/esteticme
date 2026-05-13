import { useState, useEffect } from "react";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Comprobamos si ya aceptó las cookies antes
    const consent = localStorage.getItem("esteticme_cookies_consent");
    if (!consent) {
      // Pequeño delay para que no aparezca de golpe al cargar
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("esteticme_cookies_consent", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full z-[200] p-4 md:p-6 animate-in fade-in slide-in-from-bottom-10 duration-700">
      <div className="mx-auto max-w-5xl bg-white/90 backdrop-blur-xl border border-purple-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* TEXTO INFORMATIVO */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2 text-aura-plum">
            <span className="material-symbols-outlined text-xl">cookie</span>
            <h4 className="font-serif text-lg font-bold">
              Ajustes de privacidad
            </h4>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">
            En **EsteticMe** utilizamos cookies propias y de terceros para
            mejorar tu experiencia, analizar el tráfico y mostrarte salones
            cerca de ti en Fuengirola. Si sigues navegando, consideramos que
            aceptas su uso.
          </p>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsVisible(false)}
            className="px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-aura-plum transition-colors"
          >
            Configurar
          </button>
          <button
            onClick={handleAccept}
            className="px-10 py-3 bg-aura-plum text-white rounded-full font-bold text-sm shadow-lg hover:bg-purple-900 hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
          >
            Aceptar todo
          </button>
        </div>
      </div>
    </div>
  );
}
