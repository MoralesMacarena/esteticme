import { Link } from "react-router-dom";

export default function ServiceCard({ tratamiento, image }) {
  // 1. Mantenemos tu lógica impecable para el "mini-salón"
  const miniSalonInfo = {
    id: tratamiento.salon_id,
    business_name: tratamiento.salon_name,
    business_address: tratamiento.salon_address,
  };

  // 🔥 NUEVO: Resolución inteligente de la imagen
  // Si el servicio tiene imagen propia, comprobamos si trae el dominio. Si no lo trae, se lo añadimos.
  // Si no tiene imagen propia, usamos la prop 'image' (por si pasas alguna random) o el fallback de Unsplash.
  const imageUrl = tratamiento.image
    ? tratamiento.image.startsWith("http")
      ? tratamiento.image
      : `http://127.0.0.1:8000${tratamiento.image}`
    : image ||
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800";

  // --- VARIABLES DE ESTILO AURA ---
  const cardStyles =
    "flex flex-col rounded-[2rem] overflow-hidden p-3 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_15px_35px_rgba(200,160,255,0.15)] transition-all duration-500 border border-purple-50/50 group";

  const imageStyles =
    "w-full aspect-video bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.03]";

  const categoryBadge =
    "text-[10px] font-bold uppercase tracking-[0.2em] text-purple-400 bg-purple-50 px-3 py-1 rounded-full border border-purple-100";
  const pearlButton =
    "w-full text-center rounded-full py-3 px-4 bg-gradient-to-r from-purple-100 via-white to-fuchsia-100 border border-white/60 shadow-pearl text-aura-plum text-sm font-bold transition-all group-hover:shadow-pearl-hover";

  return (
    <Link
      to={`/salones/${tratamiento.salon_id}`}
      state={{ salon: miniSalonInfo }}
      className={cardStyles}
    >
      {/* Contenedor de Imagen Blindado */}
      <div className="rounded-[1.25rem] overflow-hidden mb-4 relative">
        <div
          className={imageStyles}
          style={{
            // 🔥 Usamos nuestra nueva constante con la imagen resuelta
            backgroundImage: `url("${imageUrl}")`,
          }}
        />
      </div>

      <div className="flex w-full grow flex-col px-2 pb-2">
        {/* Categoría y Precio */}
        <div className="flex justify-between items-center mb-3">
          <span className={categoryBadge}>
            {tratamiento.category_name || "Servicio"}
          </span>
          <span className="text-aura-plum font-serif text-lg font-bold">
            {parseFloat(tratamiento.price).toFixed(2).replace(".", ",")}€
          </span>
        </div>

        {/* Nombre del Tratamiento */}
        <h3 className="text-aura-plum text-xl font-serif mb-4 leading-tight group-hover:text-purple-700 transition-colors">
          {tratamiento.name}
        </h3>

        {/* Información del Salón */}
        <div className="space-y-1.5 mb-6">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <span className="material-symbols-outlined text-[18px] opacity-70">
              storefront
            </span>
            <span className="font-semibold">{tratamiento.salon_name}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-400 text-[13px] font-light italic">
            <span className="material-symbols-outlined text-[16px]">
              location_on
            </span>
            <span className="truncate">{tratamiento.salon_address}</span>
          </div>
        </div>

        <div className="mt-auto">
          <div className={pearlButton}>Reservar en el Salón</div>
        </div>
      </div>
    </Link>
  );
}
