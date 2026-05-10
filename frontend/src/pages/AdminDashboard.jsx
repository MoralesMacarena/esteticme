import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total_users: 0,
    total_professionals: 0,
    total_bookings: 0,
    latest_professionals: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    // Si no hay token, lo mandamos al login
    if (!token) {
      navigate("/login");
      return;
    }

    fetch("http://127.0.0.1:8000/api/users/dashboard-stats/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.status === 403)
          throw new Error("No tienes permisos de administrador.");
        if (!res.ok) throw new Error("Error al conectar con el servidor.");
        return res.json();
      })
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [navigate]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen font-display">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f48c25]"></div>
        <span className="ml-4 font-bold text-gray-600">
          Cargando métricas...
        </span>
      </div>
    );

  if (error)
    return (
      <div className="p-20 text-center font-display">
        <span className="material-symbols-outlined text-6xl text-red-500 mb-4">
          error
        </span>
        <h2 className="text-3xl font-black text-[#181411] mb-2">
          ¡Vaya! Algo ha fallado
        </h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <Link
          to="/"
          className="bg-[#181411] text-white px-6 py-3 rounded-xl font-bold"
        >
          Volver al Inicio
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50/50 font-display">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Cabecera */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-5xl font-black text-[#181411] tracking-tighter">
              Panel de Control
            </h1>
            <p className="text-gray-500 mt-2 text-lg italic">
              "Lo que no se mide, no se puede mejorar."
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href="http://127.0.0.1:8000/admin/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border-2 border-gray-200 text-[#181411] px-6 py-3 rounded-2xl font-black hover:border-[#181411] transition-all flex items-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined">settings</span>
              Configuración Base
            </a>
          </div>
        </div>

        {/* Tarjetas de Estadísticas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-8xl text-[#f48c25]">
                group
              </span>
            </div>
            <h3 className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">
              Comunidad Total
            </h3>
            <p className="text-6xl font-black text-[#181411]">
              {stats.total_users}
            </p>
            <p className="text-sm text-gray-400 mt-4 font-medium flex items-center gap-1">
              <span className="text-green-500 font-bold">↑</span> Usuarios
              registrados
            </p>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-8xl text-[#f48c25]">
                storefront
              </span>
            </div>
            <h3 className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">
              Centros Asociados
            </h3>
            <p className="text-6xl font-black text-[#181411]">
              {stats.total_professionals}
            </p>
            <p className="text-sm text-gray-400 mt-4 font-medium italic">
              Profesionales activos
            </p>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-8xl text-[#f48c25]">
                calendar_month
              </span>
            </div>
            <h3 className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">
              Citas Gestionadas
            </h3>
            <p className="text-6xl font-black text-[#181411]">
              {stats.total_bookings}
            </p>
            <p className="text-sm text-[#f48c25] mt-4 font-bold tracking-tight">
              Crecimiento constante
            </p>
          </div>
        </div>

        {/* Cuerpo del Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Columna Izquierda: Acciones del Blog (3/5) */}
          <div className="lg:col-span-3 bg-[#181411] rounded-[3rem] p-12 text-white shadow-2xl flex flex-col justify-between">
            <div>
              <div className="inline-block bg-orange-500/20 text-[#f48c25] px-4 py-1 rounded-full text-xs font-black uppercase mb-6">
                Contenido Editorial
              </div>
              <h2 className="text-4xl font-black mb-6 leading-tight">
                Manten al día el{" "}
                <span className="text-[#f48c25]">Blog de EsteticMe</span>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-10 max-w-md">
                Escribe sobre tendencias, nuevos tratamientos o noticias del
                sector. El contenido fresco atrae a más clientes.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/admin-dashboard/nuevo-post"
                className="bg-[#f48c25] text-[#181411] px-10 py-5 rounded-2xl font-black hover:scale-105 transition-transform shadow-xl shadow-orange-500/20"
              >
                Escribir Nuevo Artículo
              </Link>
              <Link
                to="/blog"
                className="bg-white/10 backdrop-blur-sm text-white px-10 py-5 rounded-2xl font-bold hover:bg-white/20 transition-all"
              >
                Ir al Blog
              </Link>
            </div>
          </div>

          {/* Columna Derecha: Últimos Registros (2/5) */}
          <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
            <h3 className="text-2xl font-black text-[#181411] mb-8 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#f48c25]">
                verified_user
              </span>
              Últimas Altas
            </h3>

            <div className="space-y-6">
              {stats.latest_professionals.length > 0 ? (
                stats.latest_professionals.map((pro) => (
                  <div
                    key={pro.id}
                    className="flex items-center justify-between p-5 rounded-2xl bg-gray-50 hover:bg-orange-50 transition-colors border border-transparent hover:border-orange-100"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#181411] text-white rounded-xl flex items-center justify-center font-black">
                        {pro.business_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-[#181411] leading-none">
                          {pro.business_name}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Registrado: {pro.date_joined}
                        </p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-gray-300">
                      chevron_right
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 italic text-center py-10">
                  Esperando nuevos profesionales...
                </p>
              )}
            </div>

            <button className="w-full mt-10 py-4 text-gray-400 font-bold text-sm border-t border-gray-100 hover:text-[#f48c25] transition-colors">
              Ver todos los profesionales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
