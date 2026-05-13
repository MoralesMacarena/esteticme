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

  // --- VARIABLES DE ESTILOS PREMIUM ---
  const cardStyles =
    "bg-white rounded-3xl p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(200,160,255,0.15)] transition-all duration-500 group border border-purple-50/50";
  const imageContainer = "relative h-56 rounded-2xl overflow-hidden mb-5";
  const badgeStyles =
    "absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1 text-xs font-semibold text-aura-plum shadow-sm";
  const titleStyles = "text-2xl font-serif text-aura-plum px-2 mb-1.5";
  const locationStyles =
    "text-gray-500 text-sm flex items-center gap-1 px-2 mb-6 font-light";
  const pearlButtonStyles =
    "w-full block py-3 bg-gradient-to-r from-purple-100 via-white to-fuchsia-100 border border-white/60 shadow-pearl group-hover:shadow-pearl-hover text-aura-plum font-semibold rounded-full text-center transition-all duration-300";

  return (
    <Link
      to={`/salones/${salon.id}`}
      state={{ salon: salon }}
      className="block"
    >
      <div className={cardStyles}>
        {/* Imagen del Salón con Badge de Puntuación */}
        <div className={imageContainer}>
          <img
            src={imageUrl}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            alt={salon.business_name}
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800";
            }}
          />
          <div className={badgeStyles}>
            <span
              className="material-symbols-outlined text-yellow-500 text-[16px] filled"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
            {salon.average_rating
              ? Number(salon.average_rating).toFixed(1)
              : "Nuevo"}
          </div>
        </div>

        {/* Información del Salón */}
        <h3 className={titleStyles}>
          {salon.business_name || "Salón sin nombre"}
        </h3>

        <p className={locationStyles}>
          <span className="material-symbols-outlined text-[18px] opacity-70">
            location_on
          </span>
          <span className="truncate">
            {salon.business_address || "Dirección no disponible"}
          </span>
        </p>

        {/* Botón Perla Integrado */}
        <div className={pearlButtonStyles}>Ver detalles</div>
      </div>
    </Link>
  );
}
