import { useState, useEffect } from "react";
import ServiceCard from "../components/ServiceCard";

// 🔥 EL COMPONENTE MÁGICO DE ANIMACIÓN 🔥
function AnimatedCard({ children, index }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Cada tarjeta espera su turno (index * 100ms) antes de aparecer
    const timer = setTimeout(() => setIsVisible(true), index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      className={`transition-all duration-700 ease-out transform ${
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-16"
      }`}
    >
      {children}
    </div>
  );
}

export default function Tratamientos() {
  const [tratamientos, setTratamientos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = "http://127.0.0.1:8000";

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

  const filteredTratamientos = tratamientos.filter((t) => {
    return (
      selectedCategory === "Todos" ||
      (t.category_name &&
        t.category_name.toLowerCase() === selectedCategory.toLowerCase())
    );
  });

  // --- VARIABLES DE ESTILO ---
  const navBtnBase =
    "whitespace-nowrap text-xs uppercase tracking-[0.2em] px-4 py-2 rounded-full transition-all duration-300";
  const navBtnActive = "bg-aura-plum text-white shadow-lg font-bold scale-105";
  const navBtnInactive =
    "text-aura-plum/60 hover:text-aura-plum hover:bg-white/50 font-medium";

  return (
    <div className="bg-aura-lavender font-sans flex flex-col min-h-screen relative">
      {/* SECCIÓN DE NAVEGACIÓN DE CATEGORÍAS */}
      <div className="bg-white/40 backdrop-blur-md border-b border-purple-100 sticky top-20 z-40">
        <div className="mx-auto max-w-7xl px-4">
          <nav className="flex items-center justify-center gap-4 overflow-x-auto no-scrollbar py-6 relative z-50">
            <button
              onClick={() => setSelectedCategory("Todos")}
              className={`${navBtnBase} ${selectedCategory === "Todos" ? navBtnActive : navBtnInactive}`}
            >
              Todos
            </button>

            {categorias.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`${navBtnBase} ${selectedCategory === cat.name ? navBtnActive : navBtnInactive}`}
              >
                {cat.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-grow relative z-10">
        <div className="mx-auto max-w-7xl px-4 pt-32 pb-16 sm:px-6 lg:px-8 pointer-events-none">
          <header className="max-w-3xl mx-auto text-center mb-16 pointer-events-auto">
            <h1 className="text-aura-plum text-4xl md:text-5xl font-serif tracking-tight mb-4 transition-all duration-300">
              {selectedCategory === "Todos"
                ? "Experiencias de Bienestar"
                : `Especialistas en ${selectedCategory}`}
            </h1>
            <p className="text-gray-500 font-light italic">
              Seleccionamos los mejores rituales de belleza para tu cuidado
              personal.
            </p>
          </header>

          <div className="pointer-events-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-purple-100 border-t-aura-plum rounded-full animate-spin mb-4"></div>
                <p className="font-serif italic text-aura-plum">
                  Preparando tu experiencia...
                </p>
              </div>
            ) : filteredTratamientos.length === 0 ? (
              <div className="bg-white/50 backdrop-blur-sm rounded-[2rem] p-20 text-center border border-dashed border-purple-200">
                <span className="material-symbols-outlined text-5xl text-purple-200 mb-4">
                  search_off
                </span>
                <p className="text-aura-plum font-serif text-xl italic">
                  No hemos encontrado servicios en esta categoría actualmente.
                </p>
              </div>
            ) : (
              <div
                key={selectedCategory}
                className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-start overflow-hidden"
              >
                {filteredTratamientos.map((t, index) => (
                  <AnimatedCard key={t.id} index={index}>
                    <ServiceCard
                      tratamiento={t}
                      image={stockImages[t.id % stockImages.length]}
                    />
                  </AnimatedCard>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
