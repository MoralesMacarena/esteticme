import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function SalonDetail() {
  const [salon, setSalon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);

  // NUEVO: Estados para controlar la interfaz
  const [activeTab, setActiveTab] = useState("servicios"); // 'servicios', 'reseñas', 'sobre-nosotros'
  const [showGallery, setShowGallery] = useState(false); // Controla si se ve la galería a pantalla completa

  const navigate = useNavigate();

  const handleCheckout = () => {
    // Empaquetamos todos los datos de la reserva
    const checkoutData = {
      salon: salon,
      cart: cart,
      totalPrice: totalPrice,
      totalDuration: totalDuration,
    };

    // Comprobamos si el usuario está logueado (mirando si hay un token guardado)
    const isAuthenticated = localStorage.getItem("access_token") !== null;

    if (isAuthenticated) {
      // Si está logueado, va directo al checkout a pagar
      navigate("/checkout", { state: checkoutData });
    } else {
      // Si NO está logueado, lo mandamos al Login, pero le decimos:
      // "Oye, cuando termines, devuélvelo al /checkout con estos datos"
      navigate("/login", {
        state: {
          returnTo: "/checkout",
          savedData: checkoutData,
        },
      });
    }
  };

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/users/salones/")
      .then((response) => {
        if (!response.ok) throw new Error("Error de red");
        return response.json();
      })
      .then((data) => {
        if (data.length > 0) {
          setSalon(data[0]);
        } else {
          setError("No hay salones disponibles");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Error al cargar la información del salón.");
        setLoading(false);
      });
  }, []);

  const handleAddToCart = (service) => {
    const isAlreadyInCart = cart.some((item) => item.id === service.id);
    if (!isAlreadyInCart) {
      setCart([...cart, service]);
    }
  };

  const handleRemoveFromCart = (serviceId) => {
    setCart(cart.filter((item) => item.id !== serviceId));
  };

  if (loading) {
    return (
      <main className="flex-grow flex items-center justify-center bg-gray-50 min-h-screen">
        <div className="text-xl font-bold text-gray-500 animate-pulse">
          Cargando salón...
        </div>
      </main>
    );
  }

  if (error || !salon) {
    return (
      <main className="flex-grow flex items-center justify-center bg-gray-50 min-h-screen">
        <div className="text-xl font-bold text-red-500">{error}</div>
      </main>
    );
  }

  const groupedServices = salon.services.reduce((acc, service) => {
    if (!acc[service.category_name]) acc[service.category_name] = [];
    acc[service.category_name].push(service);
    return acc;
  }, {});

  const defaultImages = [
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?q=80&w=600",
    "https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=600",
    "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?q=80&w=600",
    "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?q=80&w=600",
  ];

  const displayImages =
    salon.gallery_images.length > 0
      ? salon.gallery_images.map((img) => `http://127.0.0.1:8000${img.image}`)
      : defaultImages;

  const totalPrice = cart.reduce(
    (sum, item) => sum + parseFloat(item.price),
    0,
  );
  const totalDuration = cart.reduce(
    (sum, item) => sum + item.duration_minutes,
    0,
  );

  return (
    <>
      <main className="flex-grow bg-gray-50">
        {/* --- CABECERA --- */}
        <div className="bg-white pb-6 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[350px] rounded-xl overflow-hidden">
              <div className="col-span-2 row-span-2 relative group">
                <img
                  src={displayImages[0] || defaultImages[0]}
                  className="w-full h-full object-cover"
                  alt="Principal"
                />
              </div>
              <div className="col-span-1 row-span-1">
                <img
                  src={displayImages[1] || defaultImages[1]}
                  className="w-full h-full object-cover"
                  alt="Interior 1"
                />
              </div>
              <div className="col-span-1 row-span-1">
                <img
                  src={displayImages[2] || defaultImages[2]}
                  className="w-full h-full object-cover"
                  alt="Interior 2"
                />
              </div>
              <div className="col-span-1 row-span-1">
                <img
                  src={displayImages[3] || defaultImages[3]}
                  className="w-full h-full object-cover"
                  alt="Detalle"
                />
              </div>
              {/* NUEVO: Al hacer clic aquí, mostramos el modal de la galería */}
              <div
                className="col-span-1 row-span-1 relative cursor-pointer group"
                onClick={() => setShowGallery(true)}
              >
                <img
                  src={displayImages[4] || defaultImages[4]}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                  alt="Más fotos"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-bold text-sm hover:bg-black/40 transition-colors">
                  Ver todas ({displayImages.length})
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-black text-[#181411] mb-2">
                {salon.business_name}
              </h1>
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
          {/* --- COLUMNA IZQUIERDA: PESTAÑAS Y CONTENIDO --- */}
          <div className="flex-1">
            {/* NUEVO: Menú de pestañas funcional */}
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

            {/* CONTENIDO DE LA PESTAÑA: SERVICIOS */}
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

            {/* CONTENIDO DE LA PESTAÑA: RESEÑAS */}
            {activeTab === "reseñas" && (
              <div className="bg-white p-8 rounded-xl border border-gray-100 text-center">
                <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">
                  star_half
                </span>
                <h3 className="text-lg font-bold text-[#181411]">
                  Aún no hay reseñas
                </h3>
                <p className="text-gray-500 text-sm mt-2">
                  Sé el primero en reservar y dejar tu opinión sobre este salón.
                </p>
              </div>
            )}

            {/* CONTENIDO DE LA PESTAÑA: SOBRE NOSOTROS */}
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

          {/* --- COLUMNA DERECHA: CARRITO --- */}
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
                onClick={handleCheckout} // <-- AQUÍ LA MAGIA
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

      {/* NUEVO: Modal de la Galería a Pantalla Completa */}
      {showGallery && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col p-4 sm:p-8 overflow-y-auto">
          {/* Botón de cerrar fijo arriba a la derecha */}
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

          {/* Cuadrícula con todas las fotos */}
          <div className="max-w-6xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
            {displayImages.map((img, idx) => (
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
