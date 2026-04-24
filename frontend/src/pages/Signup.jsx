import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  // 1. Estado actualizado para usar 'full_name' según tu models.py
  const [formData, setFormData] = useState({
    username: "",
    full_name: "", // Sustituye a first_name y last_name
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    // 2. Payload exacto que espera Django
    const payload = {
      username: formData.username,
      full_name: formData.full_name,
      email: formData.email,
      password: formData.password,
      role: "client", // Forzamos el rol de cliente
    };

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/users/register/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (response.ok) {
        navigate("/login", {
          state: {
            message:
              "¡Cuenta creada con éxito! Ya puedes iniciar sesión y reservar.",
          },
        });
      } else {
        const errorData = await response.json();
        const errorText = errorData.username
          ? `Usuario: ${errorData.username[0]}`
          : errorData.email
            ? `Email: ${errorData.email[0]}`
            : "Revisa los datos introducidos.";
        setErrorMessage(errorText);
      }
    } catch (error) {
      setErrorMessage("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen font-sans">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-lg rounded-xl p-8 space-y-6 border border-gray-100">
          <div className="text-center mb-6">
            <span className="material-symbols-outlined text-[#f48c25] text-5xl">
              spa
            </span>
            <h1 className="text-3xl font-black tracking-tight text-[#181411] mt-2">
              Crea tu cuenta
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Empieza a reservar en los mejores salones de tu ciudad.
            </p>
          </div>

          {errorMessage && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center border border-red-100">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#181411] pb-1">
                Usuario
              </label>
              <input
                name="username"
                type="text"
                required
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white h-12 px-4 focus:ring-2 focus:ring-[#f48c25]/50 focus:border-[#f48c25] outline-none transition-all"
                placeholder="Ej: maria98"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#181411] pb-1">
                Nombre Completo
              </label>
              <input
                name="full_name"
                type="text"
                required
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white h-12 px-4 focus:ring-2 focus:ring-[#f48c25]/50 focus:border-[#f48c25] outline-none transition-all"
                placeholder="Ej: María Pérez"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#181411] pb-1">
                Correo Electrónico
              </label>
              <input
                name="email"
                type="email"
                required
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white h-12 px-4 focus:ring-2 focus:ring-[#f48c25]/50 focus:border-[#f48c25] outline-none transition-all"
                placeholder="maria@ejemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#181411] pb-1">
                Contraseña
              </label>
              <input
                name="password"
                type="password"
                required
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white h-12 px-4 focus:ring-2 focus:ring-[#f48c25]/50 focus:border-[#f48c25] outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#181411] pb-1">
                Confirmar Contraseña
              </label>
              <input
                name="confirmPassword"
                type="password"
                required
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white h-12 px-4 focus:ring-2 focus:ring-[#f48c25]/50 focus:border-[#f48c25] outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-lg bg-[#f48c25] py-3 px-4 text-base font-bold text-white transition-all mt-6 shadow-md ${
                loading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-orange-600 active:scale-[0.98]"
              }`}
            >
              {loading ? "Creando cuenta..." : "Registrarse"}
            </button>
          </form>

          <div className="text-center text-sm text-gray-600 pt-4 border-t border-gray-100">
            ¿Ya tienes cuenta?{" "}
            <Link
              to="/login"
              className="font-bold text-[#f48c25] hover:underline"
            >
              Inicia sesión
            </Link>
          </div>

          <div className="text-center text-xs mt-4">
            <Link
              to="/signup-business"
              className="text-gray-400 hover:text-[#181411] transition-colors"
            >
              ¿Eres un profesional? Registra tu salón aquí.
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
