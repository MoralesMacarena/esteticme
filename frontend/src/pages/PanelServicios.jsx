import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function PanelServicios() {
  const [activeTab, setActiveTab] = useState("servicios");

  const [services, setServices] = useState([]);
  const [availabilities, setAvailabilities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS PARA MODALES ---
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);

  const [editingService, setEditingService] = useState(null);
  const [editingDay, setEditingDay] = useState(null);

  // --- FORMULARIOS ---
  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    price: "",
    duration_minutes: "",
    category: "",
    is_active: true,
  });

  const [hoursForm, setHoursForm] = useState({
    day_of_week: 0,
    start_time: "09:00",
    end_time: "18:00",
  });

  // Mapeo de días para Django (0=Lunes, 6=Domingo)
  const daysMapping = [
    { id: 0, name: "Lunes" },
    { id: 1, name: "Martes" },
    { id: 2, name: "Miércoles" },
    { id: 3, name: "Jueves" },
    { id: 4, name: "Viernes" },
    { id: 5, name: "Sábado" },
    { id: 6, name: "Domingo" },
  ];

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const fetchData = async () => {
      try {
        const [resServices, resAvailabilities, resCategories] =
          await Promise.all([
            fetch("http://127.0.0.1:8000/api/bookings/servicios/", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch("http://127.0.0.1:8000/api/bookings/disponibilidad/", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch("http://127.0.0.1:8000/api/bookings/categorias/"),
          ]);

        if (resServices.ok) setServices(await resServices.json());
        if (resAvailabilities.ok) {
          const data = await resAvailabilities.json();
          setAvailabilities(Array.isArray(data) ? data : data.results || []);
        }
        if (resCategories.ok) setCategories(await resCategories.json());
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, []);

  // --- LÓGICA DE SERVICIOS ---
  const openServiceModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setServiceForm({
        name: service.name,
        description: service.description || "",
        price: service.price,
        duration_minutes: service.duration_minutes,
        category: service.category || "",
        is_active: service.is_active,
      });
    } else {
      setEditingService(null);
      setServiceForm({
        name: "",
        description: "",
        price: "",
        duration_minutes: "",
        category: "",
        is_active: true,
      });
    }
    setIsServiceModalOpen(true);
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    const url = editingService
      ? `http://127.0.0.1:8000/api/bookings/servicios/${editingService.id}/`
      : "http://127.0.0.1:8000/api/bookings/servicios/";
    const method = editingService ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(serviceForm),
    });

    if (response.ok) {
      const saved = await response.json();
      setServices(
        editingService
          ? services.map((s) => (s.id === saved.id ? saved : s))
          : [saved, ...services],
      );
      setIsServiceModalOpen(false);
    }
  };

  // --- LÓGICA DE HORARIOS ---
  const openHoursModal = (dayId) => {
    const existing = availabilities.find((a) => a.day_of_week === dayId);
    setEditingDay(dayId);
    if (existing) {
      setHoursForm({
        day_of_week: dayId,
        start_time: existing.start_time.substring(0, 5),
        end_time: existing.end_time.substring(0, 5),
      });
    } else {
      setHoursForm({
        day_of_week: dayId,
        start_time: "09:00",
        end_time: "18:00",
      });
    }
    setIsHoursModalOpen(true);
  };

  const handleHoursSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    const existing = availabilities.find((a) => a.day_of_week === editingDay);

    const url = existing
      ? `http://127.0.0.1:8000/api/bookings/disponibilidad/${existing.id}/`
      : "http://127.0.0.1:8000/api/bookings/disponibilidad/";
    const method = existing ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(hoursForm),
    });

    if (response.ok) {
      const saved = await response.json();
      setAvailabilities(
        existing
          ? availabilities.map((a) => (a.id === saved.id ? saved : a))
          : [...availabilities, saved],
      );
      setIsHoursModalOpen(false);
    }
  };

  const deleteAvailability = async (id) => {
    if (
      !window.confirm("¿Quieres cerrar este día? No habrá citas disponibles.")
    )
      return;
    const token = localStorage.getItem("access_token");
    const res = await fetch(
      `http://127.0.0.1:8000/api/bookings/disponibilidad/${id}/`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (res.ok) setAvailabilities(availabilities.filter((a) => a.id !== id));
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mx-auto max-w-7xl">
          {/* CABECERA */}
          <div className="mb-8 border-b border-gray-200 pb-4">
            <Link
              to="/panel"
              className="flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-[#f48c25] mb-3 w-fit transition-colors"
            >
              <span className="material-symbols-outlined text-sm">
                arrow_back
              </span>{" "}
              Volver al Panel principal
            </Link>
            <h1 className="text-3xl font-black text-[#181411]">
              Catálogo y Horarios
            </h1>
            <p className="text-gray-500 mt-1">
              Gestiona lo que ofreces y cuándo estás disponible.
            </p>
          </div>

          {/* TABS */}
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("servicios")}
              className={`pb-3 px-2 font-bold text-sm transition-colors ${activeTab === "servicios" ? "text-[#f48c25] border-b-2 border-[#f48c25]" : "text-gray-500"}`}
            >
              Mis Servicios
            </button>
            <button
              onClick={() => setActiveTab("horario")}
              className={`pb-3 px-2 font-bold text-sm transition-colors ${activeTab === "horario" ? "text-[#f48c25] border-b-2 border-[#f48c25]" : "text-gray-500"}`}
            >
              Mi Horario Semanal
            </button>
          </div>

          {loading ? (
            <p className="animate-pulse py-10">Cargando configuración...</p>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              {/* VISTA SERVICIOS */}
              {activeTab === "servicios" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Lista de Servicios</h2>
                    <button
                      onClick={() => openServiceModal()}
                      className="bg-[#181411] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">
                        add
                      </span>{" "}
                      Nuevo Servicio
                    </button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {services.length === 0 ? (
                      <p className="text-gray-400 py-4 italic text-center col-span-full">
                        No tienes servicios creados.
                      </p>
                    ) : (
                      services.map((s) => (
                        <div
                          key={s.id}
                          className="border border-gray-200 p-4 rounded-lg flex flex-col justify-between hover:border-[#f48c25] transition shadow-sm"
                        >
                          <div>
                            <div className="flex justify-between items-start">
                              <h3 className="font-bold text-[#181411]">
                                {s.name}
                              </h3>
                              <span className="text-xs font-bold text-[#f48c25] bg-orange-50 px-2 py-1 rounded">
                                {s.duration_minutes} min
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                              {s.description || "Sin descripción"}
                            </p>
                          </div>
                          <div className="mt-4 flex justify-between items-center pt-2 border-t">
                            <span className="font-black text-lg">
                              {parseFloat(s.price).toFixed(2)}€
                            </span>
                            <button
                              onClick={() => openServiceModal(s)}
                              className="text-blue-600 font-bold text-sm hover:underline"
                            >
                              Editar
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* VISTA HORARIOS (ESTA ES LA QUE TE FALTABA) */}
              {activeTab === "horario" && (
                <div>
                  <h2 className="text-xl font-bold mb-6">
                    Disponibilidad Semanal
                  </h2>
                  <div className="max-w-2xl bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                    {daysMapping.map((day) => {
                      const schedule = availabilities.find(
                        (a) => a.day_of_week === day.id,
                      );
                      return (
                        <div
                          key={day.id}
                          className="flex items-center justify-between p-4 border-b border-gray-200 last:border-0 bg-white"
                        >
                          <div className="flex items-center gap-4">
                            <span
                              className={`w-3 h-3 rounded-full ${schedule ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-gray-300"}`}
                            ></span>
                            <span className="font-bold text-[#181411] w-24">
                              {day.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-4">
                            {schedule ? (
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded border border-gray-200 shadow-sm">
                                  {schedule.start_time.substring(0, 5)}
                                </span>
                                <span className="text-gray-400">-</span>
                                <span className="text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded border border-gray-200 shadow-sm">
                                  {schedule.end_time.substring(0, 5)}
                                </span>
                                <button
                                  onClick={() =>
                                    deleteAvailability(schedule.id)
                                  }
                                  className="ml-2 text-red-400 hover:text-red-600 transition-colors"
                                >
                                  <span className="material-symbols-outlined text-lg">
                                    cancel
                                  </span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-sm font-medium text-gray-400 italic">
                                Cerrado / No configurado
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => openHoursModal(day.id)}
                            className="bg-gray-100 hover:bg-[#f48c25] hover:text-white text-gray-700 px-3 py-1 rounded text-xs font-bold transition-all shadow-sm"
                          >
                            {schedule ? "Cambiar" : "Configurar"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* --- MODAL DE HORARIO --- */}
      {isHoursModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="text-xl font-bold">
                Horario: {daysMapping.find((d) => d.id === editingDay)?.name}
              </h3>
              <button
                onClick={() => setIsHoursModalOpen(false)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form
              onSubmit={handleHoursSubmit}
              className="p-6 flex flex-col gap-6"
            >
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">
                    Apertura
                  </label>
                  <input
                    type="time"
                    required
                    value={hoursForm.start_time}
                    onChange={(e) =>
                      setHoursForm({ ...hoursForm, start_time: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg p-2 font-bold focus:border-[#f48c25] outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">
                    Cierre
                  </label>
                  <input
                    type="time"
                    required
                    value={hoursForm.end_time}
                    onChange={(e) =>
                      setHoursForm({ ...hoursForm, end_time: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg p-2 font-bold focus:border-[#f48c25] outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-[#f48c25] text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition shadow-md"
              >
                Guardar Cambios
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL DE SERVICIO --- */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="text-xl font-bold">
                {editingService ? "Editar Servicio" : "Nuevo Servicio"}
              </h3>
              <button
                onClick={() => setIsServiceModalOpen(false)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form
              onSubmit={handleServiceSubmit}
              className="p-6 flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Nombre
                </label>
                <input
                  type="text"
                  placeholder="Ej: Corte de pelo"
                  required
                  value={serviceForm.name}
                  onChange={(e) =>
                    setServiceForm({ ...serviceForm, name: e.target.value })
                  }
                  className="border border-gray-300 p-2 rounded focus:border-[#f48c25] outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Descripción
                </label>
                <textarea
                  placeholder="Qué incluye el servicio..."
                  value={serviceForm.description}
                  onChange={(e) =>
                    setServiceForm({
                      ...serviceForm,
                      description: e.target.value,
                    })
                  }
                  className="border border-gray-300 p-2 rounded h-20 resize-none focus:border-[#f48c25] outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Categoría
                </label>
                <select
                  required
                  value={serviceForm.category}
                  onChange={(e) =>
                    setServiceForm({ ...serviceForm, category: e.target.value })
                  }
                  className="border border-gray-300 p-2 rounded focus:border-[#f48c25] outline-none"
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Precio (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={serviceForm.price}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, price: e.target.value })
                    }
                    className="border border-gray-300 p-2 rounded focus:border-[#f48c25] outline-none"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Duración (min)
                  </label>
                  <input
                    type="number"
                    required
                    value={serviceForm.duration_minutes}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        duration_minutes: e.target.value,
                      })
                    }
                    className="border border-gray-300 p-2 rounded focus:border-[#f48c25] outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-[#f48c25] text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition shadow-md mt-2"
              >
                Guardar Servicio
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
