import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function SalonDetail() {
  const location = useLocation();
  const navigate = useNavigate();

  const [salon, setSalon] = useState(location.state?.salon || null);
  const [loading, setLoading] = useState(!location.state?.salon);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);

  // NUEVO ESTADO PARA LAS RESEÑAS
  const [reviews, setReviews] = useState([]);

  const [activeTab, setActiveTab] = useState("servicios");
  const [showGallery, setShowGallery] = useState(false);

  const BACKEND_URL = "http://127.0.0.1:8000";

  // Cargar Salón y sus Reseñas
  useEffect(() => {
    const fetchSalonData = async () => {
      let currentSalon = salon;

      // 1. Si no hay salón (entró por URL directa), lo buscamos
      if (!currentSalon) {
        try {
          const res = await fetch(`${BACKEND_URL}/api/users/profiles/`);
          const data = await res.json();
          if (data.length > 0) {
            currentSalon = data[0]; // (Sigue como emergencia para el primer salón)
            setSalon(currentSalon);
          } else {
            setError("No hay salones disponibles");
            setLoading(false);
            return;
          }
        } catch (err) {
          setError("Error al cargar la información del salón.");
          setLoading(false);
          return;
        }
      }

      // 2. NUEVO: Buscar las reseñas de ESTE salón
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
  }, [salon]);

  // --- CARRITO ---
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

  // --- UI CONDICIONALES ---
  if (loading)
    return (
      <main className="flex-grow flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl font-bold text-[#f48c25] animate-pulse">
          Cargando salón...
        </div>
      </main>
    );
  if (error || !salon)
    return (
      <main className="flex-grow flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl font-bold text-red-500">{error}</div>
      </main>
    );

  const groupedServices =
    salon.services?.reduce((acc, service) => {
      if (!acc[service.category_name]) acc[service.category_name] = [];
      acc[service.category_name].push(service);
      return acc;
    }, {}) || {};

  // --- ARREGLO DE IMÁGENES ---
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return imagePath.startsWith("http")
      ? imagePath
      : `${BACKEND_URL}${imagePath}`;
  };

  const realImages = [];
  if (salon.salon_picture)
    realImages.push(getFullImageUrl(salon.salon_picture));
  if (salon.gallery_images?.length > 0)
    salon.gallery_images.forEach((img) =>
      realImages.push(getFullImageUrl(img.image)),
    );

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

  // Calcula la nota media para mostrarla (opcional)
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
        ).toFixed(1)
      : 0;

  return (
    <>
      <main className="flex-grow bg-gray-50">
        {/* --- CABECERA FOTOS --- */}
        <div className="bg-white pb-6 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[350px] rounded-xl overflow-hidden">
              <div className="col-span-2 row-span-2 relative group">
                <img
                  src={headerImages[0]}
                  className="w-full h-full object-cover"
                  alt="Principal"
                />
              </div>
              <div className="col-span-1 row-span-1">
                <img
                  src={headerImages[1]}
                  className="w-full h-full object-cover"
                  alt="Interior 1"
                />
              </div>
              <div className="col-span-1 row-span-1">
                <img
                  src={headerImages[2]}
                  className="w-full h-full object-cover"
                  alt="Interior 2"
                />
              </div>
              <div className="col-span-1 row-span-1">
                <img
                  src={headerImages[3]}
                  className="w-full h-full object-cover"
                  alt="Detalle"
                />
              </div>
              <div
                className="col-span-1 row-span-1 relative cursor-pointer group"
                onClick={() => setShowGallery(true)}
              >
                <img
                  src={headerImages[4]}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                  alt="Más fotos"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-bold text-sm hover:bg-black/40">
                  Ver todas ({modalImages.length})
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-black text-[#181411]">
                  {salon.business_name}
                </h1>
                {/* Nota Media */}
                {reviews.length > 0 && (
                  <div className="flex items-center gap-1 bg-yellow-50 text-yellow-600 px-2 py-1 rounded-lg text-sm font-bold border border-yellow-100">
                    <span className="material-symbols-outlined text-[16px] filled">
                      star
                    </span>
                    {averageRating} ({reviews.length})
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <span className="material-symbols-outlined text-[18px]">
                    phone
                  </span>
                  {salon.phone}
                </div>
                <span className="text-gray-300">|</span>
                <div className="flex items-center gap-1 text-gray-600">
                  <span className="material-symbols-outlined text-[18px]">
                    location_on
                  </span>
                  {salon.business_address !== "-"
                    ? salon.business_address
                    : "Dirección no especificada"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8 relative">
          {/* --- COLUMNA IZQUIERDA --- */}
          <div className="flex-1">
            <div className="flex gap-8 border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab("servicios")}
                className={`pb-3 border-b-2 font-bold text-sm transition-colors ${activeTab === "servicios" ? "border-[#f48c25] text-[#f48c25]" : "border-transparent text-gray-500 hover:text-[#181411]"}`}
              >
                Servicios
              </button>
              <button
                onClick={() => setActiveTab("reseñas")}
                className={`pb-3 border-b-2 font-bold text-sm transition-colors ${activeTab === "reseñas" ? "border-[#f48c25] text-[#f48c25]" : "border-transparent text-gray-500 hover:text-[#181411]"}`}
              >
                Reseñas
              </button>
              <button
                onClick={() => setActiveTab("sobre-nosotros")}
                className={`pb-3 border-b-2 font-bold text-sm transition-colors ${activeTab === "sobre-nosotros" ? "border-[#f48c25] text-[#f48c25]" : "border-transparent text-gray-500 hover:text-[#181411]"}`}
              >
                Sobre Nosotros
              </button>
            </div>

            {/* PESTAÑA: SERVICIOS */}
            {activeTab === "servicios" &&
              Object.keys(groupedServices).map((category) => (
                <div key={category} className="mb-8">
                  <h2 className="text-xl font-bold text-[#181411] mb-4">
                    {category}
                  </h2>
                  <div className="flex flex-col gap-4">
                    {groupedServices[category].map((service) => {
                      const isInCart = cart.some(
                        (item) => item.id === service.id,
                      );
                      return (
                        <div
                          key={service.id}
                          className={`bg-white p-4 rounded-xl border shadow-sm transition-colors flex justify-between items-center group ${isInCart ? "border-[#f48c25]" : "border-gray-100 hover:border-gray-200"}`}
                        >
                          <div>
                            <h3 className="font-bold text-[#181411]">
                              {service.name}
                            </h3>
                            <p className="text-gray-500 text-xs mt-1">
                              {service.description}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">
                                  schedule
                                </span>
                                {service.duration_minutes} min
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="block font-bold text-[#181411] text-lg">
                                {parseFloat(service.price)
                                  .toFixed(2)
                                  .replace(".", ",")}{" "}
                                €
                              </span>
                            </div>
                            <button
                              onClick={() => handleAddToCart(service)}
                              disabled={isInCart}
                              className={`size-10 rounded-lg border flex items-center justify-center transition-all ${isInCart ? "bg-green-500 border-green-500 text-white cursor-not-allowed" : "border-gray-200 text-[#f48c25] hover:bg-[#f48c25] hover:text-white"}`}
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

            {/* PESTAÑA: RESEÑAS (¡AHORA SÍ!) */}
            {activeTab === "reseñas" && (
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="bg-white p-8 rounded-xl border border-gray-100 text-center">
                    <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">
                      star_half
                    </span>
                    <h3 className="text-lg font-bold text-[#181411]">
                      Aún no hay reseñas
                    </h3>
                    <p className="text-gray-500 text-sm mt-2">
                      Sé el primero en reservar y dejar tu opinión sobre este
                      salón.
                    </p>
                  </div>
                ) : (
                  reviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 uppercase">
                            {review.reviewer_name
                              ? review.reviewer_name.charAt(0)
                              : "C"}
                          </div>
                          <div>
                            <h4 className="font-bold text-[#181411] leading-none">
                              {review.reviewer_name}
                            </h4>
                            <span className="text-xs text-gray-400">
                              {new Date(review.created_at).toLocaleDateString(
                                "es-ES",
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="flex text-yellow-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`material-symbols-outlined text-[18px] ${review.rating >= star ? "filled" : "text-gray-200"}`}
                              style={{
                                fontVariationSettings:
                                  review.rating >= star
                                    ? "'FILL' 1"
                                    : "'FILL' 0",
                              }}
                            >
                              star
                            </span>
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-gray-600 text-sm mt-2 ml-13 pl-13">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* PESTAÑA: SOBRE NOSOTROS */}
            {activeTab === "sobre-nosotros" && (
              <div className="bg-white p-6 rounded-xl border border-gray-100">
                <h3 className="text-lg font-bold text-[#181411] mb-4">
                  Sobre {salon.business_name}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                  {salon.description && salon.description !== "-"
                    ? salon.description
                    : "Este salón aún no ha añadido una descripción a su perfil."}
                </p>
              </div>
            )}
          </div>

          {/* --- COLUMNA DERECHA: CARRITO (Se mantiene intacto) --- */}
          <div className="w-full lg:w-96">
            <div className="sticky top-24 bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="font-bold text-lg mb-4 border-b border-gray-100 pb-2 flex justify-between">
                Tu Reserva
                {cart.length > 0 && (
                  <span className="bg-[#f48c25] text-white text-xs px-2 py-1 rounded-full">
                    {cart.length}
                  </span>
                )}
              </h3>
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                  <span className="material-symbols-outlined text-4xl mb-2 text-gray-300">
                    shopping_bag
                  </span>
                  <p className="text-sm">
                    Selecciona servicios para añadirlos a tu reserva.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-4 mb-4 max-h-[300px] overflow-y-auto pr-2">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-start text-sm border-b border-gray-50 pb-3 last:border-0 last:pb-0"
                      >
                        <div className="flex-1 pr-2">
                          <p className="font-bold text-[#181411] leading-tight">
                            {item.name}
                          </p>
                          <p className="text-gray-500 text-xs mt-0.5">
                            {item.duration_minutes} min
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            {parseFloat(item.price)
                              .toFixed(2)
                              .replace(".", ",")}{" "}
                            €
                          </p>
                          <button
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="text-xs text-red-500 hover:text-red-700 hover:underline mt-1"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg mb-6">
                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                      <span>Duración total</span>
                      <span>{totalDuration} min</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-black text-[#181411] pt-2 border-t border-gray-200">
                      <span>Total a pagar</span>
                      <span>{totalPrice.toFixed(2).replace(".", ",")} €</span>
                    </div>
                  </div>
                </>
              )}
              <button
                disabled={cart.length === 0}
                onClick={handleCheckout}
                className={`flex items-center justify-center w-full h-12 font-bold rounded-lg transition-colors shadow-sm mb-3 ${cart.length === 0 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-[#f48c25] text-white hover:bg-orange-600"}`}
              >
                {cart.length === 0
                  ? "Selecciona un servicio"
                  : "Continuar a Fecha y Hora"}
              </button>
              <p className="text-xs text-center text-gray-400">
                No pagarás nada hasta que finalice la cita.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL GALERÍA */}
      {showGallery && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col p-4 sm:p-8 overflow-y-auto">
          <div className="flex justify-end sticky top-0 z-10 mb-4">
            <button
              onClick={() => setShowGallery(false)}
              className="text-gray-300 hover:text-[#f48c25] transition-colors p-2 bg-black/50 rounded-full"
            >
              <span className="material-symbols-outlined text-3xl block">
                close
              </span>
            </button>
          </div>
          <div className="max-w-6xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
            {modalImages.map((img, idx) => (
              <div
                key={idx}
                className="aspect-square rounded-xl overflow-hidden bg-gray-900 border border-gray-800"
              >
                <img
                  src={img}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
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
