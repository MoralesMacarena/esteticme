import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Salones() {
  const [salones, setSalones] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [localSearch, setLocalSearch] = useState("");
  const navigate = useNavigate(); // Asegúrate de importarlo de 'react-router-dom'

  useEffect(() => {
    // 1. Extraemos el término de búsqueda de la URL (?search=...)
    const params = new URLSearchParams(location.search);
    const search = params.get("search") || "";

    setLoading(true);
    // 2. Llamamos a Django pasando el filtro si existe
    fetch(`http://127.0.0.1:8000/api/users/salones/?search=${search}`)
      .then((res) => res.json())
      .then((data) => {
        setSalones(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando salones:", err);
        setLoading(false);
      });
  }, [location.search]); // Se refresca cada vez que la URL de búsqueda cambia

  const handleLocalSearch = (e) => {
    if (e.key === "Enter") {
      // Al dar a Enter, actualizamos la URL.
      // Esto disparará automáticamente el useEffect que ya tienes.
      navigate(`/salones?search=${localSearch}`);
    }
  };

  return (
    <div className="bg-gray-50 flex flex-col min-h-screen font-sans">
      {/* BARRA DE FILTROS LOCALES (CIUDAD/MAPA) */}
      <div className="border-b border-gray-200 bg-white py-4 shadow-sm">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1 w-full sm:max-w-xl">
              <div className="relative flex items-center w-full">
                <div className="absolute left-4 text-gray-400">
                  <span className="material-symbols-outlined">location_on</span>
                </div>
                <input
                  className="w-full h-12 rounded-lg border border-gray-300 bg-gray-50 pl-12 pr-4 text-base text-[#181411] focus:border-[#f48c25] focus:ring-2 focus:ring-[#f48c25]/50 outline-none transition-all"
                  placeholder="Introduce tu localidad..."
                  type="text"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  onKeyDown={handleLocalSearch}
                />
              </div>
            </div>

            <button className="flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-[#f48c25]/10 text-[#f48c25] font-bold hover:bg-[#f48c25]/20 transition-colors border border-[#f48c25]/20 whitespace-nowrap w-full sm:w-auto">
              <span className="material-symbols-outlined">map</span>
              <span>Ver en Mapa</span>
            </button>
          </div>
        </div>
      </div>

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-[#181411] text-3xl font-black leading-tight">
            {location.search
              ? "Resultados de tu búsqueda"
              : "Todos los salones"}
          </h1>
          <p className="text-gray-500 mt-2">
            Explora los mejores centros de belleza y bienestar cerca de ti.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f48c25]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {salones.length > 0 ? (
              salones.map((salon) => (
                <Link
                  key={salon.id}
                  to={`/salon/${salon.id}`}
                  className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col h-full group"
                >
                  <div className="relative h-48">
                    <img
                      className="w-full h-full object-cover"
                      src={
                        salon.profile_image ||
                        "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1000&auto=format&fit=crop"
                      }
                      alt={salon.business_name}
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-[#181411] mb-1 group-hover:text-[#f48c25] transition-colors">
                      {salon.business_name}
                    </h3>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      {salon.category_name || "Belleza y Estética"}
                    </p>

                    <div className="flex items-center gap-1 mb-4">
                      <span className="material-symbols-outlined text-yellow-500 text-[18px]">
                        star
                      </span>
                      <span className="font-bold text-[#181411]">4.9</span>
                      <span className="text-sm text-gray-400">
                        (124 reseñas)
                      </span>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <div className="flex items-start gap-2 text-sm text-gray-500">
                        <span className="material-symbols-outlined text-base mt-0.5 text-[#f48c25]">
                          location_on
                        </span>
                        <span className="line-clamp-2">
                          {salon.address || "Madrid, España"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">
                  No hemos encontrado salones con ese nombre.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
