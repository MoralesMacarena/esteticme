import { useState, useEffect } from "react";
import PanelProfesional from "./PanelProfesional";
import PanelCliente from "./PanelCliente";
import AdminDashboard from "./AdminDashboard"; // 🔥 Añadimos el panel de administrador

export default function Perfil() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    fetch("http://127.0.0.1:8000/api/users/profiles/me/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error de autenticación");
        return res.json();
      })
      .then((data) => {
        setUserData(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-aura-lavender flex items-center justify-center flex-col">
        <div className="w-12 h-12 border-4 border-purple-100 border-t-aura-plum rounded-full animate-spin mb-4"></div>
        <p className="font-serif italic text-aura-plum animate-pulse">
          Cargando tu espacio...
        </p>
      </div>
    );

  //CONTROL DE TRÁFICO: Redirige según el rol exacto
  if (userData?.role === "admin") {
    return <AdminDashboard />;
  } else if (userData?.role === "professional") {
    return <PanelProfesional />;
  } else {
    // Si es "client" o cualquier otro rol por defecto
    return <PanelCliente />;
  }
}
