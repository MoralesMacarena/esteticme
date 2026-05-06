import { useState, useEffect } from "react";
import PanelProfesional from "./PanelProfesional";
import PanelCliente from "./PanelCliente";

export default function Perfil() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    // Añadimos la 's' a profiles para que coincida con tu backend
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
        // Si hay error (token caducado, etc), dejamos de cargar
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="animate-pulse font-bold text-gray-500">Cargando...</p>
      </div>
    );

  // Comparamos usando el campo 'role' que configuramos en tu Django
  return userData?.role === "professional" ? (
    <PanelProfesional />
  ) : (
    <PanelCliente />
  );
}
