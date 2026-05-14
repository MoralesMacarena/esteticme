import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

// --- 1. FUNCIÓN PARA GENERAR HORARIOS DINÁMICOS ---
const generateDynamicTimeSlots = (
  startTimeStr,
  endTimeStr,
  totalDuration,
  occupiedBookings = [],
) => {
  const slots = [];
  const startHour = parseInt(startTimeStr.split(":")[0]);
  const startMin = parseInt(startTimeStr.split(":")[1]);
  const endHour = parseInt(endTimeStr.split(":")[0]);
  const endMin = parseInt(endTimeStr.split(":")[1]);

  let current = new Date();
  current.setHours(startHour, startMin, 0, 0);

  let end = new Date();
  end.setHours(endHour, endMin, 0, 0);
  end.setMinutes(end.getMinutes() - (totalDuration || 0));

  const toMins = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  while (current <= end) {
    const h = current.getHours().toString().padStart(2, "0");
    const m = current.getMinutes().toString().padStart(2, "0");
    const slotTimeStr = `${h}:${m}`;

    const slotStartMins = toMins(slotTimeStr);
    const slotEndMins = slotStartMins + (totalDuration || 30);

    const isOccupied = occupiedBookings.some((booking) => {
      const bStartMins = toMins(booking.start_time);
      const bEndMins = bStartMins + (booking.total_duration || 30);
      return slotStartMins < bEndMins && slotEndMins > bStartMins;
    });

    if (!isOccupied) {
      slots.push(slotTimeStr);
    }

    current.setMinutes(current.getMinutes() + 30);
  }
  return slots;
};

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { salon, cart, totalPrice, totalDuration } = location.state || {};

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [backendError, setBackendError] = useState("");
  const [availabilities, setAvailabilities] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  // ESTADOS PARA FIDELIZACIÓN
  const [userPoints, setUserPoints] = useState(0);
  const [usePoints, setUsePoints] = useState(false);

  const BACKEND_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    //Cargar los horarios del salón
    if (salon) {
      fetch(`${BACKEND_URL}/api/bookings/profesionales/${salon.id}/horarios/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setAvailabilities(data);
          else setAvailabilities([]);
        })
        .catch(() => setAvailabilities([]));
    }

    //Cargar los puntos VIP del usuario actual
    if (token) {
      fetch(`${BACKEND_URL}/api/users/profiles/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.points) setUserPoints(data.points);
        });
    }
  }, [salon]);

  // --- LÓGICA DE DESCUENTO ---
  // Tasa de conversión: 100 puntos = 1€
  const CONVERSION_RATE = 100;
  const maxPossibleDiscount = Math.floor(userPoints / CONVERSION_RATE);
  // Nos aseguramos de no descontar más dinero de lo que cuesta el servicio
  const actualDiscount = usePoints
    ? Math.min(maxPossibleDiscount, totalPrice)
    : 0;
  const pointsUsed = actualDiscount * CONVERSION_RATE;
  const finalPrice = Math.max(0, totalPrice - actualDiscount);

  if (!salon || !cart) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-aura-lavender p-4">
        <div className="bg-white/60 backdrop-blur-xl p-12 rounded-[3rem] border border-white text-center shadow-pearl">
          <h2 className="text-2xl font-serif text-aura-plum mb-6">
            No hay reserva activa
          </h2>
          <Link
            to="/"
            className="inline-block bg-aura-plum text-white px-10 py-4 rounded-2xl font-bold"
          >
            Volver
          </Link>
        </div>
      </div>
    );
  }

  // --- 2. CAMBIO DE FECHA ---
  const handleDateChange = async (e) => {
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
    const pythonDay = dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1;

    const schedule = availabilities.find((a) => a.day_of_week === pythonDay);

    if (!schedule) {
      setBackendError("El salón está cerrado este día.");
      setSelectedDate("");
      setAvailableTimeSlots([]);
    } else {
      setSelectedDate(newDate);
      setLoading(true);

      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(
          `${BACKEND_URL}/api/bookings/citas/?professional=${salon.id}&booking_date=${newDate}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        );
        const data = await res.json();
        const bookingsList = Array.isArray(data) ? data : data.results || [];

        const actualOccupied = bookingsList.filter((b) => {
          const status = b.status ? b.status.toLowerCase() : "";
          return status !== "cancelled" && status !== "cancelada";
        });

        const slots = generateDynamicTimeSlots(
          schedule.start_time,
          schedule.end_time,
          totalDuration || 0,
          actualOccupied,
        );

        if (slots.length === 0) {
          setBackendError("No hay huecos disponibles.");
          setAvailableTimeSlots([]);
        } else {
          setAvailableTimeSlots(slots);
        }
      } catch (err) {
        setBackendError("Error al comprobar disponibilidad.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTime)
      return setBackendError("Selecciona fecha y hora.");
    const token = localStorage.getItem("access_token");
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/bookings/citas/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          professional: salon.id,
          booking_date: selectedDate,
          start_time: selectedTime,
          discount_amount: actualDiscount,
          points_used: pointsUsed,
          service_ids: cart.map((item) => item.id),
        }),
      });
      if (response.ok)
        navigate("/success", {
          state: { salon, selectedDate, selectedTime, totalPrice: finalPrice },
        });
      else setBackendError("Error al reservar.");
    } catch (error) {
      setBackendError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  const pearlBtn =
    "w-full bg-gradient-to-r from-purple-100 via-white to-fuchsia-100 border border-white/60 shadow-pearl text-aura-plum py-5 rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center shadow-lg";
  const sectionCard =
    "bg-white/60 backdrop-blur-md p-8 rounded-[3rem] border border-white shadow-sm";

  return (
    <main className="min-h-screen bg-aura-lavender py-16 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-white/40 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/4"></div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="mb-12 flex items-center gap-6">
          <button
            onClick={() => navigate(-1)}
            className="size-12 bg-white/80 rounded-full flex items-center justify-center border border-purple-50 shadow-sm"
          >
            <span className="material-symbols-outlined text-aura-plum">
              arrow_back
            </span>
          </button>
          <h1 className="text-5xl font-serif text-aura-plum tracking-tight">
            Finaliza tu reserva
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-8">
            <section className={sectionCard}>
              <div className="flex items-center gap-4 mb-8">
                <span className="bg-purple-100 text-aura-plum p-3 rounded-2xl material-symbols-outlined">
                  calendar_month
                </span>
                <h2 className="text-2xl font-serif text-aura-plum">
                  ¿Qué día prefieres?
                </h2>
              </div>
              <input
                type="date"
                className="w-full bg-white/80 border border-purple-100 rounded-2xl px-6 py-5 text-aura-plum font-medium outline-none transition-all text-lg"
                min={new Date().toISOString().split("T")[0]}
                value={selectedDate}
                onChange={handleDateChange}
              />
            </section>

            <section className={sectionCard}>
              <div className="flex items-center gap-4 mb-8">
                <span className="bg-purple-100 text-aura-plum p-3 rounded-2xl material-symbols-outlined">
                  schedule
                </span>
                <h2 className="text-2xl font-serif text-aura-plum">
                  Horas disponibles
                </h2>
              </div>
              {loading ? (
                <p className="text-center italic text-aura-plum animate-pulse">
                  Comprobando disponibilidad...
                </p>
              ) : availableTimeSlots.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                  {availableTimeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => {
                        setSelectedTime(time);
                        setBackendError("");
                      }}
                      className={`py-4 rounded-2xl font-bold text-sm transition-all border ${selectedTime === time ? "bg-aura-plum text-white shadow-xl scale-105" : "bg-white/80 text-aura-plum border-purple-50 hover:border-aura-plum hover:bg-white"}`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center bg-purple-50/50 rounded-[2rem] border border-dashed border-purple-200">
                  <p className="text-aura-plum/60 italic">
                    {selectedDate
                      ? backendError || "No hay huecos disponibles."
                      : "Elige una fecha para ver las horas."}
                  </p>
                </div>
              )}
            </section>
          </div>

          <aside className="lg:col-span-4">
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[3.5rem] shadow-pearl border border-white sticky top-24">
              <h3 className="font-serif text-2xl text-aura-plum mb-8 border-b border-purple-50 pb-4">
                Resumen
              </h3>

              <div className="flex items-center gap-4 mb-8">
                <img
                  src={
                    salon.salon_picture ||
                    "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=200"
                  }
                  className="size-16 rounded-[1.5rem] object-cover border border-purple-100"
                  alt=""
                />
                <div className="flex-1">
                  <p className="font-bold text-aura-plum text-lg">
                    {salon.business_name}
                  </p>
                  <p className="text-[10px] text-purple-300 font-black uppercase tracking-widest">
                    {salon.business_address}
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.name}</span>
                    <span className="font-serif text-aura-plum">
                      {parseFloat(item.price).toFixed(2)}€
                    </span>
                  </div>
                ))}
              </div>

              {/* 🔥 BLOQUE DE FIDELIZACIÓN (Solo si el usuario tiene mínimo 100 puntos) 🔥 */}
              {userPoints >= CONVERSION_RATE && (
                <div className="bg-gradient-to-r from-purple-50 to-fuchsia-50 p-5 rounded-3xl mb-8 border border-purple-100 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-aura-plum font-bold text-sm flex items-center gap-1.5 mb-0.5">
                        <span className="material-symbols-outlined text-yellow-500 text-lg">
                          stars
                        </span>
                        Club VIP
                      </p>
                      <p className="text-[11px] text-gray-500 font-medium">
                        Tienes {userPoints} puntos disponibles
                      </p>
                    </div>
                    {/* Botón Switch */}
                    <button
                      onClick={() => setUsePoints(!usePoints)}
                      className={`w-12 h-6 rounded-full transition-all duration-300 flex items-center px-1 shadow-inner ${usePoints ? "bg-aura-plum justify-end" : "bg-purple-200 justify-start"}`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform"></div>
                    </button>
                  </div>
                  {usePoints && (
                    <p className="text-xs text-green-600 font-bold bg-white/60 p-2 rounded-xl text-center">
                      ¡Se aplicará un descuento de {actualDiscount.toFixed(2)}€!
                    </p>
                  )}
                </div>
              )}

              {/* TOTALES */}
              <div className="pt-6 border-t border-purple-50 mb-10 space-y-3">
                {usePoints && actualDiscount > 0 && (
                  <div className="flex justify-between text-sm font-bold text-green-500">
                    <span>Descuento VIP ({pointsUsed} pts)</span>
                    <span>-{actualDiscount.toFixed(2)}€</span>
                  </div>
                )}
                <div className="flex justify-between text-2xl font-serif text-aura-plum">
                  <span>Total</span>
                  <span>{finalPrice.toFixed(2)}€</span>
                </div>
              </div>

              {backendError && (
                <p className="mb-6 p-4 bg-red-50 text-red-500 rounded-2xl text-xs font-bold">
                  {backendError}
                </p>
              )}

              <button
                onClick={handleConfirmBooking}
                disabled={loading || !selectedTime}
                className={pearlBtn}
              >
                {loading ? "Procesando..." : "Confirmar Reserva"}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
