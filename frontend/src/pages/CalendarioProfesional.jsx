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

  // ESTADO DEL FORMULARIO DE NUEVA CITA (Actualizado con guest_phone)
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

  const formatDateForDjango = (date) => date.toISOString().split("T")[0];

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

  // --- FILTRAR CLIENTES ---
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
      guest_phone: formData.guest_phone, // <-- Enviamos el teléfono (sea nuevo o recuperado)
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

  // --- ACTUALIZAR CITA EXISTENTE ---
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

  // --- MATEMÁTICAS DEL GRID ---
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

  const DEFAULT_HEIGHT = 80;

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-blue-100 border-blue-500 text-blue-800";
      case "confirmed":
        return "bg-green-100 border-green-500 text-green-800";
      case "pending":
        return "bg-orange-100 border-orange-500 text-orange-800";
      case "cancelled":
        return "bg-red-50 border-red-300 text-red-500 opacity-60";
      default:
        return "bg-gray-100 border-gray-500 text-gray-800";
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
    <div className="bg-gray-100 font-display flex flex-col h-screen overflow-hidden relative">
      {/* CABECERA GENERAL */}
      <div className="w-full bg-white border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 z-40 shadow-sm">
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

      {/* ÁREA PRINCIPAL CON MÁRGENES (NUEVO) */}
      <main className="flex-grow p-4 md:p-8 overflow-hidden flex justify-center bg-gray-50">
        <div className="w-full max-w-[1400px] h-full bg-white rounded-3xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          {/* CABECERA DÍAS */}
          <div className="flex border-b border-gray-200 bg-white z-30 pl-16">
            {weekDays.map((date, index) => {
              const isToday =
                formatDateForDjango(date) === formatDateForDjango(new Date());
              return (
                <div
                  key={index}
                  className={`flex-1 py-4 text-center border-r border-gray-100 ${isToday ? "bg-orange-50/30" : ""}`}
                >
                  <span
                    className={`text-[10px] uppercase block tracking-widest ${isToday ? "text-[#f48c25] font-black" : "text-gray-400 font-bold"}`}
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

          {/* GRID SCROLLABLE */}
          <div className="flex-grow overflow-y-auto flex relative no-scrollbar bg-white">
            {/* HORAS */}
            <div className="w-16 flex-shrink-0 border-r border-gray-100 relative z-20 pt-8 pb-8">
              <div className="h-[960px] relative w-full">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-full right-2 text-right"
                    style={{ top: `${i * 80}px` }}
                  >
                    <span className="text-[11px] text-gray-300 font-bold relative -top-3">
                      {9 + i}:00
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* GRID DERECHO */}
            <div className="flex-grow relative z-10 pt-8 pb-8 flex">
              <div className="h-[960px] w-full relative flex">
                <div className="absolute inset-0 pointer-events-none z-0">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-full border-t border-gray-100"
                      style={{ top: `${i * 80}px` }}
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
                        className="flex-1 bg-gray-50/50 relative flex items-center justify-center border-r border-gray-100"
                      >
                        <span className="transform -rotate-90 text-gray-200 font-black tracking-widest text-2xl">
                          CERRADO
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={index}
                      className="flex-1 border-r border-gray-100 relative group hover:bg-gray-50/30 transition-colors z-10"
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
                            className={`absolute left-1 right-1 border-l-4 rounded-xl p-2.5 cursor-pointer hover:shadow-lg transition-all z-20 hover:scale-[1.02] flex flex-col justify-start overflow-hidden ${colorClasses}`}
                            style={{
                              top: `${topPos}px`,
                              height: `${DEFAULT_HEIGHT}px`,
                            }}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <p className="text-[10px] font-black uppercase opacity-70">
                                {booking.start_time?.substring(0, 5)}
                              </p>
                              <span className="text-[10px]">
                                {booking.status === "cancelled"
                                  ? "❌"
                                  : booking.status === "completed"
                                    ? "✅"
                                    : "⏳"}
                              </span>
                            </div>
                            <p className="text-[12px] font-black truncate leading-tight mb-0.5">
                              {booking.guest_name ||
                                booking.client_name ||
                                "Cliente Presencial"}
                            </p>
                            <p className="text-[10px] font-bold truncate opacity-60 italic">
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

      {/* --- MODAL 1: NUEVA CITA (EL CAMALEÓN) --- */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-[#181411]">Nueva Cita</h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateBooking} className="space-y-5">
              {/* BUSCADOR INTELIGENTE */}
              <div className="flex flex-col gap-2 relative">
                <label className="text-sm font-bold text-gray-600">
                  ¿Para quién es la cita?
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-gray-400 material-symbols-outlined">
                    search
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Busca un cliente o escribe un nombre..."
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
                    className="w-full pl-10 border border-gray-200 p-3.5 rounded-2xl focus:border-[#f48c25] outline-none"
                  />
                </div>
                {showDropdown && searchQuery && filteredClients.length > 0 && (
                  <div className="absolute top-[85px] left-0 w-full bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-48 overflow-y-auto z-50 p-2">
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
                        className="p-3 hover:bg-orange-50 rounded-xl cursor-pointer flex items-center justify-between"
                      >
                        <span className="font-bold text-[#181411]">
                          {c.nombre}
                        </span>
                        <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500 uppercase font-black">
                          Cliente
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECCIÓN DINÁMICA DE TELÉFONO */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-600">
                  Teléfono de contacto
                </label>
                {formData.client_id ? (
                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-gray-600">
                    <span className="material-symbols-outlined text-[20px]">
                      call
                    </span>
                    <span className="font-bold">
                      {formData.guest_phone || "Sin teléfono en ficha"}
                    </span>
                  </div>
                ) : (
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-gray-400 material-symbols-outlined">
                      call
                    </span>
                    <input
                      type="tel"
                      placeholder="Número para este nuevo cliente..."
                      value={formData.guest_phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          guest_phone: e.target.value,
                        })
                      }
                      className="w-full pl-10 border border-gray-200 p-3.5 rounded-2xl focus:border-[#f48c25] outline-none"
                    />
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
                  className="border border-gray-200 p-3.5 rounded-2xl focus:border-[#f48c25] outline-none bg-white font-bold text-gray-700"
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
                    className="border border-gray-200 p-3.5 rounded-2xl outline-none"
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
                    className="border border-gray-200 p-3.5 rounded-2xl outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#f48c25] text-white py-4 rounded-2xl font-black hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all mt-4 disabled:bg-gray-300"
              >
                {saving ? "CREANDO..." : "CREAR CITA"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: ÉXITO --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-sm flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-5xl">
                check_circle
              </span>
            </div>
            <h3 className="text-2xl font-black text-[#181411] mb-2">
              ¡Cita Creada!
            </h3>
            <p className="text-gray-500 mb-8 font-medium">
              Todo listo. La cita ya está en tu calendario.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-[#181411] text-white py-4 rounded-2xl font-black hover:bg-gray-800 transition-colors"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL 3: GESTIONAR (USA DISPLAY_PHONE) --- */}
      {showEditModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-md">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-[#181411]">
                Gestionar Cita
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleUpdateBooking}>
              <div className="bg-gray-50 rounded-3xl p-6 mb-8 border border-gray-100">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">
                      Cliente
                    </p>
                    <p className="text-xl font-black text-[#181411] capitalize leading-none mb-2">
                      {selectedBooking.guest_name ||
                        selectedBooking.client_name ||
                        "Cliente Presencial"}
                    </p>
                    {/* USO DEL CAMPO MÁGICO DISPLAY_PHONE */}
                    {selectedBooking.display_phone &&
                      selectedBooking.display_phone !== "Sin teléfono" && (
                        <p className="text-sm font-bold text-[#f48c25] flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px]">
                            call
                          </span>
                          {selectedBooking.display_phone}
                        </p>
                      )}
                  </div>
                  <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100 text-center">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-0.5">
                      Precio
                    </p>
                    <p className="text-lg font-black text-[#181411]">
                      {selectedBooking.total_price
                        ? `${parseFloat(selectedBooking.total_price).toFixed(2).replace(".", ",")}€`
                        : "--"}
                    </p>
                  </div>
                </div>
                <div className="mb-6 pb-6 border-b border-gray-200/50">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">
                    Tratamiento
                  </p>
                  <p className="text-sm font-bold text-[#181411] bg-white p-3 rounded-xl border border-gray-100">
                    {getServicesText(selectedBooking)}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase mb-1">
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
                      className="w-full border-gray-200 border p-3 rounded-xl font-bold text-sm"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase mb-1">
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
                      className="w-full border-gray-200 border p-3 rounded-xl font-bold text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 mb-8">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Estado
                </label>
                <select
                  value={editFormData.status}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, status: e.target.value })
                  }
                  className="border-2 border-gray-100 p-4 rounded-2xl outline-none font-black text-gray-700 bg-gray-50"
                >
                  <option value="pending">⏳ Pendiente</option>
                  <option value="confirmed">👍 Confirmada</option>
                  <option value="completed">✅ Terminada</option>
                  <option value="cancelled">❌ Cancelada</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-[#181411] text-white py-5 rounded-2xl font-black hover:bg-gray-800 shadow-xl transition-all"
              >
                GUARDAR CAMBIOS
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
