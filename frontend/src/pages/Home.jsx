import { useState, useEffect } from "react";
import SalonCard from "../components/SalonCard";

export default function Home() {
  const [salones, setSalones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/users/profiles/")
      .then((response) => response.json())
      .then((data) => {
        // FILTRO: Solo profesionales que tengan más de 4.5 estrellas
        // Nota: Si en tu base de datos aún no tienes 'rating', cámbialo a > 0 para ver resultados
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

  return (
    <>
      {/* HERO SECTION CON BUSCADOR RECUPERADO */}
      <div className="relative w-full h-[500px] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=2070&auto=format&fit=crop")',
          }}
        ></div>
        <div className="absolute inset-0 bg-black/30"></div>

        <div className="relative z-10 w-full max-w-3xl px-4 text-center">
          <h1 className="text-white text-4xl sm:text-5xl font-black mb-6 drop-shadow-md">
            Encuentra y reserva tu momento de belleza
          </h1>

          {/* AQUÍ ESTÁ TU BUSCADOR DE VUELTA */}
          <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col sm:flex-row gap-2">
            <input
              className="w-full h-12 rounded-lg border border-gray-300 px-4 focus:ring-2 focus:ring-primary outline-none"
              type="text"
              placeholder="¿Qué tratamiento buscas?"
            />
            <input
              className="w-full h-12 rounded-lg border border-gray-300 px-4 focus:ring-2 focus:ring-primary outline-none"
              type="text"
              placeholder="Ubicación"
            />
            <button className="w-full sm:w-auto px-8 h-12 bg-primary text-white font-bold rounded-lg hover:bg-orange-600 transition-colors">
              Buscar
            </button>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE SALONES FILTRADOS */}
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
          <div className="text-center py-20 bg-white rounded-xl border border-dashed">
            <p className="text-gray-500 italic">
              Vaya, no hay salones tan top ahora mismo...
            </p>
          </div>
        )}
      </div>
    </>
  );
}
