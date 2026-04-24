import { useLocation, Link, Navigate } from "react-router-dom";

export default function Success() {
  const location = useLocation();

  // RECUPERACIÓN SEGURA: Asignamos valores por defecto (ej. totalPrice = 0)
  // Así evitamos que la app "pete" si falta algún dato inesperadamente
  const {
    salon,
    selectedDate = "",
    selectedTime = "",
    totalPrice = 0,
  } = location.state || {};

  // 1. FILTRO DE SEGURIDAD: Si no hay salón, redirigimos silenciosamente
  if (!salon) {
    return <Navigate to="/" replace />;
  }

  // 2. FORMATEO SEGURO DE FECHA
  // Evitamos el error "Invalid Date" si el formato de selectedDate viene raro
  let formattedDate = selectedDate;
  if (selectedDate) {
    const dateObj = new Date(selectedDate);
    // Comprobamos que la fecha sea matemáticamente válida antes de convertirla
    if (!isNaN(dateObj.getTime())) {
      formattedDate = dateObj.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  }

  // 3. FORMATEO SEGURO DEL PRECIO
  // Nos aseguramos de que siempre sea un número antes de hacer toFixed()
  const safePrice = Number(totalPrice) || 0;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-xl overflow-hidden text-center">
        {/* Cabecera Verde de Éxito */}
        <div className="bg-green-500 py-8 px-6 flex flex-col items-center">
          <span className="material-symbols-outlined text-white text-6xl mb-4">
            check_circle
          </span>
          <h1 className="text-2xl font-black text-white">
            ¡Reserva Confirmada!
          </h1>
          <p className="text-green-100 mt-2">
            Ya puedes ver todos los detalles en tu área personal.
          </p>
        </div>

        {/* Ticket de Resumen */}
        <div className="p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#181411]">
              {salon.business_name}
            </h2>
            <p className="text-gray-500 text-sm">{salon.business_address}</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-5 mb-8 space-y-4 text-left border border-gray-100">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <span className="text-gray-500 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">
                  calendar_today
                </span>
                Fecha
              </span>
              <span className="font-bold text-[#181411] capitalize">
                {formattedDate}
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <span className="text-gray-500 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">
                  schedule
                </span>
                Hora
              </span>
              <span className="font-bold text-[#181411]">{selectedTime}</span>
            </div>

            <div className="flex justify-between items-center pt-1">
              <span className="text-gray-500 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">
                  payments
                </span>
                A pagar en el local
              </span>
              <span className="font-black text-lg text-[#f48c25]">
                {safePrice.toFixed(2).replace(".", ",")} €
              </span>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="space-y-3">
            <Link
              to="/perfil"
              className="flex items-center justify-center w-full h-12 bg-[#181411] text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
            >
              Ver mis citas
            </Link>
            <Link
              to="/"
              className="flex items-center justify-center w-full h-12 bg-white text-[#181411] font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
