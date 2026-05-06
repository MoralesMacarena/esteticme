import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function PanelCliente() {
  // 1. Estados Generales
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("proximas");
  const navigate = useNavigate();

  // 2. Estados para Modales de Configuración
  const [showSettings, setShowSettings] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [editForm, setEditForm] = useState({
    full_name: "",
    phone: "",
    email: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // 3. Estados para Modales de Citas
  const [cancelId, setCancelId] = useState(null);
  const [rescheduleBooking, setRescheduleBooking] = useState(null);
  const [newDateTime, setNewDateTime] = useState({ date: "", time: "" });

  const BACKEND_URL = "http://127.0.0.1:8000";

  // --- CARGAR DATOS ---
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const resProfile = await fetch(
          `${BACKEND_URL}/api/users/profiles/me/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (resProfile.ok) {
          const profileData = await resProfile.json();
          setUser(profileData);
          setEditForm({
            full_name: profileData.full_name || "",
            phone: profileData.phone || "",
            email: profileData.email || "",
          });

          if (profileData.profile_picture) {
            const imgUrl = profileData.profile_picture.startsWith("http")
              ? profileData.profile_picture
              : `${BACKEND_URL}${profileData.profile_picture}`;
            setPreviewImage(imgUrl);
          }
        }

        const resBookings = await fetch(`${BACKEND_URL}/api/bookings/citas/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resBookings.ok) {
          const bookingsData = await resBookings.json();
          setBookings(
            Array.isArray(bookingsData)
              ? bookingsData
              : bookingsData.results || [],
          );
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
      setErrorMsg("");
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) {
      setErrorMsg(
        "Por favor, introduce una dirección de correo electrónico válida.",
      );
      return;
    }

    if (editForm.full_name.trim().length < 3) {
      setErrorMsg("El nombre debe tener al menos 3 caracteres.");
      return;
    }

    const token = localStorage.getItem("access_token");
    const data = new FormData();
    data.append("full_name", editForm.full_name);
    data.append("phone", editForm.phone);
    data.append("email", editForm.email);

    if (selectedImage) {
      data.append("profile_picture", selectedImage);
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/users/profiles/me/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        setShowSettings(false);
        setShowSuccessModal(true);
      } else {
        const errorData = await res.json();
        setErrorMsg(
          errorData.email
            ? "Este email ya está en uso por otro usuario."
            : "Hubo un error al actualizar tus datos.",
        );
      }
    } catch (error) {
      console.error("Error guardando ajustes:", error);
      setErrorMsg("Error de conexión con el servidor.");
    }
  };

  // --- ACCIONES DE LAS CITAS ---
  const handleCancelBooking = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/bookings/citas/${cancelId}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "cancelled" }),
        },
      );
      if (res.ok) {
        setBookings(
          bookings.map((b) =>
            b.id === cancelId ? { ...b, status: "cancelled" } : b,
          ),
        );
        setCancelId(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/bookings/citas/${rescheduleBooking.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            booking_date: newDateTime.date,
            start_time: newDateTime.time,
            status: "pending",
          }),
        },
      );
      if (res.ok) {
        const updatedBooking = await res.json();
        setBookings(
          bookings.map((b) =>
            b.id === rescheduleBooking.id ? updatedBooking : b,
          ),
        );
        setRescheduleBooking(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // --- UTILIDADES ---
  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
            Confirmada
          </span>
        );
      case "pending":
        return (
          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
            Pendiente
          </span>
        );
      case "completed":
        return (
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
            Terminada
          </span>
        );
      case "cancelled":
        return (
          <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold">
            Cancelada
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  const getProfileImage = () => {
    if (!user || !user.profile_picture) return null;
    return user.profile_picture.startsWith("http")
      ? user.profile_picture
      : `${BACKEND_URL}${user.profile_picture}`;
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-pulse text-[#f48c25] font-bold text-xl">
          Cargando tus reservas...
        </div>
      </div>
    );

  const proximas = bookings.filter(
    (b) => b.status === "pending" || b.status === "confirmed",
  );
  const historial = bookings.filter(
    (b) => b.status === "completed" || b.status === "cancelled",
  );
  const displayBookings = activeTab === "proximas" ? proximas : historial;

  return (
    <div className="bg-gray-50 min-h-screen font-sans pb-12 relative">
      {/* --- CABECERA --- */}
      <div className="bg-white border-b border-gray-200 pt-12 pb-6 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 bg-[#181411] text-white rounded-full flex items-center justify-center text-4xl font-black shadow-md uppercase overflow-hidden border-4 border-white">
            {getProfileImage() ? (
              <img
                src={getProfileImage()}
                alt="Perfil"
                className="w-full h-full object-cover"
              />
            ) : user?.full_name ? (
              user.full_name.charAt(0)
            ) : (
              "C"
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-black text-[#181411] mb-1">
              {user?.full_name || "Mi Área de Cliente"}
            </h1>
            <p className="text-gray-500">{user?.email}</p>
          </div>

          {/* BOTÓN ÚNICO DE CONFIGURACIÓN */}
          <div>
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 bg-gray-50 text-gray-700 hover:bg-[#f48c25] hover:text-white font-bold text-sm transition-colors border border-gray-200 hover:border-[#f48c25] px-5 py-2.5 rounded-xl shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">
                edit
              </span>
              Editar Perfil
            </button>
          </div>
        </div>
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab("proximas")}
              className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === "proximas" ? "text-[#f48c25] border-b-2 border-[#f48c25] bg-orange-50/50" : "text-gray-500 hover:text-[#181411] hover:bg-gray-50"}`}
            >
              Próximas Citas ({proximas.length})
            </button>
            <button
              onClick={() => setActiveTab("historial")}
              className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === "historial" ? "text-[#f48c25] border-b-2 border-[#f48c25] bg-orange-50/50" : "text-gray-500 hover:text-[#181411] hover:bg-gray-50"}`}
            >
              Historial ({historial.length})
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {displayBookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-4xl text-gray-400">
                    calendar_month
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#181411]">
                  No hay citas aquí
                </h3>
                <p className="text-gray-500 mt-2 mb-8">
                  {activeTab === "proximas"
                    ? "Aún no tienes ninguna reserva próxima."
                    : "No tienes citas pasadas o canceladas."}
                </p>
                {activeTab === "proximas" && (
                  <Link
                    to="/salones"
                    className="inline-block bg-[#f48c25] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-sm"
                  >
                    Explorar Salones
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {displayBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="border border-gray-100 rounded-2xl p-5 flex flex-col md:flex-row gap-5 md:items-center justify-between hover:border-gray-200 hover:shadow-md transition-all bg-white group"
                  >
                    <div className="flex gap-5 items-center">
                      <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-center min-w-[80px]">
                        <p className="text-xs font-bold text-[#f48c25] uppercase">
                          {new Date(booking.booking_date).toLocaleDateString(
                            "es-ES",
                            { month: "short" },
                          )}
                        </p>
                        <p className="text-2xl font-black text-[#181411] leading-none mt-1">
                          {new Date(booking.booking_date).getDate()}
                        </p>
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="font-bold text-lg text-[#181411]">
                            {booking.professional_name || "Salón de Belleza"}
                          </h4>
                          {getStatusBadge(booking.status)}
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <p className="text-sm text-gray-500 flex items-center gap-1.5 font-medium">
                            <span className="material-symbols-outlined text-[18px]">
                              schedule
                            </span>
                            {booking.start_time?.substring(0, 5)} h
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-1.5 font-medium">
                            <span className="material-symbols-outlined text-[18px]">
                              payments
                            </span>
                            {parseFloat(booking.total_price || 0)
                              .toFixed(2)
                              .replace(".", ",")}{" "}
                            €
                          </p>
                        </div>
                      </div>
                    </div>

                    {activeTab === "proximas" && (
                      <div className="flex gap-2 mt-2 md:mt-0 w-full md:w-auto opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setRescheduleBooking(booking)}
                          className="flex-1 md:flex-none bg-white border border-[#f48c25] text-[#f48c25] px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-orange-50 transition-colors"
                        >
                          Cambiar
                        </button>
                        <button
                          onClick={() => setCancelId(booking.id)}
                          className="flex-1 md:flex-none bg-white border border-red-500 text-red-500 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}

                    {activeTab === "historial" &&
                      booking.status === "completed" && (
                        <button className="w-full md:w-auto mt-2 md:mt-0 bg-white border-2 border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:border-[#181411] hover:text-[#181411] transition-colors">
                          Valorar visita
                        </button>
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MODAL 1: CONFIGURACIÓN DE PERFIL --- */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-black text-[#181411]">
                Editar Perfil
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <span className="material-symbols-outlined text-2xl">
                  close
                </span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleSaveSettings} className="space-y-5">
                {/* MOSTRAR ERRORES */}
                {errorMsg && (
                  <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-sm font-medium flex items-center gap-2 animate-in slide-in-from-top-2">
                    <span className="material-symbols-outlined text-lg">
                      error
                    </span>
                    {errorMsg}
                  </div>
                )}

                {/* SUBIDOR DE FOTO */}
                <div className="flex flex-col items-center mb-2">
                  <div className="relative size-28 rounded-full bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden mb-2 group cursor-pointer hover:border-[#f48c25] transition-colors">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-gray-400 text-5xl">
                        person
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-white mb-1">
                        photo_camera
                      </span>
                      <span className="text-white text-xs font-bold">
                        Actualizar
                      </span>
                    </div>
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </div>
                  <span className="text-xs text-gray-400 font-medium">
                    Haz clic para cambiar tu foto
                  </span>
                </div>

                {/* CAMPOS DE TEXTO CON ICONOS */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
                    Nombre Completo
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-[20px]">
                      badge
                    </span>
                    <input
                      type="text"
                      value={editForm.full_name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, full_name: e.target.value })
                      }
                      className="w-full border border-gray-200 bg-gray-50 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:bg-white focus:border-[#f48c25] focus:ring-4 focus:ring-[#f48c25]/10 transition-all"
                      placeholder="Tu nombre real"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-[20px]">
                      mail
                    </span>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                      className="w-full border border-gray-200 bg-gray-50 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:bg-white focus:border-[#f48c25] focus:ring-4 focus:ring-[#f48c25]/10 transition-all"
                      placeholder="ejemplo@correo.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
                    Teléfono (Opcional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-[20px]">
                      call
                    </span>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm({ ...editForm, phone: e.target.value })
                      }
                      className="w-full border border-gray-200 bg-gray-50 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:bg-white focus:border-[#f48c25] focus:ring-4 focus:ring-[#f48c25]/10 transition-all"
                      placeholder="+34 600 000 000"
                    />
                  </div>
                </div>

                {/* BOTONERA: CANCELAR Y GUARDAR */}
                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setShowSettings(false)}
                    className="flex-1 py-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-[#f48c25] text-white font-black rounded-xl hover:bg-orange-600 transition-colors shadow-md flex justify-center items-center gap-2"
                  >
                    <span className="material-symbols-outlined">save</span>
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 1.5: ¡ÉXITO! --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center animate-in zoom-in-95">
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-5">
              <span className="material-symbols-outlined text-5xl">
                check_circle
              </span>
            </div>
            <h3 className="text-2xl font-black text-[#181411] mb-2">
              ¡Perfil Actualizado!
            </h3>
            <p className="text-gray-500 mb-8">
              Tus datos y foto se han guardado correctamente.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3.5 bg-[#181411] text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
            >
              Genial, gracias
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL 2 Y 3: (REPROGRAMAR Y CANCELAR) --- */}
      {rescheduleBooking && (
        <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-8">
            <div className="w-14 h-14 bg-orange-50 text-[#f48c25] rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl">event</span>
            </div>
            <h3 className="text-xl font-black text-[#181411] mb-2">
              Reprogramar Cita
            </h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Selecciona una nueva fecha. El salón revisará el cambio y te
              confirmará la nueva hora.
            </p>
            <form onSubmit={handleReschedule} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
                  Nueva Fecha
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={newDateTime.date}
                  onChange={(e) =>
                    setNewDateTime({ ...newDateTime, date: e.target.value })
                  }
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3.5 outline-none focus:bg-white focus:border-[#f48c25] focus:ring-4 focus:ring-[#f48c25]/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
                  Nueva Hora
                </label>
                <input
                  type="time"
                  required
                  value={newDateTime.time}
                  onChange={(e) =>
                    setNewDateTime({ ...newDateTime, time: e.target.value })
                  }
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3.5 outline-none focus:bg-white focus:border-[#f48c25] focus:ring-4 focus:ring-[#f48c25]/10 transition-all"
                />
              </div>
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setRescheduleBooking(null)}
                  className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-[#f48c25] text-white font-bold rounded-xl hover:bg-orange-600 transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {cancelId && (
        <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-8 text-center">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5">
              <span className="material-symbols-outlined text-4xl">
                warning
              </span>
            </div>
            <h3 className="text-2xl font-black text-[#181411] mb-2">
              ¿Cancelar Cita?
            </h3>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Esta acción no se puede deshacer. Perderás la reserva de tu hora y
              tendrás que volver a pedir cita.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleCancelBooking}
                className="w-full py-3.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors"
              >
                Sí, cancelar cita
              </button>
              <button
                onClick={() => setCancelId(null)}
                className="w-full py-3.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
              >
                No, mantener mi hora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
