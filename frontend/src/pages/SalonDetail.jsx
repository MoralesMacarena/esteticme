import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";

export default function SalonDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [salon, setSalon] = useState(location.state?.salon || null);
  const [loading, setLoading] = useState(!location.state?.salon?.services);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState("servicios");
  const [showGallery, setShowGallery] = useState(false);

  const BACKEND_URL = "http://127.0.0.1:8000";

  // --- LÓGICA DE DATOS (INTACTA) ---
  useEffect(() => {
    const fetchSalonData = async () => {
      let currentSalon = salon;
      const targetId = id || currentSalon?.id;

      if (!currentSalon || !currentSalon.services) {
        try {
          const res = await fetch(
            `${BACKEND_URL}/api/users/profiles/${targetId}/`,
          );
          if (res.ok) {
            currentSalon = await res.json();
            setSalon(currentSalon);
          } else {
            const resList = await fetch(`${BACKEND_URL}/api/users/profiles/`);
            const dataList = await resList.json();
            const profiles = Array.isArray(dataList)
              ? dataList
              : dataList.results || [];
            const foundSalon = profiles.find(
              (s) => s.id === parseInt(targetId),
            );

            if (foundSalon) {
              currentSalon = foundSalon;
              setSalon(currentSalon);
            } else {
              setError("No se ha encontrado la información de este salón.");
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          setError("Error de conexión al cargar la información del salón.");
          setLoading(false);
          return;
        }
      }

      if (currentSalon && currentSalon.id) {
        try {
          const revRes = await fetch(
            `${BACKEND_URL}/api/bookings/reviews/?profesional=${currentSalon.id}`,
          );
          if (revRes.ok) {
            const revData = await revRes.json();
            setReviews(
              Array.isArray(revData) ? revData : revData.results || [],
            );
          }
        } catch (err) {
          console.error("Error cargando reseñas:", err);
        }
      }
      setLoading(false);
    };
    fetchSalonData();
  }, [id]);

  const handleCheckout = () => {
    const checkoutData = { salon, cart, totalPrice, totalDuration };
    const isAuthenticated = localStorage.getItem("access_token") !== null;
    if (isAuthenticated) {
      navigate("/checkout", { state: checkoutData });
    } else {
      navigate("/login", {
        state: { returnTo: "/checkout", savedData: checkoutData },
      });
    }
  };

  const handleAddToCart = (service) => {
    if (!cart.some((item) => item.id === service.id)) {
      setCart([...cart, service]);
    }
  };

  const handleRemoveFromCart = (serviceId) =>
    setCart(cart.filter((item) => item.id !== serviceId));

  // --- CÁLCULOS E IMÁGENES (INTACTOS) ---
  const groupedServices =
    salon?.services?.reduce((acc, service) => {
      if (!acc[service.category_name]) acc[service.category_name] = [];
      acc[service.category_name].push(service);
      return acc;
    }, {}) || {};

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return imagePath.startsWith("http")
      ? imagePath
      : `${BACKEND_URL}${imagePath}`;
  };

  const realImages = [];
  if (salon?.salon_picture)
    realImages.push(getFullImageUrl(salon.salon_picture));
  if (salon?.gallery_images?.length > 0) {
    salon.gallery_images.forEach((img) =>
      realImages.push(getFullImageUrl(img.image)),
    );
  }

  const defaultImages = [
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1000",
    "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?q=80&w=600",
    "https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=600",
    "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?q=80&w=600",
    "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?q=80&w=600",
  ];

  const headerImages = [
    realImages[0] || defaultImages[0],
    realImages[1] || defaultImages[1],
    realImages[2] || defaultImages[2],
    realImages[3] || defaultImages[3],
    realImages[4] || defaultImages[4],
  ];
  const modalImages = realImages.length > 0 ? realImages : defaultImages;

  const totalPrice = cart.reduce(
    (sum, item) => sum + parseFloat(item.price),
    0,
  );
  const totalDuration = cart.reduce(
    (sum, item) => sum + item.duration_minutes,
    0,
  );
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
        ).toFixed(1)
      : 0;

  // --- VARIABLES DE ESTILO AURA ---
  const pearlBtn =
    "bg-gradient-to-r from-purple-100 via-white to-fuchsia-100 border border-white/60 shadow-pearl text-aura-plum font-bold rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]";
  const tabBtnStyles = (active) =>
    `pb-3 font-black text-[11px] uppercase tracking-[0.2em] transition-all border-b-2 ${active ? "border-aura-plum text-aura-plum" : "border-transparent text-purple-300 hover:text-aura-plum"}`;

  if (loading)
    return (
      <main className="min-h-screen bg-aura-lavender flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-aura-plum border-t-transparent rounded-full animate-spin"></div>
          <p className="font-serif italic text-aura-plum text-lg animate-pulse">
            Cargando el salón...
          </p>
        </div>
      </main>
    );

  if (error || !salon)
    return (
      <main className="min-h-screen bg-aura-lavender flex items-center justify-center">
        <div className="bg-white/50 backdrop-blur-xl p-10 rounded-[3rem] border border-white text-center">
          <span className="material-symbols-outlined text-red-400 text-5xl mb-4">
            error
          </span>
          <p className="text-aura-plum font-bold">
            {error || "No se pudo cargar el salón."}
          </p>
        </div>
      </main>
    );

  return (
    <>
      <main className="flex-grow bg-aura-lavender min-h-screen relative overflow-hidden">
        {/* Decoración Fondo */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>

        {/* --- CABECERA FOTOS --- */}
        <div className="bg-white/40 backdrop-blur-md border-b border-purple-100 pt-6 pb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[400px] rounded-[3rem] overflow-hidden shadow-pearl border border-white">
              <div className="col-span-2 row-span-2 relative">
                <img
                  src={headerImages[0]}
                  className="w-full h-full object-cover"
                  alt="Principal"
                />
              </div>
              <img
                src={headerImages[1]}
                className="w-full h-full object-cover"
                alt="Interior 1"
              />
              <img
                src={headerImages[2]}
                className="w-full h-full object-cover"
                alt="Interior 2"
              />
              <img
                src={headerImages[3]}
                className="w-full h-full object-cover"
                alt="Detalle"
              />
              <div
                className="relative cursor-pointer group"
                onClick={() => setShowGallery(true)}
              >
                <img
                  src={headerImages[4]}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  alt="Más fotos"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-aura-plum/60 text-white font-bold text-xs uppercase tracking-widest backdrop-blur-[2px]">
                  + {modalImages.length - 4} fotos
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <h1 className="text-5xl font-serif text-aura-plum tracking-tight">
                    {salon.business_name}
                  </h1>
                  {reviews.length > 0 && (
                    <div className="flex items-center gap-1.5 bg-white/80 text-aura-plum px-3 py-1.5 rounded-2xl text-xs font-black border border-purple-100 shadow-sm">
                      <span className="material-symbols-outlined text-[16px] text-yellow-400 filled">
                        star
                      </span>
                      {averageRating}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <span className="flex items-center gap-2 text-aura-plum/70 font-medium">
                    <span className="material-symbols-outlined text-lg">
                      location_on
                    </span>
                    {salon.business_address !== "-"
                      ? salon.business_address
                      : "Fuengirola, España"}
                  </span>
                  <span className="flex items-center gap-2 text-aura-plum/70 font-medium">
                    <span className="material-symbols-outlined text-lg">
                      call
                    </span>
                    {salon.phone}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-12 relative z-10">
          {/* --- COLUMNA IZQUIERDA --- */}
          <div className="flex-1">
            <div className="flex gap-10 border-b border-purple-100 mb-10">
              <button
                onClick={() => setActiveTab("servicios")}
                className={tabBtnStyles(activeTab === "servicios")}
              >
                Servicios
              </button>
              <button
                onClick={() => setActiveTab("reseñas")}
                className={tabBtnStyles(activeTab === "reseñas")}
              >
                Reseñas
              </button>
              <button
                onClick={() => setActiveTab("sobre-nosotros")}
                className={tabBtnStyles(activeTab === "sobre-nosotros")}
              >
                El Salón
              </button>
            </div>

            {/* PESTAÑA: SERVICIOS */}
            {activeTab === "servicios" &&
              Object.keys(groupedServices).map((category) => (
                <div key={category} className="mb-12">
                  <h2 className="text-2xl font-serif text-aura-plum mb-6">
                    {category}
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                    {groupedServices[category].map((service) => {
                      const isInCart = cart.some(
                        (item) => item.id === service.id,
                      );
                      return (
                        <div
                          key={service.id}
                          className={`bg-white/60 backdrop-blur-sm p-6 rounded-[2rem] border transition-all flex justify-between items-center group ${isInCart ? "border-aura-plum shadow-lg" : "border-white hover:border-purple-100 hover:bg-white/80"}`}
                        >
                          <div className="flex-1">
                            <h3 className="font-bold text-aura-plum text-lg">
                              {service.name}
                            </h3>
                            <p className="text-gray-500 text-sm font-light mt-1 italic leading-relaxed max-w-md">
                              {service.description}
                            </p>
                            <div className="flex items-center gap-4 mt-3">
                              <span className="text-xs font-black text-purple-300 uppercase tracking-widest flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">
                                  schedule
                                </span>{" "}
                                {service.duration_minutes} min
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className="font-serif text-xl text-aura-plum">
                              {parseFloat(service.price).toFixed(2)}€
                            </span>
                            <button
                              onClick={() => handleAddToCart(service)}
                              disabled={isInCart}
                              className={`size-12 rounded-2xl flex items-center justify-center transition-all ${isInCart ? "bg-aura-plum text-white cursor-default" : "bg-white border border-purple-50 text-aura-plum shadow-sm hover:scale-110 active:scale-95"}`}
                            >
                              <span className="material-symbols-outlined">
                                {isInCart ? "check" : "add"}
                              </span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

            {/* PESTAÑA: RESEÑAS */}
            {activeTab === "reseñas" && (
              <div className="space-y-6">
                {reviews.length === 0 ? (
                  <div className="bg-white/40 border border-white rounded-[3rem] p-16 text-center">
                    <span className="material-symbols-outlined text-5xl text-purple-200 mb-4">
                      auto_awesome
                    </span>
                    <p className="text-aura-plum font-serif italic text-lg">
                      Este salón aún no tiene valoraciones.
                    </p>
                  </div>
                ) : (
                  reviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-white/60 p-8 rounded-[2.5rem] border border-white shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center font-serif text-aura-plum text-xl">
                            {review.reviewer_name?.charAt(0) || "C"}
                          </div>
                          <div>
                            <h4 className="font-bold text-aura-plum leading-none">
                              {review.reviewer_name}
                            </h4>
                            <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest">
                              {new Date(review.created_at).toLocaleDateString(
                                "es-ES",
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="flex text-yellow-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <span
                              key={s}
                              className="material-symbols-outlined text-lg"
                              style={{
                                fontVariationSettings:
                                  review.rating >= s ? "'FILL' 1" : "'FILL' 0",
                              }}
                            >
                              star
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 font-light italic leading-relaxed pl-16">
                        "{review.comment}"
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* PESTAÑA: SOBRE NOSOTROS */}
            {activeTab === "sobre-nosotros" && (
              <div className="bg-white/60 p-10 rounded-[3rem] border border-white">
                <h3 className="text-2xl font-serif text-aura-plum mb-6">
                  Nuestra Filosofía
                </h3>
                <p className="text-gray-600 font-light leading-relaxed italic whitespace-pre-line text-lg">
                  {salon.description && salon.description !== "-"
                    ? salon.description
                    : "Un espacio dedicado a tu bienestar y cuidado personal en el corazón de Fuengirola."}
                </p>
              </div>
            )}
          </div>

          {/* --- COLUMNA DERECHA: CARRITO --- */}
          <div className="w-full lg:w-96">
            <div className="sticky top-24 bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-pearl border border-white p-8">
              <h3 className="font-serif text-2xl text-aura-plum mb-8 flex justify-between items-center">
                Tu Reserva
                {cart.length > 0 && (
                  <span className="bg-aura-plum text-white text-[10px] px-3 py-1 rounded-full font-black uppercase">
                    {cart.length}
                  </span>
                )}
              </h3>

              {cart.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center opacity-40">
                  <span className="material-symbols-outlined text-5xl mb-4 text-aura-plum">
                    spa
                  </span>
                  <p className="text-xs font-bold uppercase tracking-widest text-aura-plum">
                    Añade un servicio
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-6 mb-8 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-start border-b border-purple-50 pb-4 last:border-0"
                      >
                        <div className="flex-1 pr-4">
                          <p className="font-bold text-aura-plum text-sm">
                            {item.name}
                          </p>
                          <p className="text-purple-300 text-[10px] font-black uppercase tracking-widest mt-1">
                            {item.duration_minutes} min
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-serif text-aura-plum">
                            {parseFloat(item.price).toFixed(2)}€
                          </p>
                          <button
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="text-[10px] font-black text-red-300 hover:text-red-500 uppercase tracking-tighter mt-1 transition-colors"
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-purple-50/50 p-6 rounded-3xl mb-8">
                    <div className="flex justify-between items-center text-lg font-black text-aura-plum">
                      <span className="text-xs uppercase tracking-[0.2em] opacity-60">
                        Total
                      </span>
                      <span>{totalPrice.toFixed(2)} €</span>
                    </div>
                  </div>
                </>
              )}

              <button
                disabled={cart.length === 0}
                onClick={handleCheckout}
                className={`${pearlBtn} w-full py-5 flex items-center justify-center gap-3 disabled:opacity-30 disabled:scale-100 disabled:grayscale`}
              >
                {cart.length === 0 ? "Escoge un servicio" : "Continuar Reserva"}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <p className="text-[10px] text-center text-purple-300 font-bold uppercase tracking-widest mt-6">
                Pago en el establecimiento
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL GALERÍA (ESTILO AURA) */}
      {showGallery && (
        <div className="fixed inset-0 z-[200] bg-aura-plum/95 backdrop-blur-xl flex flex-col p-8 overflow-y-auto">
          <div className="flex justify-end sticky top-0 z-10 mb-8">
            <button
              onClick={() => setShowGallery(false)}
              className="size-12 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="max-w-6xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {modalImages.map((img, idx) => (
              <div
                key={idx}
                className="aspect-square rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl"
              >
                <img
                  src={img}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-1000"
                  alt={`Galería ${idx + 1}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
