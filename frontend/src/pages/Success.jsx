import { useLocation, Link, Navigate } from "react-router-dom";

export default function Success() {
  const location = useLocation();

  // RECUPERACIÓN SEGURA: Asignamos valores por defecto (Lógica Intacta)
  const {
    salon,
    selectedDate = "",
    selectedTime = "",
    totalPrice = 0,
  } = location.state || {};

  // 1. FILTRO DE SEGURIDAD (Lógica Intacta)
  if (!salon) {
    return <Navigate to="/" replace />;
  }

  // 2. FORMATEO SEGURO DE FECHA (Lógica Intacta)
  let formattedDate = selectedDate;
  if (selectedDate) {
    const dateObj = new Date(selectedDate);
    if (!isNaN(dateObj.getTime())) {
      formattedDate = dateObj.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  }

  // 3. FORMATEO SEGURO DEL PRECIO (Lógica Intacta)
  const safePrice = Number(totalPrice) || 0;

  // --- VARIABLES DE ESTILO AURA ---
  const pearlBtn =
    "flex items-center justify-center w-full h-14 bg-gradient-to-r from-purple-100 via-white to-fuchsia-100 border border-white/60 shadow-pearl text-aura-plum font-bold rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]";
  const ghostBtn =
    "flex items-center justify-center w-full h-14 bg-white/60 text-aura-plum font-bold rounded-2xl border border-white hover:bg-white transition-colors shadow-sm";

  return (
    <div className="min-h-screen bg-aura-lavender flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decoración de fondo */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-white/40 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/4"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-200/30 rounded-full blur-3xl translate-y-1/3 translate-x-1/4"></div>

      <div className="bg-white/60 backdrop-blur-xl max-w-md w-full rounded-[3.5rem] shadow-pearl overflow-hidden text-center relative z-10 border border-white">
        {/* Cabecera Aura de Éxito */}
        <div className="bg-gradient-to-b from-purple-50/80 to-white/10 pt-12 pb-8 px-6 flex flex-col items-center border-b border-white">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-green-200 blur-xl opacity-50 rounded-full"></div>
            <span className="material-symbols-outlined text-green-400 text-7xl relative z-10 drop-shadow-md">
              check_circle
            </span>
          </div>
          <h1 className="text-3xl font-serif text-aura-plum tracking-tight">
            ¡Reserva Confirmada!
          </h1>
          <p className="text-gray-500 font-light italic mt-3 max-w-xs">
            Ya puedes ver todos los detalles en tu área personal. Te esperamos.
          </p>
        </div>

        {/* Ticket de Resumen */}
        <div className="p-10">
          <div className="mb-8">
            <h2 className="text-2xl font-serif text-aura-plum leading-none mb-2">
              {salon.business_name}
            </h2>
            <p className="text-purple-300 text-[10px] font-black uppercase tracking-widest">
              {salon.business_address}
            </p>
          </div>

          <div className="bg-white/80 rounded-[2rem] p-6 mb-10 space-y-5 text-left shadow-sm border border-purple-50">
            <div className="flex justify-between items-center border-b border-purple-50 pb-4">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">
                  calendar_today
                </span>
                Fecha
              </span>
              <span className="font-bold text-aura-plum capitalize text-right">
                {formattedDate}
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-purple-50 pb-4">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">
                  schedule
                </span>
                Hora
              </span>
              <span className="font-serif text-lg text-aura-plum">
                {selectedTime}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">
                  payments
                </span>
                A pagar allí
              </span>
              <span className="font-serif text-2xl text-aura-plum">
                {safePrice.toFixed(2).replace(".", ",")}€
              </span>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="space-y-4">
            <Link to="/perfil" className={pearlBtn}>
              Ver mis citas
            </Link>
            <Link to="/" className={ghostBtn}>
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
