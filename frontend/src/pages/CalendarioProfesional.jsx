import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function CalendarioProfesional() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [clientsList, setClientsList] = useState([]);
  const [profesionalId, setProfesionalId] = useState(null);

  // ESTADOS PARA MODALES
  const [showNewModal, setShowNewModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // ESTADO DEL BUSCADOR DE CLIENTES (NUEVO)
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // ESTADO DEL FORMULARIO DE NUEVA CITA
  const [formData, setFormData] = useState({
    booking_date: "",
    start_time: "",
    service_id: "",
    client_id: "",
  });

  // --- LÓGICA DE FECHAS ---
  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const startOfWeek = getStartOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return d;
  });

  const nextWeek = () =>
    setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)));
  const prevWeek = () =>
    setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)));
  const goToday = () => setCurrentDate(new Date());

  const formatDateForDjango = (date) => date.toISOString().split("T")[0];

  // --- OBTENER DATOS (Citas, Servicios, Clientes y Perfil) ---
  const fetchData = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const resBookings = await fetch(
        "http://127.0.0.1:8000/api/bookings/citas/",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (resBookings.ok) {
        const data = await resBookings.json();
        setBookings(Array.isArray(data) ? data : data.results || []);
      }

      const resServices = await fetch(
        "http://127.0.0.1:8000/api/bookings/servicios/",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (resServices.ok) {
        const data = await resServices.json();
        setServices(Array.isArray(data) ? data : data.results || []);
      }

      const resClients = await fetch(
        "http://127.0.0.1:8000/api/bookings/citas/mis_clientes/",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (resClients.ok) {
        setClientsList(await resClients.json());
      }

      const resProfile = await fetch(
        "http://127.0.0.1:8000/api/users/profiles/me/",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (resProfile.ok) {
        const data = await resProfile.json();
        setProfesionalId(data.id);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  // --- FILTRAR CLIENTES EN TIEMPO REAL ---
  const filteredClients = clientsList.filter(
    (c) =>
      c.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // --- CREAR NUEVA CITA ---
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem("access_token");

    const payload = {
      professional: profesionalId,
      booking_date: formData.booking_date,
      start_time: formData.start_time,
      service_ids: [parseInt(formData.service_id)],
      status: "confirmed",
    };

    // MAGIA DEL BUSCADOR: Si seleccionó de la lista, manda ID. Si no, manda el texto como nombre manual
    if (formData.client_id) {
      payload.client = parseInt(formData.client_id);
    } else {
      payload.guest_name = searchQuery;
    }

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

      if (response.ok) {
        setShowNewModal(false);
        setShowSuccessModal(true);
        // Limpiamos todo al terminar
        setFormData({
          booking_date: "",
          start_time: "",
          service_id: "",
          client_id: "",
        });
        setSearchQuery("");
        fetchData();
      } else {
        const err = await response.json();
        console.error("Error del servidor:", err);
        const errorMessage = Object.entries(err)
          .map(([campo, errores]) => `Falla el campo [${campo}]: ${errores}`)
          .join("\n");
        alert(`No se pudo crear la cita:\n\n${errorMessage}`);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setSaving(false);
    }
  };

  // --- MATEMÁTICAS DEL GRID ---
  const calculateTopPosition = (timeString) => {
    if (!timeString) return 0;
    const [hours, minutes] = timeString.split(":").map(Number);
    return (hours - 9) * 80 + minutes * (80 / 60);
  };

  const DEFAULT_HEIGHT = 80;

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 border-green-500 text-green-800";
      case "pending":
        return "bg-orange-100 border-orange-500 text-orange-800";
      case "cancelled":
        return "bg-red-50 border-red-300 text-red-500 opacity-60";
      default:
        return "bg-blue-100 border-blue-500 text-blue-800";
    }
  };

  const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  return (
    <div className="bg-white font-display flex flex-col h-screen overflow-hidden relative">
      {/* CABECERA */}
      <div className="w-full bg-white border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            to="/panel"
            className="p-2 mr-2 rounded-full hover:bg-gray-100 border border-gray-300 text-gray-500 hover:text-[#f48c25] transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined">home</span>
          </Link>
          <button
            onClick={prevWeek}
            className="p-2 rounded-full hover:bg-gray-100 border border-gray-300 transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-gray-600">
              chevron_left
            </span>
          </button>
          <h2 className="text-xl font-bold text-[#181411] min-w-[150px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={nextWeek}
            className="p-2 rounded-full hover:bg-gray-100 border border-gray-300 transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-gray-600">
              chevron_right
            </span>
          </button>
          <button
            onClick={goToday}
            className="ml-2 px-4 py-1.5 text-sm font-bold border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
          >
            Hoy
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 bg-[#f48c25] hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>Nueva Cita</span>
          </button>
        </div>
      </div>

      {/* ÁREA PRINCIPAL DEL CALENDARIO */}
      <main className="flex-grow flex overflow-hidden">
        {/* COLUMNA DE HORAS */}
        <div className="w-16 flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto pt-12 no-scrollbar z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-20 border-b border-gray-50 pr-2 text-xs text-gray-400 text-right relative"
            >
              <span className="-top-3 relative bg-white px-1 font-medium">
                {9 + i}:00
              </span>
            </div>
          ))}
        </div>

        {/* ZONA DE DÍAS Y CITAS */}
        <div className="flex-grow flex flex-col overflow-auto bg-gray-50 relative no-scrollbar">
          {/* CABECERA DE LOS DÍAS */}
          <div className="flex border-b border-gray-200 bg-white sticky top-0 z-20 shadow-sm">
            {weekDays.map((date, index) => {
              const isToday =
                formatDateForDjango(date) === formatDateForDjango(new Date());
              return (
                <div
                  key={index}
                  className={`flex-1 py-3 text-center border-r border-gray-100 ${isToday ? "bg-orange-50/50" : ""}`}
                >
                  <span
                    className={`text-xs uppercase block ${isToday ? "text-[#f48c25] font-bold" : "text-gray-500 font-medium"}`}
                  >
                    {dayNames[index]}
                  </span>
                  <span
                    className={`text-xl ${isToday ? "font-black text-[#f48c25]" : "font-bold text-[#181411]"}`}
                  >
                    {date.getDate()}
                  </span>
                </div>
              );
            })}
          </div>

          {/* GRID DE CITAS */}
          <div className="flex relative h-[960px]">
            <div className="absolute inset-0 flex flex-col w-full pointer-events-none">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 border-b border-gray-200/50 w-full"
                ></div>
              ))}
            </div>

            {weekDays.map((date, index) => {
              const dateStr = formatDateForDjango(date);
              const dayBookings = bookings.filter(
                (b) => b.booking_date === dateStr,
              );

              if (index === 6) {
                return (
                  <div
                    key={index}
                    className="flex-1 bg-gray-100/50 relative flex items-center justify-center border-r border-gray-200/50"
                  >
                    <span className="transform -rotate-90 text-gray-300 font-black tracking-widest text-2xl">
                      CERRADO
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={index}
                  className="flex-1 border-r border-gray-200/50 relative group hover:bg-gray-100/50 transition-colors"
                >
                  {dayBookings.map((booking) => {
                    const topPos = calculateTopPosition(booking.start_time);
                    const colorClasses = getStatusColor(booking.status);

                    return (
                      <div
                        key={booking.id}
                        className={`absolute left-1 right-1 border-l-4 rounded-lg p-2 cursor-pointer hover:shadow-md transition-all z-10 hover:scale-[1.02] ${colorClasses}`}
                        style={{
                          top: `${topPos}px`,
                          height: `${DEFAULT_HEIGHT}px`,
                        }}
                      >
                        <p className="text-xs font-bold truncate">
                          {booking.status === "cancelled"
                            ? "Cancelada"
                            : "Confirmada"}
                        </p>
                        <p className="text-[10px] opacity-80 font-medium">
                          {booking.start_time?.substring(0, 5)}
                        </p>
                        <p className="text-[11px] mt-1 font-bold truncate">
                          {booking.guest_name ||
                            booking.client_name ||
                            "Cliente Presencial"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* --- MODAL 1: NUEVA CITA --- */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-[#181411]">Nueva Cita</h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-4">
              {/* ZONA DE SELECCIÓN DE CLIENTE (BUSCADOR INTELIGENTE) */}
              <div className="flex flex-col gap-2 relative">
                <label className="text-sm font-bold text-gray-600">
                  ¿Para quién es la cita?
                </label>

                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-400 material-symbols-outlined">
                    search
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Busca o escribe un nombre nuevo..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setFormData({ ...formData, client_id: "" }); // Si escribe, reseteamos el ID del cliente
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)} // Retraso para que dé tiempo a hacer click en la lista
                    className="w-full pl-10 border border-gray-200 p-3 rounded-xl focus:border-[#f48c25] outline-none transition-colors"
                  />
                </div>

                {/* Desplegable Flotante de Resultados */}
                {showDropdown && searchQuery && filteredClients.length > 0 && (
                  <div className="absolute top-[76px] left-0 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto z-50">
                    {filteredClients.map((c) => (
                      <div
                        key={c.id}
                        onMouseDown={() => {
                          setSearchQuery(c.nombre);
                          setFormData({ ...formData, client_id: c.id });
                          setShowDropdown(false);
                        }}
                        className="p-3 hover:bg-orange-50 cursor-pointer border-b border-gray-50 last:border-0 flex items-center justify-between"
                      >
                        <span className="font-bold text-[#181411]">
                          {c.nombre}
                        </span>
                        <span className="text-xs text-gray-500">{c.email}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-600">
                  Servicio
                </label>
                <select
                  required
                  value={formData.service_id}
                  onChange={(e) =>
                    setFormData({ ...formData, service_id: e.target.value })
                  }
                  className="border border-gray-200 p-3 rounded-xl focus:border-[#f48c25] outline-none bg-white"
                >
                  <option value="">Selecciona un servicio...</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.duration_minutes} min)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-600">
                    Fecha
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.booking_date}
                    onChange={(e) =>
                      setFormData({ ...formData, booking_date: e.target.value })
                    }
                    className="border border-gray-200 p-3 rounded-xl focus:border-[#f48c25] outline-none"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-600">
                    Hora
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.start_time}
                    onChange={(e) =>
                      setFormData({ ...formData, start_time: e.target.value })
                    }
                    className="border border-gray-200 p-3 rounded-xl focus:border-[#f48c25] outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#f48c25] text-white py-4 rounded-xl font-bold hover:bg-orange-600 transition-colors mt-4 disabled:bg-gray-400"
              >
                {saving ? "Creando..." : "Crear Cita"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: ÉXITO --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-5xl">
                check_circle
              </span>
            </div>
            <h3 className="text-2xl font-black text-[#181411] mb-2">
              ¡Cita Creada!
            </h3>
            <p className="text-gray-500 mb-8">
              La cita se ha añadido correctamente a tu calendario.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-[#181411] text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition-colors"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
