import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SalonCard from "../components/SalonCard";

export default function Home() {
  const navigate = useNavigate();

  // Estados para los Salones Destacados
  const [salones, setSalones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para el Buscador
  const [searchTerm, setSearchTerm] = useState("");
  const [locationTerm, setLocationTerm] = useState("");

  // Estado para el Slider
  const [currentSlide, setCurrentSlide] = useState(0);

  // 1. Configuración de las diapositivas
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

  // 2. Efecto para que el Slider se mueva solo cada 5 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // 3. Efecto para traer los Salones Destacados
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/users/profiles/")
      .then((response) => response.json())
      .then((data) => {
        // FILTRO: Solo profesionales que tengan más de 4.5 estrellas
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

  // 4. Función para ejecutar la búsqueda desde la Home
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim() || locationTerm.trim()) {
      // Usamos URLSearchParams para crear una URL limpia (ej: /salones?search=corte&location=madrid)
      const queryParams = new URLSearchParams();
      if (searchTerm.trim()) queryParams.append("search", searchTerm);
      if (locationTerm.trim()) queryParams.append("location", locationTerm);

      navigate(`/salones?${queryParams.toString()}`);
    }
  };

  return (
    <>
      {/* HERO SECTION CON SLIDER Y BUSCADOR */}
      <div className="relative w-full h-[500px] flex items-center justify-center overflow-hidden">
        {/* Imágenes del Slider con transición de opacidad */}
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url("${slide.image}")` }}
            ></div>
            <div className="absolute inset-0 bg-black/40"></div>{" "}
            {/* Capa oscura más fuerte para que destaque el buscador */}
          </div>
        ))}

        <div className="relative z-10 w-full max-w-3xl px-4 text-center">
          <h1 className="text-white text-4xl sm:text-5xl font-black mb-6 drop-shadow-md transition-all duration-500">
            {slides[currentSlide].title}
          </h1>

          {/* BUSCADOR FUNCIONAL */}
          <form
            onSubmit={handleSearch}
            className="bg-white p-4 rounded-xl shadow-lg flex flex-col sm:flex-row gap-2"
          >
            <input
              className="w-full h-12 rounded-lg border border-gray-300 px-4 focus:ring-2 focus:ring-primary outline-none"
              type="text"
              placeholder="¿Qué tratamiento buscas?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <input
              className="w-full h-12 rounded-lg border border-gray-300 px-4 focus:ring-2 focus:ring-primary outline-none"
              type="text"
              placeholder="Ubicación"
              value={locationTerm}
              onChange={(e) => setLocationTerm(e.target.value)}
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-8 h-12 bg-primary text-white font-bold rounded-lg hover:bg-orange-600 transition-colors cursor-pointer"
            >
              Buscar
            </button>
          </form>
        </div>

        {/* Indicadores del Slider (Puntitos) */}
        <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-primary w-8"
                  : "bg-white/60 hover:bg-white w-2.5"
              }`}
            />
          ))}
        </div>
      </div>

      {/* SECCIÓN DE SALONES DESTACADOS (Tu código original) */}
      <div className="w-full max-w-7xl mx-auto px-4 py-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-[#181411] text-3xl font-bold">
              Salones Destacados
            </h2>
            <p className="text-gray-500">
              Selección de los mejores valorados (+4.5★)
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {salones.map((salon) => (
              <SalonCard key={salon.id} salon={salon} />
            ))}
          </div>
        )}

        {!loading && salones.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 italic">
              Vaya, no hay salones tan top ahora mismo...
            </p>
          </div>
        )}
      </div>
    </>
  );
}
