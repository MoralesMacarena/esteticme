import { useState } from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const [showFAQ, setShowFAQ] = useState(false);
  const currentYear = new Date().getFullYear();

  const faqs = [
    {
      q: "¿Cómo funcionan los puntos?",
      a: "Por cada 1€ que gastes ganas 1 punto. Cada 100 puntos acumulados equivalen a 1€ de descuento.",
    },
    {
      q: "¿Tengo que pagar al reservar?",
      a: "No, en EsteticMe solo gestionamos la reserva. Pagas directamente en el salón.",
    },
    {
      q: "¿Puedo cancelar una cita?",
      a: "Sí, puedes cancelar hasta 24h antes desde tu Área de Cliente.",
    },
  ];

  // Estilos base
  const footerTitle = "text-white font-serif text-xl mb-6 tracking-wide";
  const footerLink =
    "text-purple-200/70 hover:text-white transition-colors text-sm font-light mb-3 block text-left";

  return (
    <footer className="w-full bg-aura-plum text-white pt-16 pb-8 mt-auto border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* COLUMNA 1: FAQ DINÁMICA */}
          <div className="flex flex-col">
            <h3 className={footerTitle}>FAQ</h3>
            <button
              onClick={() => setShowFAQ(!showFAQ)}
              className={`${footerLink} flex items-center gap-2 group`}
            >
              Centro de ayuda
              <span
                className={`material-symbols-outlined text-xs transition-transform duration-300 ${showFAQ ? "rotate-180" : ""}`}
              >
                keyboard_arrow_down
              </span>
            </button>

            {/* Contenedor de Preguntas Desplegable */}
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${showFAQ ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0"}`}
            >
              <div className="space-y-4 pr-4 border-l border-white/10 pl-4">
                {faqs.map((faq, index) => (
                  <div key={index}>
                    <p className="text-xs font-bold text-purple-200 mb-1">
                      {faq.q}
                    </p>
                    <p className="text-[11px] text-purple-200/50 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* App Store Buttons (Solo se ven si FAQ está cerrado o en desktop) */}
            <div className="flex flex-col gap-3 mt-8">
              <div className="w-32 h-10 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center opacity-40 cursor-not-allowed">
                <span className="text-[10px] uppercase tracking-widest font-bold">
                  App Store
                </span>
              </div>
              <div className="w-32 h-10 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center opacity-40 cursor-not-allowed">
                <span className="text-[10px] uppercase tracking-widest font-bold">
                  Google Play
                </span>
              </div>
            </div>
          </div>

          {/* COLUMNA 2: DESCUBRE */}
          <div>
            <h3 className={footerTitle}>Descubre</h3>
            <Link to="/salones" className={footerLink}>
              Guía de Tratamientos
            </Link>
            <Link to="/blog" className={footerLink}>
              Magazine EsteticMe
            </Link>
            <button className={footerLink}>Tarjetas Regalo</button>
            <button className={footerLink}>Newsletter</button>
          </div>

          {/* COLUMNA 3: PARTNERS */}
          <div>
            <h3 className={footerTitle}>Partners</h3>
            <Link
              to="/signup-business"
              className={footerLink + " font-bold text-purple-200"}
            >
              Registra tu negocio
            </Link>
            <button className={footerLink}>EsteticMe Connect</button>
            <button className={footerLink}>Ayuda para Profesionales</button>
          </div>

          {/* COLUMNA 4: ESTETICME */}
          <div>
            <h3 className={footerTitle}>EsteticMe</h3>
            <Link to="/blog/bienvenidos-a-esteticme" className={footerLink}>
              Quiénes somos
            </Link>
            <Link to="/blog" className={footerLink}>
              Trabaja con nosotros
            </Link>
            <button className={footerLink}>Aviso Legal</button>
            <button className={footerLink}>Política de Cookies</button>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-80">
            <span className="material-symbols-outlined text-purple-300">
              spa
            </span>
            <span className="font-serif text-xl tracking-tight">EsteticMe</span>
          </div>
          <p className="text-[10px] text-purple-200/30 uppercase tracking-[0.3em]">
            © {currentYear} Macarena Morales Toledo
          </p>
        </div>
      </div>
    </footer>
  );
}
