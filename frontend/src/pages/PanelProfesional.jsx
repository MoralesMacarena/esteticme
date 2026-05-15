import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function PanelProfesional() {
  const [salonName, setSalonName] = useState("");
  const [loading, setLoading] = useState(true);
  const [profesionalId, setProfesionalId] = useState(null);
  const [stats, setStats] = useState({
    ingresosTotales: 0,
    citasTerminadas: 0,
    citasProximas: 0,
    citasCanceladas: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    const fetchProfileData = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/users/profiles/me/",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (response.ok) {
          const data = await response.json();
          setSalonName(data.business_name || data.full_name || "Mi Negocio");
          setProfesionalId(data.id);
        }
      } catch (error) {
        console.error("Error al cargar el perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchBookings = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/bookings/citas/",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (response.ok) {
          const data = await response.json();
          const bookingsArray = Array.isArray(data) ? data : data.results || [];

          let ingresos = 0;
          let terminadas = 0;
          let proximas = 0;
          let canceladas = 0;
          bookingsArray.forEach((b) => {
            if (b.status === "completed") {
              terminadas += 1;
              ingresos += parseFloat(b.total_price || 0);
            } else if (b.status === "confirmed" || b.status === "pending") {
              proximas += 1;
            } else if (b.status === "cancelled") {
              canceladas += 1;
            }
          });
          setStats({
            ingresosTotales: ingresos,
            citasTerminadas: terminadas,
            citasProximas: proximas,
            citasCanceladas: canceladas,
          });
        }
      } catch (error) {
        console.error("Error al cargar las citas:", error);
      }
    };

    if (token) {
      fetchProfileData();
      fetchBookings();
    }
  }, []);

  return (
    <div className="bg-aura-lavender min-h-screen font-sans relative overflow-hidden">
      {/* Decoración Fondo */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-200/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

      <main className="w-full px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="mx-auto max-w-6xl">
          {/* CABECERA AURA */}
          <div className="mb-12 border-b border-purple-100 pb-8">
            <h1 className="text-5xl font-serif text-aura-plum tracking-tight">
              {loading ? "Preparando tu espacio..." : `Hola, ${salonName}`}
            </h1>
            <p className="text-gray-500 font-light italic mt-3 text-lg">
              Tu resumen de actividad y bienestar.
            </p>
            {profesionalId && (
              <Link
                to={`/salones/${profesionalId}`}
                className="flex items-center gap-2 px-6 py-2.5 bg-purple-50 text-aura-plum font-bold rounded-full border border-purple-100 shadow-sm transition-all hover:bg-purple-100 hover:scale-105 active:scale-95 w-fit"
              >
                <span className="material-symbols-outlined text-[20px]">
                  visibility
                </span>
                Ver mi escaparate público
              </Link>
            )}
          </div>

          {/* DASHBOARD DE ESTADÍSTICAS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {/* Tarjeta: Caja Fuerte */}
            <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-sm border border-white flex flex-col justify-between hover:shadow-pearl transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-green-50">
                <span className="material-symbols-outlined text-2xl">
                  payments
                </span>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">
                  Caja Fuerte
                </p>
                <h3 className="text-4xl font-serif text-aura-plum">
                  {stats.ingresosTotales.toFixed(2)} €
                </h3>
              </div>
            </div>

            {/* Tarjeta: Citas Realizadas */}
            <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-sm border border-white flex flex-col justify-between hover:shadow-pearl transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-blue-50">
                <span className="material-symbols-outlined text-2xl">
                  task_alt
                </span>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">
                  Citas Realizadas
                </p>
                <h3 className="text-4xl font-serif text-aura-plum">
                  {stats.citasTerminadas}
                </h3>
              </div>
            </div>

            {/* Tarjeta: Próximas Citas */}
            <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-sm border border-white flex flex-col justify-between hover:shadow-pearl transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-50 text-aura-plum rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-purple-50">
                <span className="material-symbols-outlined text-2xl">
                  event_upcoming
                </span>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">
                  Próximas Citas
                </p>
                <h3 className="text-4xl font-serif text-aura-plum">
                  {stats.citasProximas}
                </h3>
              </div>
            </div>

            {/* Tarjeta: Cancelaciones */}
            <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-sm border border-white flex flex-col justify-between hover:shadow-pearl transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-50 text-red-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-red-50">
                <span className="material-symbols-outlined text-2xl">
                  cancel
                </span>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">
                  Cancelaciones
                </p>
                <h3 className="text-4xl font-serif text-aura-plum">
                  {stats.citasCanceladas}
                </h3>
              </div>
            </div>
          </div>

          {/* TARJETAS GRANDES DE NAVEGACIÓN */}
          <h2 className="text-2xl font-serif text-aura-plum mb-8 border-b border-purple-100 pb-4">
            Gestión del Salón
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* NAVEGACIÓN: CALENDARIO */}
            <Link
              to="/panel/calendario"
              className="bg-white/80 backdrop-blur-md rounded-[3rem] shadow-sm border border-white p-10 hover:shadow-pearl hover:bg-white transition-all cursor-pointer group block text-center"
            >
              <div className="size-20 mx-auto bg-gradient-to-tr from-purple-100 to-white text-aura-plum rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner border border-purple-50">
                <span className="material-symbols-outlined text-4xl">
                  calendar_month
                </span>
              </div>
              <h3 className="text-xl font-bold text-aura-plum mb-3">Agenda</h3>
              <p className="text-sm text-gray-500 font-light italic leading-relaxed">
                Gestiona tus reservas, cambia estados y añade nuevas citas
                manuales.
              </p>
            </Link>

            {/* NAVEGACIÓN: SERVICIOS */}
            <Link
              to="/panel/servicios"
              className="bg-white/80 backdrop-blur-md rounded-[3rem] shadow-sm border border-white p-10 hover:shadow-pearl hover:bg-white transition-all cursor-pointer group block text-center"
            >
              <div className="size-20 mx-auto bg-gradient-to-tr from-purple-100 to-white text-aura-plum rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner border border-purple-50">
                <span className="material-symbols-outlined text-4xl">
                  format_list_bulleted
                </span>
              </div>
              <h3 className="text-xl font-bold text-aura-plum mb-3">
                Servicios y Horarios
              </h3>
              <p className="text-sm text-gray-500 font-light italic leading-relaxed">
                Añade tratamientos, edita precios o modifica tus horas de
                apertura.
              </p>
            </Link>

            {/* NAVEGACIÓN: PERFIL */}
            <Link
              to="/panel/perfil"
              className="bg-white/80 backdrop-blur-md rounded-[3rem] shadow-sm border border-white p-10 hover:shadow-pearl hover:bg-white transition-all cursor-pointer group block text-center"
            >
              <div className="size-20 mx-auto bg-gradient-to-tr from-purple-100 to-white text-aura-plum rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner border border-purple-50">
                <span className="material-symbols-outlined text-4xl">
                  storefront
                </span>
              </div>
              <h3 className="text-xl font-bold text-aura-plum mb-3">
                Mi Negocio
              </h3>
              <p className="text-sm text-gray-500 font-light italic leading-relaxed">
                Edita tu descripción, sube fotos y mantén tu escaparate
                actualizado.
              </p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
