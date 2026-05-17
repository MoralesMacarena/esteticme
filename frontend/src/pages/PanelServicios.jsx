import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function PanelServicios() {
  const [activeTab, setActiveTab] = useState("servicios");

  const [services, setServices] = useState([]);
  const [availabilities, setAvailabilities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState(null);

  // --- ESTADOS PARA MODALES (Lógica intacta) ---
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);

  // --- ESTADOS PARA MODALES DE ÉXITO/ERROR ---
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // --- ESTADOS PARA MODALES DE CONFIRMACIÓN ---
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [editingService, setEditingService] = useState(null);
  const [editingDay, setEditingDay] = useState(null);

  // --- FORMULARIOS (Lógica intacta) ---
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

  // --- HANDLERS SERVICIOS ---
  const openServiceModal = (service = null) => {
    setImageFile(null);
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

    // Con archivos a veces PATCH da problemas en Django, usamos PUT o POST
    const method = editingService ? "PUT" : "POST";

    //Creamos el FormData
    const formData = new FormData();
    formData.append("name", serviceForm.name);
    formData.append("description", serviceForm.description);
    formData.append("price", serviceForm.price);
    formData.append("duration_minutes", serviceForm.duration_minutes);
    formData.append("category", serviceForm.category);
    formData.append("is_active", serviceForm.is_active);

    //Añadimos el archivo de imagen solo si el usuario seleccionó uno
    if (imageFile) {
      formData.append("image", imageFile);
    }

    //Enviamos la petición sin Content-Type
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        // Eliminamos el Content-Type para que el navegador lo calcule automáticamente como multipart/form-data
      },
      body: formData,
    });

    if (response.ok) {
      const saved = await response.json();
      setServices(
        editingService
          ? services.map((s) => (s.id === saved.id ? saved : s))
          : [saved, ...services],
      );
      // 1. Cerramos el modal del formulario
      setIsServiceModalOpen(false);

      // 2. Configuramos el mensaje y abrimos el modal de éxito
      setSuccessMessage(
        editingService
          ? "¡Tratamiento actualizado correctamente!"
          : "¡Nuevo tratamiento añadido al catálogo!",
      );
      setShowSuccessModal(true);
    } else {
      console.error("Error al guardar el servicio");
    }
  };

  // --- HANDLERS HORARIOS ---
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

  // 1. Esta función solo abre el modal de advertencia
  const handleDeleteClick = () => {
    setShowConfirmModal(true);
  };

  // 2. Esta función ejecuta el borrado real (se llama desde dentro del modal)
  const executeDeleteService = async () => {
    setShowConfirmModal(false); // Cerramos el modal de advertencia

    const token = localStorage.getItem("access_token");
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/bookings/servicios/${editingService.id}/`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.status === 204) {
        setServices(services.filter((s) => s.id !== editingService.id));
        setIsServiceModalOpen(false);
        setSuccessMessage("Tratamiento eliminado completamente.");
        setShowSuccessModal(true);
      } else if (response.status === 200) {
        setServices(
          services.map((s) =>
            s.id === editingService.id ? { ...s, is_active: false } : s,
          ),
        );
        setIsServiceModalOpen(false);
        setSuccessMessage(
          "Tratamiento archivado. Ya no será visible para los clientes.",
        );
        setShowSuccessModal(true);
      } else {
        const data = await response.json();
        setErrorMessage(data.error || "No se pudo retirar el servicio.");
        setShowErrorModal(true);
      }
    } catch (error) {
      setErrorMessage("Error de conexión al intentar retirar el servicio.");
      setShowErrorModal(true);
    }
  };

  // --- VARIABLES DE ESTILO AURA ---
  const pearlBtn =
    "bg-gradient-to-r from-purple-100 via-white to-fuchsia-100 border border-white/60 shadow-pearl text-aura-plum font-bold rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]";
  const inputStyles =
    "w-full bg-white/80 border border-purple-100 rounded-2xl px-6 py-4 text-aura-plum font-medium focus:ring-4 focus:ring-purple-100 outline-none transition-all placeholder:text-purple-200";
  const labelStyles =
    "block text-[11px] font-black text-aura-plum/60 mb-2 uppercase tracking-[0.2em] ml-2";

  return (
    <div className="bg-aura-lavender min-h-screen font-sans relative overflow-hidden">
      {/* Decoración de fondo */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

      <main className="w-full px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="mx-auto max-w-6xl">
          {/* CABECERA */}
          <div className="mb-10 border-b border-purple-100 pb-8">
            <Link
              to="/panel"
              className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-aura-plum/60 hover:text-aura-plum mb-4 w-fit transition-all bg-white/40 px-4 py-2 rounded-xl border border-white/60"
            >
              <span className="material-symbols-outlined text-sm">
                arrow_back
              </span>
              Panel principal
            </Link>
            <h1 className="text-5xl font-serif text-aura-plum tracking-tight">
              Catálogo y Horarios
            </h1>
            <p className="text-gray-500 font-light italic mt-3 text-lg">
              Define tus servicios y tu tiempo de bienestar.
            </p>
          </div>

          {/* TABS AURA */}
          <div className="flex justify-center gap-4 mb-10">
            <button
              onClick={() => setActiveTab("servicios")}
              className={`px-8 py-3 rounded-2xl font-bold transition-all ${activeTab === "servicios" ? "bg-aura-plum text-white shadow-lg" : "bg-white/40 text-aura-plum hover:bg-white/80"}`}
            >
              Mis Servicios
            </button>
            <button
              onClick={() => setActiveTab("horario")}
              className={`px-8 py-3 rounded-2xl font-bold transition-all ${activeTab === "horario" ? "bg-aura-plum text-white shadow-lg" : "bg-white/40 text-aura-plum hover:bg-white/80"}`}
            >
              Horario Semanal
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center py-20 animate-pulse">
              <div className="w-12 h-12 border-4 border-aura-plum border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="font-serif italic text-aura-plum">
                Sincronizando catálogo...
              </p>
            </div>
          ) : (
            <div className="bg-white/60 backdrop-blur-xl rounded-[3.5rem] border border-white p-10 shadow-sm">
              {/* VISTA SERVICIOS */}
              {activeTab === "servicios" && (
                <div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                    <h2 className="text-3xl font-serif text-aura-plum tracking-tight">
                      Lista de Servicios
                    </h2>
                    <button
                      onClick={() => openServiceModal()}
                      className={`${pearlBtn} px-8 py-4 flex items-center gap-2 text-sm uppercase tracking-widest`}
                    >
                      <span className="material-symbols-outlined text-lg">
                        add
                      </span>
                      Nuevo Servicio
                    </button>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {services.length === 0 ? (
                      <div className="col-span-full py-20 text-center bg-white/30 rounded-[2.5rem] border border-dashed border-purple-200">
                        <p className="text-aura-plum/40 font-serif italic text-xl">
                          Aún no has diseñado tu carta de servicios.
                        </p>
                      </div>
                    ) : (
                      services.map((s) => (
                        <div
                          key={s.id}
                          className="bg-white/80 p-8 rounded-[2.5rem] border border-purple-50 flex flex-col justify-between hover:shadow-pearl transition-all group"
                        >
                          <div>
                            <div className="flex justify-between items-start mb-4">
                              <h3 className="font-bold text-aura-plum text-lg leading-tight pr-4 flex flex-wrap items-center gap-2">
                                {s.name}
                                {!s.is_active && (
                                  <span className="text-[9px] bg-red-100 text-red-500 px-2 py-0.5 rounded-full uppercase tracking-widest font-black border border-red-200">
                                    Inactivo
                                  </span>
                                )}
                              </h3>
                              <span className="text-[10px] font-black text-purple-400 bg-purple-50 px-3 py-1 rounded-full border border-purple-100 uppercase tracking-widest">
                                {s.duration_minutes} min
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 font-light italic line-clamp-3 leading-relaxed mb-6">
                              {s.description ||
                                "Sin descripción proporcionada."}
                            </p>
                          </div>
                          <div className="flex justify-between items-center pt-6 border-t border-purple-50">
                            <span className="font-serif text-2xl text-aura-plum">
                              {parseFloat(s.price).toFixed(2)}€
                            </span>
                            <button
                              onClick={() => openServiceModal(s)}
                              className="text-xs font-black uppercase tracking-[0.2em] text-aura-plum border-b border-purple-200 hover:border-aura-plum transition-all"
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

              {/* VISTA HORARIOS */}
              {activeTab === "horario" && (
                <div>
                  <h2 className="text-3xl font-serif text-aura-plum tracking-tight mb-10">
                    Disponibilidad Semanal
                  </h2>
                  <div className="max-w-3xl mx-auto space-y-4">
                    {daysMapping.map((day) => {
                      const schedule = availabilities.find(
                        (a) => a.day_of_week === day.id,
                      );
                      return (
                        <div
                          key={day.id}
                          className="bg-white/80 p-6 rounded-[2rem] border border-purple-50 flex items-center justify-between group hover:bg-white transition-all"
                        >
                          <div className="flex items-center gap-6">
                            <div
                              className={`w-3 h-3 rounded-full ${schedule ? "bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.5)]" : "bg-purple-100"}`}
                            ></div>
                            <span className="font-bold text-aura-plum text-lg w-24">
                              {day.name}
                            </span>
                          </div>

                          <div className="flex-1 flex justify-center">
                            {schedule ? (
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-black text-aura-plum bg-purple-50 px-4 py-2 rounded-xl border border-purple-100">
                                  {schedule.start_time.substring(0, 5)}
                                </span>
                                <span className="text-purple-200">—</span>
                                <span className="text-sm font-black text-aura-plum bg-purple-50 px-4 py-2 rounded-xl border border-purple-100">
                                  {schedule.end_time.substring(0, 5)}
                                </span>
                                <button
                                  onClick={() =>
                                    deleteAvailability(schedule.id)
                                  }
                                  className="ml-4 size-10 rounded-xl flex items-center justify-center text-red-300 hover:bg-red-50 hover:text-red-500 transition-all"
                                  title="Cerrar día"
                                >
                                  <span className="material-symbols-outlined text-lg">
                                    cancel
                                  </span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-sm font-light text-purple-300 italic tracking-wide">
                                Establecimiento cerrado
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => openHoursModal(day.id)}
                            className="px-6 py-2 bg-white border border-purple-100 text-aura-plum text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-purple-50 transition-all shadow-sm"
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
        <div className="fixed inset-0 bg-aura-plum/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-300 border border-white">
            <div className="p-8 border-b border-purple-50 bg-purple-50/30 flex justify-between items-center">
              <h3 className="text-2xl font-serif text-aura-plum">
                {daysMapping.find((d) => d.id === editingDay)?.name}
              </h3>
              <button
                onClick={() => setIsHoursModalOpen(false)}
                className="text-purple-300 hover:text-red-400 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleHoursSubmit} className="p-8 space-y-8">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className={labelStyles}>Apertura</label>
                  <input
                    type="time"
                    required
                    value={hoursForm.start_time}
                    onChange={(e) =>
                      setHoursForm({ ...hoursForm, start_time: e.target.value })
                    }
                    className={inputStyles}
                  />
                </div>
                <div className="flex-1">
                  <label className={labelStyles}>Cierre</label>
                  <input
                    type="time"
                    required
                    value={hoursForm.end_time}
                    onChange={(e) =>
                      setHoursForm({ ...hoursForm, end_time: e.target.value })
                    }
                    className={inputStyles}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-aura-plum text-white py-5 rounded-[1.5rem] font-bold shadow-lg hover:scale-[1.02] transition-all"
              >
                Guardar Horario
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL DE SERVICIO --- */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 bg-aura-plum/20 backdrop-blur-sm z-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300 border border-white">
            <div className="p-8 border-b border-purple-50 bg-purple-50/30 flex justify-between items-center">
              <h3 className="text-3xl font-serif text-aura-plum">
                {editingService ? "Editar Tratamiento" : "Nuevo Tratamiento"}
              </h3>
              <button
                onClick={() => setIsServiceModalOpen(false)}
                className="text-purple-300 hover:text-red-400 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleServiceSubmit} className="p-10 space-y-6">
              <div>
                <label className={labelStyles}>Imagen (Opcional)</label>

                {/* --- CAJA DE PREVISUALIZACIÓN --- */}
                {(imageFile || (editingService && editingService.image)) && (
                  <div className="mb-4 relative rounded-[1.5rem] overflow-hidden h-40 w-full sm:w-1/2 border border-purple-100 shadow-sm">
                    <img
                      src={
                        imageFile
                          ? URL.createObjectURL(imageFile) // 1. Si acaba de elegir una nueva, la mostramos al instante
                          : editingService.image.startsWith("http")
                            ? editingService.image
                            : `http://127.0.0.1:8000${editingService.image}` // 2. Si no hay nueva, mostramos la que ya estaba en el servidor
                      }
                      alt="Vista previa del tratamiento"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full bg-white/80 border border-purple-100 rounded-2xl px-4 py-3 text-aura-plum font-medium focus:ring-4 focus:ring-purple-100 outline-none transition-all 
                  file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-purple-50 file:text-aura-plum hover:file:bg-purple-100 cursor-pointer"
                />
              </div>
              <div>
                <label className={labelStyles}>Nombre del servicio</label>
                <input
                  type="text"
                  placeholder="Ej: Ritual de Hidratación"
                  required
                  value={serviceForm.name}
                  onChange={(e) =>
                    setServiceForm({ ...serviceForm, name: e.target.value })
                  }
                  className={inputStyles}
                />
              </div>
              <div>
                <label className={labelStyles}>Descripción</label>
                <textarea
                  placeholder="Describe la experiencia..."
                  value={serviceForm.description}
                  onChange={(e) =>
                    setServiceForm({
                      ...serviceForm,
                      description: e.target.value,
                    })
                  }
                  className={`${inputStyles} h-32 resize-none leading-relaxed`}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelStyles}>Categoría</label>
                  <select
                    required
                    value={serviceForm.category}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        category: e.target.value,
                      })
                    }
                    className={inputStyles}
                  >
                    <option value="">Seleccionar...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelStyles}>Precio (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={serviceForm.price}
                      onChange={(e) =>
                        setServiceForm({
                          ...serviceForm,
                          price: e.target.value,
                        })
                      }
                      className={inputStyles}
                    />
                  </div>
                  <div>
                    <label className={labelStyles}>Duración(min)</label>
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
                      className={inputStyles}
                    />
                  </div>
                </div>
              </div>
              {/* Checkbox para Activar/Desactivar */}
              <div className="flex items-center gap-3 bg-purple-50/50 p-4 rounded-2xl border border-purple-100 mt-4">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={serviceForm.is_active}
                  onChange={(e) =>
                    setServiceForm({
                      ...serviceForm,
                      is_active: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-aura-plum border-purple-300 rounded focus:ring-aura-plum cursor-pointer"
                />
                <div>
                  <label
                    htmlFor="is_active"
                    className="text-sm font-bold text-aura-plum cursor-pointer block"
                  >
                    Servicio Activo
                  </label>
                  <span className="text-xs text-gray-500 font-light italic">
                    Si lo desmarcas, los clientes no podrán reservarlo.
                  </span>
                </div>
              </div>

              {/* --- BOTONES DE ACCIÓN --- */}
              <div className="flex gap-4 mt-8">
                {editingService && (
                  <button
                    type="button"
                    onClick={handleDeleteClick} // 🔥 CAMBIADO: Antes ponía handleDeleteService
                    className="px-6 bg-red-50 text-red-500 rounded-[2rem] font-bold hover:bg-red-100 transition-all flex items-center justify-center border border-red-100"
                    title="Borrar Servicio"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 bg-aura-plum text-white py-5 rounded-[2rem] font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Guardar Servicio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* --- MODAL DE ÉXITO ESTILO AURA --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-aura-plum/20 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[3rem] border border-white shadow-2xl p-10 w-full max-w-sm flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
            <div className="w-24 h-24 bg-green-50 text-green-400 rounded-full flex items-center justify-center mb-6 shadow-inner border border-green-100">
              <span className="material-symbols-outlined text-6xl">
                check_circle
              </span>
            </div>
            <h3 className="text-2xl font-serif text-aura-plum mb-3">
              ¡Guardado con éxito!
            </h3>
            <p className="text-gray-500 font-light italic mb-8">
              {successMessage}
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-aura-plum text-white py-4 rounded-2xl font-bold hover:scale-[1.02] transition-all shadow-md"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
      {/* --- MODAL DE CONFIRMACIÓN ESTILO AURA --- */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-aura-plum/40 backdrop-blur-sm z-[300] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[3rem] border border-white shadow-2xl p-10 w-full max-w-sm flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
            <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-inner border border-orange-100">
              <span className="material-symbols-outlined text-5xl">
                warning
              </span>
            </div>
            <h3 className="text-2xl font-serif text-aura-plum mb-3">
              ¿Retirar servicio?
            </h3>
            <p className="text-gray-500 font-light italic mb-8">
              Estás a punto de retirar este tratamiento de tu catálogo público.
              ¿Estás seguro?
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 bg-white text-gray-500 py-4 rounded-2xl font-bold border border-gray-200 hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={executeDeleteService}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl font-bold hover:bg-orange-500 hover:scale-[1.02] transition-all shadow-md"
              >
                Sí, retirar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE ERROR ESTILO AURA --- */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-aura-plum/20 backdrop-blur-sm z-[400] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[3rem] border border-white shadow-2xl p-10 w-full max-w-sm flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
            <div className="w-24 h-24 bg-red-50 text-red-400 rounded-full flex items-center justify-center mb-6 shadow-inner border border-red-100">
              <span className="material-symbols-outlined text-6xl">error</span>
            </div>
            <h3 className="text-2xl font-serif text-aura-plum mb-3">
              Acción denegada
            </h3>
            <p className="text-gray-500 font-light italic mb-8">
              {errorMessage}
            </p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full bg-red-400 text-white py-4 rounded-2xl font-bold hover:bg-red-500 hover:scale-[1.02] transition-all shadow-md"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
