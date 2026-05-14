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

  // ESTADOS PARA MODAL DE EDICIÓN
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    booking_date: "",
    start_time: "",
    status: "",
  });

  // ESTADO DEL BUSCADOR DE CLIENTES
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // ESTADO DEL FORMULARIO DE NUEVA CITA
  const [formData, setFormData] = useState({
    booking_date: "",
    start_time: "",
    service_id: "",
    client_id: "",
    guest_phone: "",
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

  const formatDateForDjango = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // --- OBTENER DATOS ---
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
      if (resClients.ok) setClientsList(await resClients.json());

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

  const filteredClients = clientsList.filter(
    (c) =>
      c.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
      guest_phone: formData.guest_phone,
    };

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
        setFormData({
          booking_date: "",
          start_time: "",
          service_id: "",
          client_id: "",
          guest_phone: "",
        });
        setSearchQuery("");
        fetchData();
      } else {
        const err = await response.json();
        alert(`No se pudo crear la cita. Revisa los datos.`);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateBooking = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/bookings/citas/${selectedBooking.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editFormData),
        },
      );

      if (response.ok) {
        setBookings(
          bookings.map((b) =>
            b.id === selectedBooking.id ? { ...b, ...editFormData } : b,
          ),
        );
        setShowEditModal(false);
      } else {
        alert("No se pudo actualizar la cita.");
      }
    } catch (error) {
      console.error("Error al actualizar:", error);
    }
  };

  const calculateTopPosition = (timeString) => {
    if (!timeString) return 0;
    const [hours, minutes] = timeString.split(":").map(Number);
    return (hours - 9) * 80 + minutes * (80 / 60);
  };

  const getServicesText = (booking) => {
    if (!booking.services || booking.services.length === 0)
      return "Servicio no especificado";
    return booking.services.map((s) => s.name || s).join(", ");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-purple-100 border-aura-plum text-aura-plum";
      case "confirmed":
        return "bg-green-100 border-green-500 text-green-800";
      case "pending":
        return "bg-fuchsia-50 border-fuchsia-300 text-fuchsia-800";
      case "cancelled":
        return "bg-red-50 border-red-200 text-red-400 opacity-60";
      default:
        return "bg-gray-100 border-gray-300 text-gray-800";
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

  const pearlBtn =
    "flex items-center gap-2 bg-gradient-to-r from-purple-100 via-white to-fuchsia-100 border border-white/60 shadow-pearl text-aura-plum px-6 py-3 rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-sm";
  const inputStyles =
    "w-full bg-white/80 border border-purple-100 rounded-2xl px-6 py-4 text-aura-plum font-medium focus:ring-4 focus:ring-purple-100 outline-none transition-all placeholder:text-purple-200";
  const labelStyles =
    "block text-[11px] font-black text-aura-plum/60 mb-2 uppercase tracking-[0.2em] ml-2";

  return (
    <div className="bg-aura-lavender font-sans flex flex-col h-screen overflow-hidden relative">
      {/* CABECERA GENERAL */}
      <div className="w-full bg-white/40 backdrop-blur-md border-b border-purple-100 px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4 z-40">
        <div className="flex items-center gap-4">
          <Link
            to="/panel"
            className="p-3 rounded-full hover:bg-white/60 border border-purple-100 text-aura-plum transition-all flex items-center justify-center shadow-sm"
          >
            <span className="material-symbols-outlined">home</span>
          </Link>
          <div className="flex items-center bg-white/60 rounded-2xl border border-purple-100 p-1 shadow-sm">
            <button
              onClick={prevWeek}
              className="p-2 rounded-xl hover:bg-white transition-colors flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-aura-plum">
                chevron_left
              </span>
            </button>
            <h2 className="text-lg font-serif text-aura-plum px-6 min-w-[180px] text-center uppercase tracking-tight">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={nextWeek}
              className="p-2 rounded-xl hover:bg-white transition-colors flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-aura-plum">
                chevron_right
              </span>
            </button>
          </div>
          <button
            onClick={goToday}
            className="px-5 py-2 text-xs font-black uppercase tracking-widest bg-white border border-purple-100 rounded-xl hover:bg-purple-50 text-aura-plum transition-all shadow-sm"
          >
            Hoy
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowNewModal(true)} className={pearlBtn}>
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>Nueva Cita</span>
          </button>
        </div>
      </div>

      {/* ÁREA PRINCIPAL CON MÁRGENES */}
      <main className="flex-grow p-4 md:p-8 overflow-hidden flex justify-center bg-aura-lavender relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

        <div className="w-full max-w-[1400px] h-full bg-white/40 backdrop-blur-xl rounded-[3rem] shadow-pearl border border-white flex flex-col overflow-hidden relative z-10">
          {/* CABECERA DÍAS */}
          <div className="flex border-b border-purple-50 bg-white/40 z-30 pl-20">
            {weekDays.map((date, index) => {
              const isToday =
                formatDateForDjango(date) === formatDateForDjango(new Date());
              return (
                <div
                  key={index}
                  className={`flex-1 py-5 text-center border-r border-purple-50 ${isToday ? "bg-purple-100/30" : ""}`}
                >
                  <span
                    className={`text-[10px] uppercase block tracking-[0.2em] mb-1 ${isToday ? "text-aura-plum font-black" : "text-purple-300 font-bold"}`}
                  >
                    {dayNames[index]}
                  </span>
                  <span
                    className={`text-2xl font-serif ${isToday ? "text-aura-plum" : "text-gray-400"}`}
                  >
                    {date.getDate()}
                  </span>
                </div>
              );
            })}
          </div>

          {/* GRID SCROLLABLE */}
          <div className="flex-grow overflow-y-auto flex relative no-scrollbar bg-white/10">
            {/* HORAS LATERALES */}
            <div className="w-20 flex-shrink-0 border-r border-purple-100/50 relative z-30 pt-4 pb-8 bg-white/20">
              <div className="h-[960px] relative w-full">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-full right-4 text-right -translate-y-1/2"
                    style={{ top: `${i * 80}px` }}
                  >
                    <span className="text-[11px] text-aura-plum/40 font-black relative -top-3">
                      {9 + i}:00
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CUERPO GRID (CON CEBRA) */}
            <div className="flex-grow relative z-10 pt-4 pb-8 flex">
              <div className="h-[960px] w-full relative flex">
                {/* FONDO CEBRA DINÁMICO */}
                <div className="absolute inset-0 pointer-events-none z-0">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className={`absolute w-full border-t border-purple-100/30 ${i % 2 === 0 ? "bg-purple-50/40" : "bg-transparent"}`}
                      style={{ top: `${i * 80}px`, height: "80px" }}
                    ></div>
                  ))}
                </div>

                {weekDays.map((date, index) => {
                  const dateStr = formatDateForDjango(date);
                  const dayBookings = bookings.filter(
                    (b) => b.booking_date === dateStr,
                  );

                  // SOLUCIÓN: Volvemos a la lógica de bloquear SOLO el Domingo (índice 6) por defecto.
                  if (index === 6) {
                    return (
                      <div
                        key={index}
                        className="flex-1 bg-aura-plum/[0.03] relative flex items-center justify-center border-r border-purple-50/50 backdrop-grayscale-[0.2]"
                      >
                        <span className="transform -rotate-90 text-aura-plum/10 font-black tracking-[0.5em] text-3xl uppercase pointer-events-none">
                          CERRADO
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={index}
                      className="flex-1 border-r border-purple-100/20 relative group hover:bg-white/10 transition-colors z-10"
                    >
                      {dayBookings.map((booking) => {
                        const topPos = calculateTopPosition(booking.start_time);
                        const colorClasses = getStatusColor(booking.status);
                        return (
                          <div
                            key={booking.id}
                            onClick={() => {
                              setSelectedBooking(booking);
                              setEditFormData({
                                booking_date: booking.booking_date,
                                start_time: booking.start_time?.substring(0, 5),
                                status: booking.status,
                              });
                              setShowEditModal(true);
                            }}
                            className={`absolute left-1 right-1 border-l-4 rounded-2xl p-3 cursor-pointer shadow-sm hover:shadow-xl transition-all z-20 hover:scale-[1.02] flex flex-col justify-start overflow-hidden ${colorClasses}`}
                            style={{
                              top: `${topPos}px`,
                              height: `76px`,
                            }}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <p className="text-[9px] font-black uppercase opacity-70 tracking-tighter">
                                {booking.start_time?.substring(0, 5)}
                              </p>
                              <span className="text-[12px] opacity-40">
                                {booking.status === "cancelled"
                                  ? "✕"
                                  : booking.status === "completed"
                                    ? "✅"
                                    : "✦"}
                              </span>
                            </div>
                            <p className="text-[11px] font-bold truncate leading-tight mb-0.5">
                              {booking.guest_name ||
                                booking.client_name ||
                                "Cliente Presencial"}
                            </p>
                            <p className="text-[9px] truncate opacity-60 italic font-medium">
                              {getServicesText(booking)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- MODAL 1: NUEVA CITA --- */}
      {showNewModal && (
        <div className="fixed inset-0 bg-aura-plum/20 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl p-10 w-full max-w-md animate-in zoom-in-95 duration-300 border border-white">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-serif text-aura-plum">Nueva Cita</h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-purple-300 hover:text-red-400 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-6">
              <div className="flex flex-col relative">
                <label className={labelStyles}>¿Para quién es la cita?</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-200 material-symbols-outlined">
                    search
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Busca cliente o nombre..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setFormData({
                        ...formData,
                        client_id: "",
                        guest_phone: "",
                      });
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    className={`${inputStyles} pl-12`}
                  />
                </div>

                {showDropdown && searchQuery && filteredClients.length > 0 && (
                  <div className="absolute top-[85px] left-0 w-full bg-white border border-purple-50 rounded-2xl shadow-2xl max-h-48 overflow-y-auto z-50 p-2">
                    {filteredClients.map((c) => (
                      <div
                        key={c.id}
                        onMouseDown={() => {
                          setSearchQuery(c.nombre);
                          setFormData({
                            ...formData,
                            client_id: c.id,
                            guest_phone: c.phone || "",
                          });
                          setShowDropdown(false);
                        }}
                        className="p-3 hover:bg-purple-50 rounded-xl cursor-pointer flex items-center justify-between"
                      >
                        <span className="font-bold text-aura-plum">
                          {c.nombre}
                        </span>
                        <span className="text-[9px] bg-purple-100 px-2 py-1 rounded text-aura-plum uppercase font-black tracking-widest">
                          Ficha
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className={labelStyles}>Teléfono de contacto</label>
                {formData.client_id ? (
                  <div className="flex items-center gap-3 bg-purple-50/50 p-4 rounded-2xl border border-purple-50 text-aura-plum/70">
                    <span className="material-symbols-outlined text-[20px]">
                      call
                    </span>
                    <span className="font-bold">
                      {formData.guest_phone || "Sin teléfono en ficha"}
                    </span>
                  </div>
                ) : (
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-200 material-symbols-outlined">
                      call
                    </span>
                    <input
                      type="tel"
                      placeholder="Número para el cliente..."
                      value={formData.guest_phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          guest_phone: e.target.value,
                        })
                      }
                      className={`${inputStyles} pl-12`}
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className={labelStyles}>Servicio</label>
                <select
                  required
                  value={formData.service_id}
                  onChange={(e) =>
                    setFormData({ ...formData, service_id: e.target.value })
                  }
                  className={inputStyles}
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
                  <label className={labelStyles}>Fecha</label>
                  <input
                    type="date"
                    required
                    value={formData.booking_date}
                    onChange={(e) =>
                      setFormData({ ...formData, booking_date: e.target.value })
                    }
                    className={inputStyles}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className={labelStyles}>Hora</label>
                  <input
                    type="time"
                    required
                    value={formData.start_time}
                    onChange={(e) =>
                      setFormData({ ...formData, start_time: e.target.value })
                    }
                    className={inputStyles}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-aura-plum text-white py-5 rounded-[2rem] font-bold shadow-lg hover:scale-[1.02] transition-all disabled:opacity-30 mt-4 uppercase tracking-widest text-sm"
              >
                {saving ? "CREANDO..." : "AGENDAR CITA"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: ÉXITO --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-aura-plum/20 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-sm flex flex-col items-center text-center shadow-2xl border border-white animate-in zoom-in-95 duration-300">
            <span className="material-symbols-outlined text-green-400 text-7xl mb-6">
              check_circle
            </span>
            <h3 className="text-2xl font-serif text-aura-plum mb-8">
              ¡Cita Agendada!
            </h3>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-aura-plum text-white py-4 rounded-2xl font-bold shadow-md hover:scale-[1.02] transition-all"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL 3: GESTIONAR --- */}
      {showEditModal && selectedBooking && (
        <div className="fixed inset-0 bg-aura-plum/20 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl p-10 w-full max-w-md border border-white animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-serif text-aura-plum">Gestionar</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-purple-300 hover:text-red-400 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleUpdateBooking} className="space-y-8">
              <div className="bg-purple-50/50 rounded-[2rem] p-6 border border-purple-100 shadow-inner">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-[10px] text-purple-300 font-black uppercase tracking-widest mb-1">
                      Cliente
                    </p>
                    <p className="text-xl font-bold text-aura-plum leading-none mb-2">
                      {selectedBooking.guest_name ||
                        selectedBooking.client_name ||
                        "Presencial"}
                    </p>
                    {selectedBooking.display_phone &&
                      selectedBooking.display_phone !== "Sin teléfono" && (
                        <p className="text-sm font-bold text-aura-plum/60 flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px]">
                            call
                          </span>
                          {selectedBooking.display_phone}
                        </p>
                      )}
                  </div>
                  <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-purple-50 text-center">
                    <p className="text-[9px] font-black text-purple-300 uppercase tracking-widest mb-0.5">
                      Precio
                    </p>
                    <p className="text-lg font-serif text-aura-plum">
                      {selectedBooking.total_price
                        ? `${parseFloat(selectedBooking.total_price).toFixed(2)}€`
                        : "--"}
                    </p>
                  </div>
                </div>

                <div className="mb-6 pb-6 border-b border-purple-100/50">
                  <p className="text-[10px] text-purple-300 font-black uppercase tracking-widest mb-2">
                    Tratamiento
                  </p>
                  <p className="text-sm font-bold text-aura-plum bg-white p-3 rounded-xl border border-purple-50">
                    {getServicesText(selectedBooking)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-purple-300 font-black uppercase tracking-widest mb-1">
                      Fecha
                    </p>
                    <input
                      type="date"
                      required
                      value={editFormData.booking_date}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          booking_date: e.target.value,
                        })
                      }
                      className={`${inputStyles} py-3 text-sm`}
                    />
                  </div>
                  <div>
                    <p className="text-[10px] text-purple-300 font-black uppercase tracking-widest mb-1">
                      Hora
                    </p>
                    <input
                      type="time"
                      required
                      value={editFormData.start_time}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          start_time: e.target.value,
                        })
                      }
                      className={`${inputStyles} py-3 text-sm`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className={labelStyles}>Actualizar Estado</label>
                <select
                  value={editFormData.status}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, status: e.target.value })
                  }
                  className={inputStyles}
                >
                  <option value="pending">⏳ Pendiente</option>
                  <option value="confirmed">👍 Confirmada</option>
                  <option value="completed">✅ Terminada</option>
                  <option value="cancelled">❌ Cancelada</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-aura-plum text-white py-5 rounded-[2rem] font-bold shadow-lg hover:scale-[1.02] transition-all uppercase tracking-widest text-sm"
              >
                Actualizar Cita
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
