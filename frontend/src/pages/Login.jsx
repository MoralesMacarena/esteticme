import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  // 1. Aquí definimos username correctamente
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/token/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // 2. Aquí enviamos username a Django
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        navigate("/");
      } else {
        setError(
          "Usuario o contraseña incorrectos. Por favor, inténtalo de nuevo.",
        );
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-lg rounded-xl p-8 space-y-6 border border-gray-100">
          <div className="text-center">
            <h1 className="text-3xl font-black tracking-tight text-[#181411]">
              Bienvenido de nuevo
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Inicia sesión para gestionar tus citas
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label
                  className="block text-sm font-semibold text-[#181411] pb-2"
                  htmlFor="username"
                >
                  Nombre de Usuario
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  // 3. Aquí usamos username en el input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white h-12 px-4 focus:ring-2 focus:ring-[#f48c25]/50 focus:border-[#f48c25] outline-none transition-all placeholder:text-gray-400 text-base"
                  placeholder="Ej: admin"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-semibold text-[#181411] pb-2"
                  htmlFor="password"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white h-12 px-4 focus:ring-2 focus:ring-[#f48c25]/50 focus:border-[#f48c25] outline-none transition-all placeholder:text-gray-400 text-base"
                    placeholder="••••••••"
                  />
                  <div
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-gray-400 hover:text-gray-600 transition-colors">
                      {showPassword ? "visibility" : "visibility_off"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <div className="text-sm">
                <a
                  className="font-medium text-gray-500 hover:text-[#f48c25] transition-colors"
                  href="#"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`flex justify-center items-center w-full rounded-lg bg-[#f48c25] py-3 px-4 text-base font-bold text-white transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#f48c25] focus:ring-offset-2 ${
                  loading
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:bg-orange-600"
                }`}
              >
                {loading ? "Iniciando sesión..." : "Entrar"}
              </button>
            </div>
          </form>

          <div className="text-center text-sm text-gray-600 space-y-4 pt-2">
            <p>
              ¿Aún no tienes cuenta?{" "}
              <Link
                to="/signup"
                className="font-bold text-[#f48c25] hover:underline"
              >
                Regístrate
              </Link>
            </p>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase">
                O
              </span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <Link
              to="/signup-business"
              className="inline-block font-semibold text-gray-700 hover:text-[#f48c25] transition-colors"
            >
              ¿Eres un profesional?{" "}
              <span className="text-[#f48c25] font-bold">
                Acceso a Negocios
              </span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
