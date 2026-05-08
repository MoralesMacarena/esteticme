import { Link } from "react-router-dom";

export default function SalonCard({ salon }) {
  // 1. Definimos la URL base de tu servidor Django
  const backendUrl = "http://127.0.0.1:8000";

  // 2. Lógica inteligente para la imagen
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer">
        <div className="relative h-48 overflow-hidden">
          <img
            src={imageUrl}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            alt={salon.business_name}
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800";
            }}
          />
          {/* Badge de puntuación sobre la imagen preparado para la nota real */}
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg flex items-center gap-1 text-xs font-black text-[#181411] shadow-sm">
            <span
              className="material-symbols-outlined text-yellow-400 text-[16px] filled"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
            {salon.average_rating
              ? Number(salon.average_rating).toFixed(1)
              : "Nuevo"}
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-black text-xl mb-1.5 text-[#181411]">
            {salon.business_name || "Salón sin nombre"}
          </h3>
          <p className="text-gray-500 text-sm mb-4 flex items-center gap-1.5 font-medium">
            <span className="material-symbols-outlined text-[18px]">
              location_on
            </span>
            <span className="truncate">
              {salon.business_address || "Dirección no disponible"}
            </span>
          </p>

          {/* Línea divisoria y botón alineado a la derecha */}
          <div className="flex justify-end items-center mt-2 border-t border-gray-100 pt-4">
            <button className="text-sm font-black text-[#f48c25] group-hover:text-orange-600 transition-colors flex items-center gap-1">
              Ver servicios
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
