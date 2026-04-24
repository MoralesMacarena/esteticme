import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  // Recuperamos los datos que enviamos desde SalonDetail
  // Si alguien entra aquí directamente sin pasar por el salón, le mandamos de vuelta
  const { salon, cart, totalPrice, totalDuration } = location.state || {};

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [loading, setLoading] = useState(false);

  // Lista de horas ficticia (esto en el futuro vendrá de Django según disponibilidad real)
  const timeSlots = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
  ];

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
    if (!selectedDate || !selectedTime) {
      alert("Por favor, selecciona fecha y hora para tu cita.");
      return;
    }

    // Comprobamos por seguridad que tenemos la llave del usuario
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Tu sesión ha expirado, vuelve a iniciar sesión.");
      navigate("/login");
      return;
    }

    setLoading(true);

    // Empaquetamos los datos exactamente como Django nos los ha pedido
    const payload = {
      professional: salon.id,
      booking_date: selectedDate,
      start_time: selectedTime,
      total_price: totalPrice,
      service_ids: cart.map((item) => item.id), // Extraemos solo los IDs de los servicios
    };

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/bookings/citas/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Enseñamos nuestra "llave" a Django
          },
          body: JSON.stringify(payload),
        },
      );

      if (response.ok) {
        // En lugar del alert, navegamos a /success y le pasamos los datos en el "state"
        navigate("/success", {
          state: {
            salon: salon,
            selectedDate: selectedDate,
            selectedTime: selectedTime,
            totalPrice: totalPrice,
          },
        });
      } else {
        const errorData = await response.json();
        console.error("Error del servidor:", errorData);
        alert("Hubo un problema al crear la reserva. Revisa la consola.");
      }
    } catch (error) {
      console.error("Error de red:", error);
      alert("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título y botón de volver */}
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
          {/* COLUMNA IZQUIERDA: CALENDARIO Y HORA */}
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
                min={new Date().toISOString().split("T")[0]} // No permite fechas pasadas
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
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

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
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
            </div>
          </div>

          {/* COLUMNA DERECHA: RESUMEN FIJO */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
              <h3 className="font-bold text-lg mb-4 border-b border-gray-100 pb-2">
                Resumen de la cita
              </h3>

              {/* Info del Salón */}
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

              {/* Servicios Elegidos */}
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
                  <span>{totalPrice.toFixed(2).replace(".", ",")} €</span>
                </div>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">
                    schedule
                  </span>
                  Duración estimada: {totalDuration} min
                </p>
              </div>

              {/* BOTÓN FINAL */}
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
