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
          throw new Error(
            "Acceso restringido: Se requieren permisos de administrador.",
          );
        if (!res.ok)
          throw new Error("Error en la conexión con el servidor de métricas.");
        return res.json();
      })
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [navigate]);

  // --- VARIABLES DE ESTILO ---
  const statCard =
    "bg-white p-10 rounded-[3rem] shadow-sm border border-purple-50 relative overflow-hidden group hover:shadow-xl transition-all duration-500";
  const pearlBtn =
    "bg-gradient-to-r from-purple-100 via-white to-fuchsia-100 border border-white/60 shadow-pearl text-aura-plum px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-md flex items-center gap-2";
  const iconBg =
    "absolute -top-4 -right-4 p-8 opacity-5 group-hover:opacity-10 transition-opacity text-aura-plum text-8xl material-symbols-outlined";

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-aura-lavender">
        <div className="w-12 h-12 border-4 border-purple-100 border-t-aura-plum rounded-full animate-spin mb-4"></div>
        <span className="font-serif italic text-aura-plum text-xl">
          Analizando datos del ecosistema...
        </span>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-aura-lavender p-10">
        <span className="material-symbols-outlined text-7xl text-red-300 mb-6">
          lock_person
        </span>
        <h2 className="text-3xl font-serif text-aura-plum mb-4">
          Acceso Denegado
        </h2>
        <p className="text-gray-500 mb-8 max-w-md text-center">{error}</p>
        <Link to="/" className={pearlBtn}>
          Volver a la superficie
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-aura-lavender/40 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <h1 className="text-6xl font-serif text-aura-plum tracking-tight">
              Dashboard
            </h1>
            <p className="text-purple-400 mt-4 text-lg font-light italic">
              Supervisión global de la red EsteticMe.
            </p>
          </div>
          <a
            href="http://127.0.0.1:8000/admin/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-aura-plum font-bold uppercase tracking-widest text-xs border-b border-purple-200 pb-2 hover:border-aura-plum transition-all"
          >
            <span className="material-symbols-outlined text-sm">
              settings_input_component
            </span>
            Django Administration
          </a>
        </div>

        {/* MÉTRICAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className={statCard}>
            <span className={iconBg}>group</span>
            <h3 className="text-purple-300 font-bold uppercase tracking-widest text-[10px] mb-2">
              Comunidad
            </h3>
            <p className="text-6xl font-serif text-aura-plum">
              {stats.total_users}
            </p>
            <p className="text-xs text-gray-400 mt-6 tracking-wide">
              Usuarios registrados en la plataforma
            </p>
          </div>

          <div className={statCard}>
            <span className={iconBg}>content_cut</span>
            <h3 className="text-purple-300 font-bold uppercase tracking-widest text-[10px] mb-2">
              Ecosistema
            </h3>
            <p className="text-6xl font-serif text-aura-plum">
              {stats.total_professionals}
            </p>
            <p className="text-xs text-gray-400 mt-6 tracking-wide">
              Salones y profesionales activos
            </p>
          </div>

          <div className={statCard}>
            <span className={iconBg}>auto_awesome</span>
            <h3 className="text-purple-300 font-bold uppercase tracking-widest text-[10px] mb-2">
              Actividad
            </h3>
            <p className="text-6xl font-serif text-aura-plum">
              {stats.total_bookings}
            </p>
            <p className="text-xs text-aura-plum/40 mt-6 font-bold">
              Citas gestionadas con éxito
            </p>
          </div>
        </div>

        {/* ACCIONES Y LISTADOS */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* PANEL EDITORIAL */}
          <div className="lg:col-span-3 bg-aura-plum rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <span className="inline-block bg-white/10 text-purple-200 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-8">
                Estrategia de Contenidos
              </span>
              <h2 className="text-4xl font-serif mb-6 leading-tight">
                Impulsa el{" "}
                <span className="italic text-purple-200">Magazine</span>
              </h2>
              <p className="text-purple-100/60 text-lg font-light leading-relaxed mb-12 max-w-sm">
                La creación de contenido fresco posiciona a EsteticMe como
                referente en el sector.
              </p>
              <div className="flex flex-wrap gap-6">
                <Link to="/admin-dashboard/nuevo-post" className={pearlBtn}>
                  Redactar Artículo
                </Link>
                <Link
                  to="/blog"
                  className="flex items-center text-sm font-bold uppercase tracking-widest hover:text-purple-200 transition-colors"
                >
                  Ver feed actual
                </Link>
              </div>
            </div>
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
          </div>

          {/* ÚLTIMAS ALTAS */}
          <div className="lg:col-span-2 bg-white/60 backdrop-blur-sm rounded-[3rem] p-10 border border-purple-50">
            <h3 className="text-xl font-serif text-aura-plum mb-10 flex items-center gap-3">
              <span className="material-symbols-outlined text-purple-300">
                verified
              </span>
              Nuevos Partners
            </h3>

            <div className="space-y-4">
              {stats.latest_professionals.length > 0 ? (
                stats.latest_professionals.map((pro) => (
                  <div
                    key={pro.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/50 border border-purple-50 group hover:bg-white transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-aura-lavender text-aura-plum rounded-xl flex items-center justify-center font-serif text-xl border border-purple-100">
                        {pro.business_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-aura-plum text-sm">
                          {pro.business_name}
                        </p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-tighter mt-0.5">
                          Unido el {pro.date_joined}
                        </p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-purple-200 group-hover:text-aura-plum transition-colors">
                      arrow_forward
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <p className="text-gray-400 italic text-sm">
                    Sin registros recientes.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
