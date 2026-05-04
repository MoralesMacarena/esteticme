import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

// --- 1. FUNCIÓN PARA GENERAR HORARIOS DINÁMICOS ---
const generateDynamicTimeSlots = (startTimeStr, endTimeStr, totalDuration) => {
  const slots = [];

  const startHour = parseInt(startTimeStr.split(":")[0]);
  const startMin = parseInt(startTimeStr.split(":")[1]);
  const endHour = parseInt(endTimeStr.split(":")[0]);
  const endMin = parseInt(endTimeStr.split(":")[1]);

  let current = new Date();
  current.setHours(startHour, startMin, 0, 0);

  let end = new Date();
  end.setHours(endHour, endMin, 0, 0);

  // Restamos la duración total para no dar citas que terminen fuera de hora
  end.setMinutes(end.getMinutes() - (totalDuration || 0));

  while (current <= end) {
    const h = current.getHours().toString().padStart(2, "0");
    const m = current.getMinutes().toString().padStart(2, "0");
    slots.push(`${h}:${m}`);

    current.setMinutes(current.getMinutes() + 30); // Intervalos de 30 min
  }
  return slots;
};

// --- 2. COMPONENTE PRINCIPAL ---
export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  // Recuperamos los datos de la mochila
  const { salon, cart, totalPrice, totalDuration } = location.state || {};

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [backendError, setBackendError] = useState("");

  const [availabilities, setAvailabilities] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  // Fetch de los horarios del salón al cargar la página
  // Fetch de los horarios del salón al cargar la página
  useEffect(() => {
    if (salon) {
      // 1. Cogemos el token por si Django se pone estricto
      const token = localStorage.getItem("access_token");

      fetch(`http://127.0.0.1:8000/api/bookings/horarios/${salon.id}/`, {
        // Le pasamos el token en las cabeceras (si lo tenemos)
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
        .then((res) => {
          if (!res.ok) throw new Error("Error del servidor al pedir horarios");
          return res.json();
        })
        .then((data) => {
          // 2. PROTECCIÓN: Comprobamos si es una lista (Array) de verdad
          if (Array.isArray(data)) {
            setAvailabilities(data);
          } else {
            console.error("Django no devolvió una lista de horarios:", data);
            setAvailabilities([]); // Lo dejamos vacío para que no explote
          }
        })
        .catch((err) => {
          console.error("Error cargando horarios:", err);
          setAvailabilities([]); // En caso de error, lista vacía
        });
    }
  }, [salon]);

  // Si alguien entra sin reserva, lo echamos
  if (!salon || !cart) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          No hay ninguna reserva en curso
        </h2>
        <Link
          to="/"
          className="bg-[#f48c25] text-white px-6 py-2 rounded-lg font-bold"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  const handleConfirmBooking = async () => {
    setBackendError("");
    if (!selectedDate || !selectedTime) {
      setBackendError("Por favor, selecciona fecha y hora para tu cita.");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Tu sesión ha expirado, vuelve a iniciar sesión.");
      navigate("/login");
      return;
    }

    setLoading(true);
    const payload = {
      professional: salon.id,
      booking_date: selectedDate,
      start_time: selectedTime,
      total_price: totalPrice,
      service_ids: cart.map((item) => item.id),
    };

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/bookings/citas/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        alert("Tu sesión ha expirado. Por favor, vuelve a entrar.");
        navigate("/login");
        return;
      }

      if (response.ok) {
        navigate("/success", {
          state: { salon, selectedDate, selectedTime, totalPrice },
        });
      } else {
        console.error("Error del servidor:", data);
        if (data.booking_date) setBackendError(data.booking_date[0]);
        else if (data.start_time) setBackendError(data.start_time[0]);
        else if (data.non_field_errors)
          setBackendError(data.non_field_errors[0]);
        else
          setBackendError(
            "Hubo un problema al crear la reserva. Revisa los datos.",
          );
      }
    } catch (error) {
      setBackendError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setBackendError("");
    setSelectedTime("");

    if (!newDate) {
      setSelectedDate("");
      setAvailableTimeSlots([]);
      return;
    }

    const [year, month, day] = newDate.split("-");
    const dateObj = new Date(year, month - 1, day);
    const jsDay = dateObj.getDay(); // 0 es Domingo en JS
    const pythonDay = jsDay === 0 ? 6 : jsDay - 1; // 6 es Domingo en tu Django

    const schedule = availabilities.find((a) => a.day_of_week === pythonDay);

    if (!schedule) {
      setBackendError("El salón está cerrado en este día de la semana.");
      setSelectedDate("");
      setAvailableTimeSlots([]);
    } else {
      setSelectedDate(newDate);
      const slots = generateDynamicTimeSlots(
        schedule.start_time,
        schedule.end_time,
        totalDuration || 0,
      );

      if (slots.length === 0) {
        setBackendError(
          "No hay hueco suficiente este día para los servicios seleccionados.",
        );
        setAvailableTimeSlots([]);
      } else {
        setAvailableTimeSlots(slots);
      }
    }
  };

  const handleTimeChange = (time) => {
    setSelectedTime(time);
    setBackendError("");
  };

  // --- 3. RENDERIZADO VISUAL ---
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-[#181411]">
              arrow_back
            </span>
          </button>
          <h1 className="text-3xl font-black text-[#181411]">
            Finaliza tu reserva
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* 1. SELECCIONAR FECHA */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-orange-100 text-[#f48c25] p-2 rounded-lg material-symbols-outlined">
                  calendar_today
                </span>
                <h2 className="text-xl font-bold text-[#181411]">
                  Elige el día de tu cita
                </h2>
              </div>

              <input
                type="date"
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#f48c25]/50 focus:border-[#f48c25] outline-none text-lg"
                min={new Date().toISOString().split("T")[0]}
                value={selectedDate}
                onChange={handleDateChange}
              />
            </div>

            {/* 2. SELECCIONAR HORA */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-orange-100 text-[#f48c25] p-2 rounded-lg material-symbols-outlined">
                  schedule
                </span>
                <h2 className="text-xl font-bold text-[#181411]">
                  Horarios disponibles
                </h2>
              </div>

              {availableTimeSlots.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-60 overflow-y-auto p-2">
                  {availableTimeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => handleTimeChange(time)}
                      className={`py-3 rounded-xl font-bold text-sm transition-all border ${
                        selectedTime === time
                          ? "bg-[#181411] text-white border-[#181411] shadow-md"
                          : "bg-white text-gray-600 border-gray-100 hover:border-[#f48c25] hover:text-[#f48c25]"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              ) : (
                selectedDate &&
                !backendError && (
                  <p className="text-gray-500 text-sm">
                    No hay horarios disponibles para este día.
                  </p>
                )
              )}
            </div>
          </div>

          {/* COLUMNA DERECHA: RESUMEN */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
              <h3 className="font-bold text-lg mb-4 border-b border-gray-100 pb-2">
                Resumen de la cita
              </h3>

              <div className="flex items-center gap-3 mb-6">
                <div className="size-12 rounded-lg bg-gray-100 overflow-hidden">
                  <img
                    src={
                      salon.salon_picture ||
                      "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=100"
                    }
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-bold text-[#181411] leading-tight">
                    {salon.business_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {salon.business_address}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.name}</span>
                    <span className="font-bold">
                      {parseFloat(item.price).toFixed(2).replace(".", ",")} €
                    </span>
                  </div>
                ))}
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center font-black text-lg text-[#181411]">
                  <span>Total</span>
                  <span>
                    {(totalPrice || 0).toFixed(2).replace(".", ",")} €
                  </span>
                </div>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">
                    schedule
                  </span>
                  Duración estimada: {totalDuration} min
                </p>
              </div>

              {/* CAJA DE ERROR */}
              {backendError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <span className="material-symbols-outlined text-red-500 text-sm mt-0.5">
                    error
                  </span>
                  <p className="text-sm text-red-600 font-medium leading-tight">
                    {backendError}
                  </p>
                </div>
              )}

              <button
                onClick={handleConfirmBooking}
                disabled={loading}
                className={`w-full h-14 rounded-xl font-bold text-white text-lg shadow-lg transition-all ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#f48c25] hover:bg-orange-600 active:scale-[0.98]"
                }`}
              >
                {loading ? "Confirmando..." : "Confirmar Reserva"}
              </button>

              <p className="text-[10px] text-center text-gray-400 mt-4 px-2">
                Al confirmar, aceptas nuestras condiciones de cancelación. No se
                realizará ningún cargo ahora.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
