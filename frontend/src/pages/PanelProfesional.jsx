import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function PanelProfesional() {
  const [salonName, setSalonName] = useState("");
  const [loading, setLoading] = useState(true);
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
    <div className="bg-gray-50 min-h-screen font-sans">
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mx-auto max-w-7xl">
          {/* CABECERA LIMPIA (SIN EL MENÚ DE TEXTO) */}
          <div className="mb-8 border-b border-gray-200 pb-4">
            <h1 className="text-3xl font-black text-[#181411]">
              {loading ? "Cargando tu espacio..." : `Hola, ${salonName}`}
            </h1>
            <p className="text-gray-500 mt-1">
              Aquí tienes el resumen de tu actividad.
            </p>
          </div>

          {/* DASHBOARD DE ESTADÍSTICAS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-2xl">
                  payments
                </span>
              </div>
              <div>
                <p className="text-gray-500 text-sm font-bold mb-1">
                  Caja Fuerte
                </p>
                <h3 className="text-3xl font-black text-[#181411]">
                  {stats.ingresosTotales.toFixed(2)} €
                </h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-2xl">
                  task_alt
                </span>
              </div>
              <div>
                <p className="text-gray-500 text-sm font-bold mb-1">
                  Citas Realizadas
                </p>
                <h3 className="text-3xl font-black text-[#181411]">
                  {stats.citasTerminadas}
                </h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="w-12 h-12 bg-orange-50 text-[#f48c25] rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-2xl">
                  event_upcoming
                </span>
              </div>
              <div>
                <p className="text-gray-500 text-sm font-bold mb-1">
                  Próximas Citas
                </p>
                <h3 className="text-3xl font-black text-[#181411]">
                  {stats.citasProximas}
                </h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-2xl">
                  cancel
                </span>
              </div>
              <div>
                <p className="text-gray-500 text-sm font-bold mb-1">
                  Cancelaciones
                </p>
                <h3 className="text-3xl font-black text-[#181411]">
                  {stats.citasCanceladas}
                </h3>
              </div>
            </div>
          </div>

          {/* TARJETAS GRANDES DE NAVEGACIÓN */}
          <h2 className="text-xl font-bold text-[#181411] mb-6 border-b border-gray-200 pb-2">
            Gestión del Salón
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* TARJETA 1: CALENDARIO */}
            <Link
              to="/panel/calendario"
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-[#f48c25] transition-all cursor-pointer group block"
            >
              <div className="w-14 h-14 bg-orange-50 text-[#f48c25] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">
                  calendar_month
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#181411] mb-2">
                Agenda y Calendario
              </h3>
              <p className="text-sm text-gray-500">
                Gestiona tus reservas, cambia estados y añade nuevas citas
                manuales.
              </p>
            </Link>

            {/* TARJETA 2: SERVICIOS */}
            <Link
              to="/panel/servicios"
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-[#f48c25] transition-all cursor-pointer group block"
            >
              <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">
                  format_list_bulleted
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#181411] mb-2">
                Servicios y Horario
              </h3>
              <p className="text-sm text-gray-500">
                Añade tratamientos, edita precios o modifica tus horas de
                apertura.
              </p>
            </Link>

            {/* TARJETA 3: PERFIL */}
            <Link
              to="/panel/perfil"
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-[#f48c25] transition-all cursor-pointer group block"
            >
              <div className="w-14 h-14 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">
                  storefront
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#181411] mb-2">
                Perfil del Negocio
              </h3>
              <p className="text-sm text-gray-500">
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
