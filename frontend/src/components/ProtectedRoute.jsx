import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRole }) {
  const location = useLocation();
  const token = localStorage.getItem("access_token");
  const userRole = localStorage.getItem("user_role");

  // 1. Si no hay token, a iniciar sesión.
  // Guardamos de dónde venía en "state" para devolverlo ahí después de loguearse.
  if (!token) {
    return (
      <Navigate to="/login" state={{ returnTo: location.pathname }} replace />
    );
  }

  // 2. Si la ruta exige ser "profesional" pero el usuario es "cliente" (o al revés)
  if (allowedRole && userRole !== allowedRole) {
    // Lo mandamos a la Home amablemente
    return <Navigate to="/" replace />;
  }

  // 3. Si todo está correcto, renderizamos la página que quería ver
  return children;
}
