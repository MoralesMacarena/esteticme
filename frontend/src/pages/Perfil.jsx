import { useState, useEffect } from "react";
import PanelProfesional from "./PanelProfesional"; // El de tu captura
import PanelCliente from "./PanelCliente"; // El de las citas del cliente

export default function Perfil() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    fetch("http://127.0.0.1:8000/api/users/profile/me/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUserData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando...</p>;

  // Si el usuario es profesional, cargamos el panel de la captura
  return userData?.is_professional ? <PanelProfesional /> : <PanelCliente />;
}
