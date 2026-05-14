import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function PanelCliente() {
  // --- 1. TU LÓGICA ORIGINAL (ESTADOS) ---
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("proximas");
  const navigate = useNavigate();

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

  const [cancelId, setCancelId] = useState(null);
  const [rescheduleBooking, setRescheduleBooking] = useState(null);
  const [newDateTime, setNewDateTime] = useState({ date: "", time: "" });

  const [reviewBooking, setReviewBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState("");

  const BACKEND_URL = "http://127.0.0.1:8000";

  // --- 2. CARGAR DATOS (CON FIX HEADER) ---
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
          // Sincronización Header
          localStorage.setItem(
            "user_name",
            profileData.full_name || profileData.username,
          );

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

  // --- 3. TUS HANDLERS (LOGICA ORIGINAL) ---
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
        localStorage.setItem("user_name", updatedUser.full_name);
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

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError("");
    const token = localStorage.getItem("access_token");

    try {
      const res = await fetch(
        `${BACKEND_URL}/api/bookings/citas/${reviewBooking.id}/rate/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rating: rating, comment: reviewComment }),
        },
      );

      if (res.ok) {
        const updatedBooking = await res.json();
        setBookings(
          bookings.map((b) => (b.id === reviewBooking.id ? updatedBooking : b)),
        );
        setReviewBooking(null);
        setRating(5);
        setReviewComment("");
        setShowSuccessModal(true);
      } else {
        const errData = await res.json();
        setReviewError(errData.error || "Error al enviar la valoración.");
      }
    } catch (error) {
      setReviewError("Error de red al conectar con el servidor.");
    }
  };

  // --- 4. ESTILOS AURA (SOLO CLASES Y COMPONENTES VISUALES) ---
  const getStatusBadge = (status) => {
    const base =
      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest";
    switch (status) {
      case "confirmed":
        return (
          <span className={`${base} bg-green-50 text-green-600`}>
            Confirmada
          </span>
        );
      case "pending":
        return (
          <span className={`${base} bg-orange-50 text-orange-600`}>
            Pendiente
          </span>
        );
      case "completed":
        return (
          <span className={`${base} bg-purple-50 text-aura-plum`}>
            Terminada
          </span>
        );
      case "cancelled":
        return (
          <span className={`${base} bg-red-50 text-red-500`}>Cancelada</span>
        );
      default:
        return (
          <span className={`${base} bg-gray-50 text-gray-500`}>{status}</span>
        );
    }
  };

  const inputStyles =
    "w-full bg-white/80 border border-purple-100 rounded-2xl px-6 py-4 text-aura-plum font-medium focus:ring-4 focus:ring-purple-100 outline-none transition-all";
  const labelStyles =
    "block text-[11px] font-black text-aura-plum/60 mb-2 uppercase tracking-widest ml-2";
  const pearlBtn =
    "flex items-center gap-2 bg-gradient-to-r from-purple-100 via-white to-fuchsia-100 border border-white/60 shadow-pearl text-aura-plum font-bold px-6 py-3 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all";

  if (loading)
    return (
      <div className="min-h-screen bg-aura-lavender flex flex-col justify-center items-center gap-4">
        <div className="w-12 h-12 border-4 border-aura-plum border-t-transparent rounded-full animate-spin"></div>
        <div className="animate-pulse text-aura-plum font-serif italic text-xl">
          Preparando tu espacio...
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
    <div className="bg-aura-lavender min-h-screen font-sans pb-20 relative overflow-hidden">
      {/* Círculos de luz Aura */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>

      {/* --- CABECERA --- */}
      <div className="bg-white/40 backdrop-blur-md border-b border-purple-100 pt-16 pb-10 px-4 relative z-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="relative w-32 h-32 bg-white rounded-full p-1 shadow-xl border border-white overflow-hidden group">
            {previewImage ? (
              <img
                src={previewImage}
                alt="Perfil"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-purple-50 text-aura-plum text-4xl font-serif">
                {user?.full_name?.charAt(0) || "U"}
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-serif text-aura-plum mb-2 tracking-tight">
              {user?.full_name || "Mi Área de Cliente"}
            </h1>
            <p className="text-gray-500 font-light italic mb-5">
              {user?.email}
            </p>

            {/* ETIQUETA VIP DE PUNTOS */}
            {user !== null && (
              <div className="inline-flex items-center gap-3 bg-white/60 border border-purple-100 px-5 py-2.5 rounded-2xl shadow-sm">
                <span
                  className="material-symbols-outlined text-aura-plum text-xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  stars
                </span>
                <span className="font-bold text-aura-plum">
                  {user.points || 0} Puntos Aura
                </span>
                <span className="text-[10px] text-purple-400 font-black uppercase bg-purple-50 px-2 py-1 rounded-lg border border-purple-100">
                  = {((user.points || 0) / 100).toFixed(2)} €
                </span>
              </div>
            )}
          </div>

          <button onClick={() => setShowSettings(true)} className={pearlBtn}>
            <span className="material-symbols-outlined text-lg">edit</span>
            Editar Perfil
          </button>
        </div>
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="max-w-5xl mx-auto px-4 mt-12 relative z-10">
        <div className="bg-white/60 backdrop-blur-xl rounded-[3rem] shadow-sm border border-white p-8">
          <div className="flex justify-center gap-4 mb-10 border-b border-purple-50 pb-8">
            <button
              onClick={() => setActiveTab("proximas")}
              className={`px-8 py-3 rounded-2xl font-bold transition-all ${
                activeTab === "proximas"
                  ? "bg-aura-plum text-white shadow-lg"
                  : "bg-white/40 text-aura-plum hover:bg-white/80"
              }`}
            >
              Próximas Citas ({proximas.length})
            </button>
            <button
              onClick={() => setActiveTab("historial")}
              className={`px-8 py-3 rounded-2xl font-bold transition-all ${
                activeTab === "historial"
                  ? "bg-aura-plum text-white shadow-lg"
                  : "bg-white/40 text-aura-plum hover:bg-white/80"
              }`}
            >
              Historial ({historial.length})
            </button>
          </div>

          <div className="space-y-4">
            {displayBookings.length === 0 ? (
              <div className="text-center py-20 bg-white/30 rounded-[2.5rem] border border-dashed border-purple-200">
                <p className="text-aura-plum font-serif italic text-xl">
                  {activeTab === "proximas"
                    ? "Aún no tienes ninguna reserva próxima."
                    : "No tienes citas pasadas o canceladas."}
                </p>
                {activeTab === "proximas" && (
                  <Link
                    to="/salones"
                    className="inline-block mt-6 text-xs font-black uppercase tracking-widest text-aura-plum border-b-2 border-purple-200 hover:border-aura-plum transition-colors"
                  >
                    Explorar Salones
                  </Link>
                )}
              </div>
            ) : (
              displayBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white/80 p-6 rounded-[2.5rem] border border-purple-50 flex flex-col md:flex-row items-center justify-between hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="bg-purple-50 rounded-2xl p-4 text-center min-w-[90px]">
                      <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">
                        {new Date(booking.booking_date).toLocaleDateString(
                          "es-ES",
                          { month: "short" },
                        )}
                      </p>
                      <p className="text-3xl font-serif text-aura-plum leading-none mt-1">
                        {new Date(booking.booking_date).getDate()}
                      </p>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h4 className="font-serif text-xl text-aura-plum">
                          {booking.professional_name || "Salón de Belleza"}
                        </h4>
                        {getStatusBadge(booking.status)}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                          <span className="material-symbols-outlined text-[16px]">
                            schedule
                          </span>
                          {booking.start_time?.substring(0, 5)} h
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-aura-plum font-bold">
                          <span className="material-symbols-outlined text-[16px]">
                            payments
                          </span>
                          {parseFloat(booking.total_price || 0)
                            .toFixed(2)
                            .replace(".", ",")}{" "}
                          €
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 md:mt-0 w-full md:w-auto opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    {activeTab === "proximas" && (
                      <>
                        <button
                          onClick={() => setRescheduleBooking(booking)}
                          className="flex-1 md:flex-none px-5 py-2.5 bg-white border border-purple-100 text-aura-plum text-xs font-black uppercase rounded-xl hover:bg-purple-50 transition-colors"
                        >
                          Cambiar
                        </button>
                        <button
                          onClick={() => setCancelId(booking.id)}
                          className="flex-1 md:flex-none px-5 py-2.5 bg-red-50/50 border border-red-100 text-red-500 text-xs font-black uppercase rounded-xl hover:bg-red-50 transition-colors"
                        >
                          Cancelar
                        </button>
                      </>
                    )}

                    {activeTab === "historial" &&
                      booking.status === "completed" && (
                        <div className="w-full md:w-auto">
                          {booking.reviews && booking.reviews.length > 0 ? (
                            <div className="flex items-center justify-center gap-1.5 bg-purple-50 text-aura-plum px-5 py-2.5 rounded-xl text-xs font-bold border border-purple-100">
                              <span className="material-symbols-outlined text-[16px] filled">
                                star
                              </span>
                              Valorada ({booking.reviews[0].rating}/5)
                            </div>
                          ) : (
                            <button
                              onClick={() => setReviewBooking(booking)}
                              className="w-full md:w-auto px-5 py-2.5 bg-aura-plum text-white text-xs font-black uppercase rounded-xl shadow-md hover:scale-105 transition-transform"
                            >
                              Valorar visita
                            </button>
                          )}
                        </div>
                      )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* --- MODALES --- */}

      {/* 1. Modal Ajustes */}
      {showSettings && (
        <div className="fixed inset-0 bg-aura-plum/20 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white/90 backdrop-blur-md rounded-[3rem] shadow-2xl w-full max-w-md p-10 border border-white max-h-[90vh] flex flex-col">
            <h3 className="text-2xl font-serif text-aura-plum mb-8 flex justify-between items-center shrink-0">
              Editar Perfil
              <button
                onClick={() => setShowSettings(false)}
                className="material-symbols-outlined text-gray-400 hover:text-red-400 transition-colors"
              >
                close
              </button>
            </h3>
            <div className="overflow-y-auto custom-scrollbar pr-2 flex-1">
              <form onSubmit={handleSaveSettings} className="space-y-5">
                {errorMsg && (
                  <div className="bg-red-50 text-red-500 p-3 rounded-xl text-xs font-bold">
                    {errorMsg}
                  </div>
                )}

                <div className="flex flex-col items-center mb-6">
                  <div className="relative size-28 rounded-full bg-purple-50 border-2 border-dashed border-purple-200 flex items-center justify-center overflow-hidden group cursor-pointer hover:border-aura-plum transition-colors">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-purple-200 text-5xl">
                        person
                      </span>
                    )}
                    <div className="absolute inset-0 bg-aura-plum/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-white mb-1">
                        photo_camera
                      </span>
                      <span className="text-white text-[10px] font-bold uppercase tracking-widest">
                        Cambiar
                      </span>
                    </div>
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer z-20"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelStyles}>Nombre Completo</label>
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, full_name: e.target.value })
                    }
                    className={inputStyles}
                  />
                </div>
                <div>
                  <label className={labelStyles}>Correo Electrónico</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    className={inputStyles}
                  />
                </div>
                <div>
                  <label className={labelStyles}>Teléfono</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                    className={inputStyles}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-aura-plum text-white py-4 rounded-2xl font-bold mt-4 shadow-lg hover:scale-[1.02] transition-all"
                >
                  Guardar Cambios
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal Éxito */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-aura-plum/20 backdrop-blur-sm z-[1001] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-10 text-center max-w-xs shadow-2xl border border-white animate-in zoom-in-95 duration-300">
            <span className="material-symbols-outlined text-6xl text-green-400 mb-6">
              check_circle
            </span>
            <h3 className="text-xl font-serif text-aura-plum mb-8">
              ¡Operación realizada con éxito!
            </h3>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-aura-plum text-white py-3 rounded-2xl font-bold"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* 3. Modal Reprogramar */}
      {rescheduleBooking && (
        <div className="fixed inset-0 bg-aura-plum/20 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white/90 backdrop-blur-md rounded-[3rem] shadow-2xl w-full max-w-sm p-10 border border-white">
            <h3 className="text-xl font-serif text-aura-plum mb-6">
              Reprogramar Cita
            </h3>
            <form onSubmit={handleReschedule} className="space-y-4">
              <div>
                <label className={labelStyles}>Nueva Fecha</label>
                <input
                  type="date"
                  required
                  value={newDateTime.date}
                  onChange={(e) =>
                    setNewDateTime({ ...newDateTime, date: e.target.value })
                  }
                  className={inputStyles}
                />
              </div>
              <div>
                <label className={labelStyles}>Nueva Hora</label>
                <input
                  type="time"
                  required
                  value={newDateTime.time}
                  onChange={(e) =>
                    setNewDateTime({ ...newDateTime, time: e.target.value })
                  }
                  className={inputStyles}
                />
              </div>
              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setRescheduleBooking(null)}
                  className="flex-1 py-3 bg-white border border-purple-100 text-aura-plum rounded-xl font-bold"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-aura-plum text-white rounded-xl font-bold"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal Cancelar */}
      {cancelId && (
        <div className="fixed inset-0 bg-aura-plum/10 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-10 text-center max-w-sm shadow-xl border border-white">
            <h3 className="text-2xl font-serif text-aura-plum mb-4">
              ¿Cancelar Cita?
            </h3>
            <p className="text-gray-400 text-sm mb-8 italic">
              Esta acción no se puede deshacer. Perderás la reserva de tu hora.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleCancelBooking}
                className="w-full py-3.5 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition-colors"
              >
                Confirmar Cancelación
              </button>
              <button
                onClick={() => setCancelId(null)}
                className="w-full py-3.5 bg-white text-gray-500 font-bold rounded-2xl border border-gray-100 hover:bg-gray-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal Reseña */}
      {reviewBooking && (
        <div className="fixed inset-0 bg-aura-plum/20 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white/90 backdrop-blur-md rounded-[3rem] shadow-2xl w-full max-w-md p-10 border border-white text-center">
            <h3 className="text-2xl font-serif text-aura-plum mb-6">
              Valorar visita
            </h3>
            <p className="text-gray-500 text-sm mb-6 font-light">
              ¿Qué tal fue tu experiencia en{" "}
              <strong>{reviewBooking.professional_name}</strong>?
            </p>
            <form onSubmit={handleSubmitReview}>
              <div className="flex justify-center gap-2 mb-8">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none hover:scale-110 transition-transform"
                  >
                    <span
                      className={`material-symbols-outlined text-5xl ${rating >= star ? "text-yellow-400" : "text-gray-100"}`}
                      style={{
                        fontVariationSettings:
                          rating >= star ? "'FILL' 1" : "'FILL' 0",
                      }}
                    >
                      star
                    </span>
                  </button>
                ))}
              </div>
              <textarea
                rows="3"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="¿Qué tal fue tu experiencia?"
                className={`${inputStyles} resize-none mb-4`}
              />
              {reviewError && (
                <div className="text-red-500 text-xs font-bold mb-4">
                  {reviewError}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setReviewBooking(null);
                    setRating(5);
                    setReviewComment("");
                    setReviewError("");
                  }}
                  className="flex-1 py-4 bg-white text-gray-500 rounded-2xl font-bold border border-purple-50"
                >
                  Ahora no
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-aura-plum text-white rounded-2xl font-bold"
                >
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
