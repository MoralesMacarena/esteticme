import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SalonCard from "../components/SalonCard";
import LatestBlogPosts from "../components/LatestBlogPosts";

export default function Home() {
  const navigate = useNavigate();

  const [salones, setSalones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationTerm, setLocationTerm] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image:
        "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=2070&auto=format&fit=crop",
      title: "Encuentra y reserva tu momento de belleza",
    },
    {
      image:
        "https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=1600&auto=format&fit=crop",
      title: "Los mejores profesionales a un clic",
    },
    {
      image:
        "https://images.unsplash.com/photo-1632345031435-8727f6897d53?q=80&w=1600&auto=format&fit=crop",
      title: "Luce espectacular, siéntete increíble",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/users/profiles/")
      .then((response) => response.json())
      .then((data) => {
        const profesionalesTop = data.filter(
          (user) => user.role === "professional" && (user.rating || 5.0) > 4.5,
        );
        setSalones(profesionalesTop);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error trayendo salones:", error);
        setLoading(false);
      });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim() || locationTerm.trim()) {
      const queryParams = new URLSearchParams();
      if (searchTerm.trim()) queryParams.append("search", searchTerm);
      if (locationTerm.trim()) queryParams.append("location", locationTerm);
      navigate(`/salones?${queryParams.toString()}`);
    }
  };

  // --- VARIABLES DE ESTILOS (Para mantener el JSX limpio) ---
  const pearlButtonStyles =
    "w-full sm:w-auto px-10 h-12 bg-gradient-to-r from-purple-100 via-white to-fuchsia-100 border border-white/60 shadow-pearl hover:shadow-pearl-hover text-aura-plum font-semibold rounded-full transition-all duration-300";
  const inputStyles =
    "w-full h-12 rounded-full border border-white/40 px-6 focus:ring-2 focus:ring-purple-300 outline-none bg-white/80 backdrop-blur-sm text-aura-text placeholder-gray-500 shadow-inner";
  const sectionTitleStyles =
    "text-aura-plum text-4xl sm:text-5xl font-serif mb-4 text-center tracking-wide";
  const sectionSubtitleStyles =
    "text-gray-500 text-center font-light tracking-wider uppercase text-sm mb-12";

  return (
    <>
      {/* HERO SECTION PREMIUM */}
      <div className="relative w-full h-[600px] flex items-center justify-center overflow-hidden bg-aura-plum">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transform scale-105"
              style={{ backgroundImage: `url("${slide.image}")` }}
            ></div>
            {/* Gradiente oscuro para que el texto blanco siempre se lea bien */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60"></div>
          </div>
        ))}

        <div className="relative z-10 w-full max-w-4xl px-4 flex flex-col items-center mt-10">
          <h1 className="text-white text-5xl sm:text-6xl font-serif mb-8 text-center drop-shadow-lg tracking-wide">
            {slides[currentSlide].title}
          </h1>

          {/* Buscador estilo Glassmorphism */}
          <form
            onSubmit={handleSearch}
            className="w-full max-w-3xl bg-white/20 backdrop-blur-md p-3 rounded-3xl sm:rounded-full border border-white/30 shadow-2xl flex flex-col sm:flex-row gap-3"
          >
            <input
              className={inputStyles}
              type="text"
              placeholder="¿Qué tratamiento buscas hoy?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <input
              className={inputStyles}
              type="text"
              placeholder="¿En qué ciudad?"
              value={locationTerm}
              onChange={(e) => setLocationTerm(e.target.value)}
            />
            <button type="submit" className={pearlButtonStyles}>
              Descubrir
            </button>
          </form>
        </div>

        {/* Indicadores del Slider elegantes */}
        <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                index === currentSlide
                  ? "bg-white w-10 shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                  : "bg-white/40 w-4 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>

      {/* SECCIÓN DE SALONES DESTACADOS */}
      <div className="w-full max-w-7xl mx-auto px-4 py-20">
        <div className="mb-12">
          <h2 className={sectionTitleStyles}>Premium Salones & Spas</h2>
          <p className={sectionSubtitleStyles}>
            Selección exclusiva de los mejor valorados
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-300"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {salones.map((salon) => (
              <SalonCard key={salon.id} salon={salon} />
            ))}
          </div>
        )}

        {!loading && salones.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-purple-200 shadow-sm">
            <p className="text-gray-500 font-serif italic text-lg">
              Explorando nuevos espacios de bienestar para ti...
            </p>
          </div>
        )}
      </div>

      {/* SECCIÓN DE BLOG */}
      <div className="bg-white/50 border-t border-purple-100">
        <LatestBlogPosts />
      </div>
    </>
  );
}
