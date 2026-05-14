import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";

export default function Login() {
  // Renombramos conceptualmente a 'identifier' aunque al backend se lo mandemos como 'username'
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/users/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // 🔥 FIX 1: Mandamos 'identifier' (que puede ser email o nick) en el campo 'username' que espera Django
        body: JSON.stringify({ username: identifier, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        localStorage.setItem("user_role", data.role);

        const nameToSave =
          data.full_name ||
          (data.user && data.user.full_name) ||
          data.username ||
          (data.user && data.user.username) ||
          "Mi Cuenta";

        localStorage.setItem("user_name", nameToSave);

        // 🔥 FIX 2: Redirigimos a "/perfil" para que el controlador decida qué panel mostrar
        const returnTo = location.state?.returnTo || "/perfil";
        const savedData = location.state?.savedData || null;

        navigate(returnTo, { state: savedData });
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

  // --- VARIABLES DE ESTILO AURA ---
  const inputStyles =
    "w-full bg-white/80 border border-purple-100 rounded-2xl px-6 py-4 text-aura-plum font-medium focus:ring-4 focus:ring-purple-100 outline-none transition-all placeholder:text-purple-300";
  const labelStyles =
    "block text-[11px] font-black text-aura-plum/80 mb-2 uppercase tracking-[0.2em] ml-2";
  const pearlBtn =
    "w-full bg-gradient-to-r from-purple-100 via-white to-fuchsia-100 border border-white/60 shadow-pearl text-aura-plum py-4 rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center shadow-lg";

  return (
    <main className="min-h-screen bg-aura-lavender flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Círculos decorativos de fondo */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-white/40 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/50 backdrop-blur-xl shadow-[0_20px_50px_rgba(200,160,255,0.2)] rounded-[3rem] p-10 sm:p-12 border border-white/60">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-purple-50">
              <span className="material-symbols-outlined text-aura-plum text-3xl">
                spa
              </span>
            </div>
            <h1 className="text-4xl font-serif text-aura-plum tracking-tight mb-2">
              Bienvenido
            </h1>
            <p className="text-sm text-gray-500 font-light italic">
              Accede a tu espacio de bienestar
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-500 p-4 rounded-2xl text-sm text-center mb-6 flex items-center justify-center gap-2 font-medium">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="identifier" className={labelStyles}>
                Email o Usuario
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className={inputStyles}
                placeholder="Ej: marta@gmail.com o cliente_marta"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className={`${labelStyles} mb-0`}>
                  Contraseña
                </label>
                <a
                  href="#"
                  className="text-[10px] font-bold text-aura-plum/60 hover:text-aura-plum transition-colors uppercase tracking-widest"
                >
                  ¿Olvidaste la clave?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputStyles} [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-4 flex items-center justify-center text-aura-plum/60 hover:text-aura-plum transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" disabled={loading} className={pearlBtn}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-aura-plum border-t-transparent rounded-full animate-spin"></div>
                    Conectando...
                  </span>
                ) : (
                  "Iniciar Sesión"
                )}
              </button>
            </div>
          </form>

          {/* FOOTER DEL LOGIN */}
          <div className="mt-10 text-center">
            <p className="text-sm text-gray-500 font-light">
              ¿No tienes cuenta?{" "}
              <Link
                to="/signup"
                className="font-bold text-aura-plum border-b border-purple-200 hover:border-aura-plum pb-0.5 transition-colors"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
