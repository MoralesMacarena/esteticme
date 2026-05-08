import { useState, useEffect } from "react";
import ServiceCard from "../components/ServiceCard"; // <-- Importamos tu nuevo componente

export default function Tratamientos() {
  const [tratamientos, setTratamientos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = "http://127.0.0.1:8000";

  // Imágenes de stock preciosas para ir rotando en las tarjetas
  const stockImages = [
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1585747685350-31c216327617?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1629909615184-74f495363b67?q=80&w=1000&auto=format&fit=crop",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resTratamientos, resCategorias] = await Promise.all([
          fetch(`${BACKEND_URL}/api/bookings/tratamientos/`),
          fetch(`${BACKEND_URL}/api/bookings/categorias/`),
        ]);

        if (resTratamientos.ok) {
          const dataTratamientos = await resTratamientos.json();
          setTratamientos(
            Array.isArray(dataTratamientos)
              ? dataTratamientos
              : dataTratamientos.results || [],
          );
        }

        if (resCategorias.ok) {
          const dataCategorias = await resCategorias.json();
          setCategorias(
            Array.isArray(dataCategorias)
              ? dataCategorias
              : dataCategorias.results || [],
          );
        }
      } catch (error) {
        console.error("Error cargando los datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Lógica de filtrado SOLO por pestaña (categoría)
  const filteredTratamientos = tratamientos.filter((t) => {
    return (
      selectedCategory === "Todos" ||
      (t.category_name &&
        t.category_name.toLowerCase() === selectedCategory.toLowerCase())
    );
  });

  return (
    <div className="bg-gray-50 font-display flex flex-col min-h-screen">
      {/* SECCIÓN DE FILTROS (Solo el menú dinámico) */}
      <div className="bg-white border-b border-gray-100 shadow-sm pt-4 pb-2">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Menú de Categorías Dinámico */}
          <nav className="flex items-center justify-center gap-8 overflow-x-auto no-scrollbar py-3">
            <button
              onClick={() => setSelectedCategory("Todos")}
              className={`whitespace-nowrap text-sm px-1 pb-1 transition-colors ${
                selectedCategory === "Todos"
                  ? "font-bold text-[#f48c25] border-b-2 border-[#f48c25]"
                  : "font-medium text-gray-600 hover:text-[#f48c25]"
              }`}
            >
              Todos
            </button>

            {categorias.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`whitespace-nowrap text-sm px-1 pb-1 transition-colors ${
                  selectedCategory === cat.name
                    ? "font-bold text-[#f48c25] border-b-2 border-[#f48c25]"
                    : "font-medium text-gray-600 hover:text-[#f48c25]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-grow">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-[#181411] text-3xl font-bold tracking-tight text-center pb-8 pt-4">
            {selectedCategory === "Todos"
              ? "Los mejores tratamientos cerca de ti"
              : `Los mejores servicios de ${selectedCategory}`}
          </h1>

          {loading ? (
            <div className="text-center py-12 text-[#f48c25] font-bold">
              Cargando tratamientos...
            </div>
          ) : filteredTratamientos.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No hemos encontrado tratamientos que coincidan con tu filtro.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {/* MAPEAMOS USANDO TU NUEVO COMPONENTE */}
              {filteredTratamientos.map((t, index) => (
                <ServiceCard
                  key={t.id}
                  tratamiento={t}
                  image={stockImages[index % stockImages.length]}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
