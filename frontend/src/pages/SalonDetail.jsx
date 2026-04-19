import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

export default function SalonDetail() {
  // 1. Extraemos el ID de la URL (ej: /salones/3 -> id = 3)
  const { id } = useParams();

  // 2. Estados para guardar los datos
  const [salon, setSalon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const backendUrl = "http://127.0.0.1:8000";

  // 3. Efecto para descargar los datos cuando carga la página
  useEffect(() => {
    const fetchSalonDetail = async () => {
      try {
        // Pedimos solo los datos de este usuario específico
        const response = await fetch(
          `http://127.0.0.1:8000/api/users/profiles/${id}/`,
        );
        if (!response.ok) throw new Error("No se pudo cargar el salón");
        const data = await response.json();
        setSalon(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSalonDetail();
  }, [id]);

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500">Cargando salón...</div>
    );
  if (error)
    return <div className="p-10 text-center text-red-500">Error: {error}</div>;
  if (!salon)
    return <div className="p-10 text-center">Salón no encontrado</div>;

  // Lógica de la imagen (igual que en SalonCard)
  const imageUrl = salon.salon_picture
    ? salon.salon_picture.startsWith("http")
      ? salon.salon_picture
      : `${backendUrl}${salon.salon_picture}`
    : "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200";

  const groupedServices = salon.services.reduce((acc, service) => {
    const cat = service.category_name || "Otros";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(service);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      {/* Botón de volver */}
      <Link
        to="/"
        className="inline-flex items-center text-gray-500 hover:text-[#181411] mb-6 font-medium transition-colors"
      >
        <span className="material-symbols-outlined mr-1 text-sm">
          arrow_back
        </span>
        Volver al inicio
      </Link>

      {/* Cabecera del Salón */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="h-64 md:h-80 w-full relative">
          <img
            src={imageUrl}
            alt={salon.business_name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-6 md:p-8">
          <h1 className="text-3xl font-bold text-[#181411] mb-2">
            {salon.business_name}
          </h1>
          <p className="text-gray-500 flex items-center gap-1 mb-4">
            <span className="material-symbols-outlined text-sm">
              location_on
            </span>
            {salon.business_address !== "-"
              ? salon.business_address
              : "Dirección pendiente de añadir"}
          </p>
          <p className="text-gray-700 leading-relaxed">
            {salon.description !== "-"
              ? salon.description
              : "Sin descripción disponible."}
          </p>
        </div>
      </div>

      {/* Lista de Servicios Categorizada */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-[#181411] mb-6">
          Nuestros Servicios
        </h2>

        {salon.services && salon.services.length > 0 ? (
          <div className="space-y-10">
            {" "}
            {/* Espaciado grande entre categorías */}
            {/* Recorremos las categorías generadas */}
            {Object.keys(groupedServices).map((category) => (
              <div key={category}>
                {/* Título de la categoría */}
                <h3 className="text-xl font-bold text-[#181411] border-b border-gray-200 pb-2 mb-4">
                  {category}
                </h3>

                {/* Grid de servicios para esta categoría en concreto */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupedServices[category].map((service) => (
                    <div
                      key={service.id}
                      className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start hover:shadow-md transition-shadow"
                    >
                      <div className="pr-4">
                        <h4 className="font-bold text-lg text-[#181411]">
                          {service.name}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {service.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">
                            schedule
                          </span>
                          {service.duration_minutes} min
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-lg text-[#181411]">
                          {service.price}€
                        </span>
                        <button className="mt-3 bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
                          Reservar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic bg-gray-50 p-6 rounded-lg border border-gray-100">
            Este profesional aún no ha añadido servicios a su catálogo.
          </p>
        )}
      </div>
    </div>
  );
}
