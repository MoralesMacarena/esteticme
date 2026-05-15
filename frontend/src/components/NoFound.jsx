import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-aura-lavender flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Decoración de fondo coherente con el resto de la app */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

      <div className="relative z-10 text-center max-w-lg">
        {/* Un número 404 con estilo serif elegante */}
        <h1 className="text-[12rem] font-serif text-aura-plum/10 leading-none select-none">
          404
        </h1>

        <div className="mt-[-4rem]">
          <h2 className="text-4xl font-serif text-aura-plum mb-4">
            Página fuera de cobertura
          </h2>
          <p className="text-gray-500 font-light italic text-lg mb-10 leading-relaxed">
            Parece que este tratamiento no existe en nuestro catálogo.
            Permítenos guiarte de vuelta a tu zona de bienestar.
          </p>

          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 via-white to-fuchsia-100 border border-white/60 shadow-pearl text-aura-plum px-10 py-4 rounded-2xl font-bold hover:scale-[1.05] active:scale-95 transition-all uppercase tracking-[0.2em] text-xs"
          >
            <span className="material-symbols-outlined text-sm">
              arrow_back
            </span>
            Volver al inicio
          </Link>
        </div>
      </div>

      <div className="mt-20 opacity-20">
        <span className="material-symbols-outlined text-6xl text-aura-plum animate-pulse">
          spa
        </span>
      </div>
    </div>
  );
}
