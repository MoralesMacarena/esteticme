import { Link } from "react-router-dom";
export default function SalonCard({ salon }) {
  // 1. Definimos la URL base de tu servidor Django
  const backendUrl = "http://127.0.0.1:8000";

  // 2. Lógica inteligente para la imagen:
  // - Si el salón tiene foto, comprobamos si ya trae la URL completa o necesita el prefijo del backend.
  // - Si no tiene foto, usamos una de stock elegante.
  const imageUrl = salon.salon_picture
    ? salon.salon_picture.startsWith("http")
      ? salon.salon_picture
      : `${backendUrl}${salon.salon_picture}`
    : "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800";

  return (
    <Link
      to={`/salones/${salon.id}`}
      state={{ salon: salon }}
      className="block"
    >
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
        <div className="relative h-48 overflow-hidden">
          <img
            src={imageUrl}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            alt={salon.business_name}
            // Manejo de error por si la imagen de Django falla al cargar
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800";
            }}
          />
          {/* Badge de puntuación sobre la imagen */}
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1 text-xs font-bold shadow-sm">
            <span className="material-symbols-outlined text-yellow-500 text-sm">
              star
            </span>
            {salon.rating || "5.0"}
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-bold text-lg mb-1 text-[#181411]">
            {salon.business_name || "Salón sin nombre"}
          </h3>
          <p className="text-gray-500 text-sm mb-3 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">
              location_on
            </span>
            {salon.business_address || "Dirección no disponible"}
          </p>

          <div className="flex justify-between items-center mt-4">
            <span className="text-xs text-primary font-bold uppercase tracking-wider">
              {salon.role === "professional" ? "Verificado" : ""}
            </span>
            <button className="text-sm font-bold text-[#181411] hover:text-primary transition-colors">
              Ver servicios →
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
