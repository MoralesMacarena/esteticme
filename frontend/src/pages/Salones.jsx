import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SalonCard from "../components/SalonCard";

export default function Salones() {
  const [salones, setSalones] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [localSearch, setLocalSearch] = useState("");
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState("grid");

  const BACKEND_URL = "http://127.0.0.1:8000"; // <-- Nuestra ruta salvadora

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get("search") || "";
    const urlLocation = params.get("location") || "";

    if (urlLocation) setLocalSearch(urlLocation);

    setLoading(true);
    fetch(`${BACKEND_URL}/api/users/salones/?search=${search}`)
      .then((res) => res.json())
      .then((data) => {
        // ¡LA MAGIA AQUÍ! Arreglamos las fotos antes de guardarlas en el estado
        const formattedSalones = data.map((salon) => {
          let pictureUrl = salon.salon_picture;
          // Si tiene foto y no empieza por "http", se lo ponemos
          if (pictureUrl && !pictureUrl.startsWith("http")) {
            pictureUrl = `${BACKEND_URL}${pictureUrl}`;
          }
          return {
            ...salon,
            salon_picture: pictureUrl,
          };
        });

        setSalones(formattedSalones);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando salones:", err);
        setLoading(false);
      });
  }, [location.search]);

  const handleLocalSearch = (e) => {
    if (e.key === "Enter") {
      navigate(`/salones?search=${localSearch}`);
    }
  };

  return (
    <div className="bg-gray-50 flex flex-col min-h-screen font-sans">
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

            <button
              onClick={() => setViewMode(viewMode === "grid" ? "map" : "grid")}
              className="flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-[#f48c25]/10 text-[#f48c25] font-bold hover:bg-[#f48c25]/20 transition-colors border border-[#f48c25]/20 whitespace-nowrap w-full sm:w-auto"
            >
              <span className="material-symbols-outlined">
                {viewMode === "grid" ? "map" : "grid_view"}
              </span>
              <span>{viewMode === "grid" ? "Ver en Mapa" : "Ver Lista"}</span>
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
          <>
            {viewMode === "map" ? (
              <div className="w-full h-[600px] rounded-xl overflow-hidden shadow-md border border-gray-200">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(localSearch || "Madrid, España")}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                ></iframe>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {salones.length > 0 ? (
                  salones.map((salon) => (
                    <SalonCard key={salon.id} salon={salon} />
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
          </>
        )}
      </main>
    </div>
  );
}
