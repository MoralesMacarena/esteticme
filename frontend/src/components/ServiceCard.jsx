import { Link } from "react-router-dom";

export default function ServiceCard({ tratamiento, image }) {
  // 1. Creamos un "mini-salón" con los datos que nos han llegado de la API de tratamientos
  // para que la pantalla de SalonDetail no se rompa al buscar location.state.salon
  const miniSalonInfo = {
    id: tratamiento.salon_id,
    business_name: tratamiento.salon_name,
    business_address: tratamiento.salon_address,
  };

  return (
    <Link
      to={`/salones/${tratamiento.salon_id}`}
      state={{ salon: miniSalonInfo }} // <-- 2. ¡Le pasamos el paquete de datos!
      className="flex flex-col rounded-lg shadow-md bg-white overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 duration-300 border border-gray-100 group"
    >
      <div
        className="w-full bg-center bg-no-repeat aspect-video bg-cover"
        style={{ backgroundImage: `url("${image}")` }}
      ></div>

      <div className="flex w-full grow flex-col gap-2 p-4">
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">
          {tratamiento.category_name || "Servicio"} desde{" "}
          {parseFloat(tratamiento.price).toFixed(2).replace(".", ",")}€
        </p>
        <p className="text-[#181411] text-lg font-bold group-hover:text-[#f48c25] transition-colors">
          {tratamiento.name}
        </p>

        <div className="flex items-center gap-1 text-gray-600 text-sm mt-1">
          <span className="material-symbols-outlined text-gray-400 text-[18px]">
            storefront
          </span>
          <span className="font-bold">{tratamiento.salon_name}</span>
        </div>

        <p className="text-gray-500 text-sm truncate flex items-center gap-1 mt-1">
          <span className="material-symbols-outlined text-[16px]">
            location_on
          </span>
          {tratamiento.salon_address}
        </p>

        <div className="mt-auto pt-4">
          {/* 3. Cambiamos <button> por <div> para que el HTML sea 100% válido */}
          <div className="w-full text-center rounded-lg py-2 px-4 bg-[#f48c25] text-white text-sm font-bold group-hover:bg-orange-600 transition-colors">
            Ver en el Salón
          </div>
        </div>
      </div>
    </Link>
  );
}
