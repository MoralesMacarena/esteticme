import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SalonCard from "../components/SalonCard";

export default function Salones() {
  const [salones, setSalones] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const [localSearch, setLocalSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  const BACKEND_URL = "http://127.0.0.1:8000";

  // Función para normalizar y limpiar las URLs de las imágenes
  const formatImageUrl = useCallback(
    (url) => {
      if (url && !url.startsWith("http")) {
        return `${BACKEND_URL}${url}`;
      }
      return url;
    },
    [BACKEND_URL],
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get("search") || "";
    const urlLocation = params.get("location") || "";

    // Sincronizamos el estado local con la URL para que el input sea coherente
    setLocalSearch(urlLocation || search);

    setLoading(true);

    /**
     * ESTRATEGIA DE BÚSQUEDA PROFESIONAL:
     * Unificamos los criterios en una sola 'query' para maximizar resultados.
     * Si el backend espera 'search', le enviamos todo concatenado.
     */
    const combinedQuery = [search, urlLocation].filter(Boolean).join(" ");
    const fetchUrl = `${BACKEND_URL}/api/users/salones/?search=${encodeURIComponent(combinedQuery)}`;

    fetch(fetchUrl)
      .then((res) => res.json())
      .then((data) => {
        const formattedData = data.map((salon) => ({
          ...salon,
          salon_picture: formatImageUrl(salon.salon_picture),
        }));
        setSalones(formattedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error en el fetch de salones:", err);
        setLoading(false);
      });
  }, [location.search, formatImageUrl]);

  const handleLocalSearch = (e) => {
    if (e.key === "Enter") {
      // Al buscar localmente, reiniciamos la búsqueda para evitar conflictos de parámetros antiguos
      navigate(`/salones?search=${encodeURIComponent(localSearch)}`);
    }
  };

  // --- VARIABLES DE ESTILO ---
  const pageWrapper = "bg-aura-lavender flex flex-col min-h-screen font-sans";
  const headerStyles =
    "border-b border-purple-100 bg-white/80 backdrop-blur-md py-4 shadow-sm sticky top-0 z-20";
  const searchInputStyles =
    "w-full h-12 rounded-full border border-purple-100 bg-white pl-12 pr-4 text-base text-aura-text focus:border-purple-300 focus:ring-2 focus:ring-purple-200 outline-none transition-all shadow-inner";
  const toggleButtonStyles =
    "flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-white text-aura-plum font-semibold hover:shadow-md transition-all border border-purple-100 shadow-sm";

  return (
    <div className={pageWrapper}>
      <div className={headerStyles}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1 w-full sm:max-w-xl">
              <div className="relative flex items-center w-full text-purple-300">
                <span className="material-symbols-outlined absolute left-4">
                  location_on
                </span>
                <input
                  className={searchInputStyles}
                  placeholder="¿Dónde quieres ir hoy? (Ciudad o tratamiento)"
                  type="text"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  onKeyDown={handleLocalSearch}
                />
              </div>
            </div>
            <button
              onClick={() => setViewMode(viewMode === "grid" ? "map" : "grid")}
              className={toggleButtonStyles}
            >
              <span className="material-symbols-outlined">
                {viewMode === "grid" ? "map" : "grid_view"}
              </span>
              <span>{viewMode === "grid" ? "Ver en Mapa" : "Ver Lista"}</span>
            </button>
          </div>
        </div>
      </div>

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-10 text-center sm:text-left">
          <h1 className="text-aura-plum text-4xl font-serif leading-tight">
            {location.search
              ? "Tu búsqueda personalizada"
              : "Nuestra Selección de Espacios"}
          </h1>
          <p className="text-gray-500 mt-2 font-light">
            Explora el bienestar y la belleza cerca de ti.
          </p>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-64 italic text-purple-400 animate-pulse">
            Cargando experiencias...
          </div>
        ) : (
          <>
            {viewMode === "map" ? (
              <div className="w-full h-[600px] rounded-3xl overflow-hidden shadow-pearl border border-purple-50">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(localSearch || "España")}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                ></iframe>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {salones.length > 0 ? (
                  salones.map((salon) => (
                    <SalonCard key={salon.id} salon={salon} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-purple-200">
                    <p className="text-gray-500 font-serif italic text-lg">
                      No hay resultados para esta búsqueda, prueba con otro
                      término.
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
