import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // --- VALIDACIÓN ESPECÍFICA CAMPO POR CAMPO ---

    if (!formData.username.trim()) {
      setErrorMessage(
        "Falta el Usuario. Por favor, indícanos cómo quieres llamarte.",
      );
      return;
    }

    if (!formData.full_name.trim()) {
      setErrorMessage(
        "Falta el Nombre Completo. Necesitamos saber tu nombre para las reservas.",
      );
      return;
    }

    if (!formData.email.trim()) {
      setErrorMessage("Falta el Correo Electrónico.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage(
        "El formato del correo no es válido (ejemplo: maria@email.com).",
      );
      return;
    }

    if (!formData.password) {
      setErrorMessage("Falta la Contraseña.");
      return;
    }

    // NUEVA VALIDACIÓN ESTRICTA DE CONTRASEÑA
    // Exige: Al menos 1 mayúscula, al menos 1 número, mínimo 8 caracteres en total
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setErrorMessage(
        "La contraseña debe tener al menos 8 caracteres, una letra mayúscula y un número.",
      );
      return;
    }

    if (!formData.confirmPassword) {
      setErrorMessage("Por favor, repite la contraseña para confirmarla.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden. Compruébalas de nuevo.");
      return;
    }
    // --------------------------------------------------------------

    setLoading(true);

    const payload = {
      username: formData.username,
      full_name: formData.full_name,
      email: formData.email,
      password: formData.password,
      role: "client",
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
          ? `El usuario "${formData.username}" ya está en uso.`
          : errorData.email
            ? `El correo "${formData.email}" ya está registrado.`
            : "Revisa los datos introducidos.";
        setErrorMessage(errorText);
      }
    } catch (error) {
      setErrorMessage(
        "Error de conexión con el servidor. Inténtalo más tarde.",
      );
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
    "w-full bg-gradient-to-r from-purple-100 via-white to-fuchsia-100 border border-white/60 shadow-pearl text-aura-plum py-4 rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center shadow-lg mt-8";

  return (
    <main className="min-h-screen bg-aura-lavender flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

      <div className="w-full max-w-lg relative z-10">
        <div className="bg-white/50 backdrop-blur-xl shadow-[0_20px_50px_rgba(200,160,255,0.2)] rounded-[3rem] p-10 sm:p-12 border border-white/60">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-purple-50">
              <span className="material-symbols-outlined text-aura-plum text-3xl">
                magic_button
              </span>
            </div>
            <h1 className="text-4xl font-serif text-aura-plum tracking-tight mb-2">
              Crea tu cuenta
            </h1>
            <p className="text-sm text-gray-500 font-light italic">
              Empieza a reservar en los mejores salones.
            </p>
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-100 text-red-500 p-4 rounded-2xl text-sm text-center mb-8 flex items-center justify-center gap-2 font-medium">
              <span className="material-symbols-outlined text-lg">error</span>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className={labelStyles}>Usuario</label>
              <input
                name="username"
                type="text"
                onChange={handleChange}
                className={inputStyles}
                placeholder="Ej: maria98"
              />
            </div>

            <div>
              <label className={labelStyles}>Nombre Completo</label>
              <input
                name="full_name"
                type="text"
                onChange={handleChange}
                className={inputStyles}
                placeholder="Ej: María Pérez"
              />
            </div>

            <div>
              <label className={labelStyles}>Correo Electrónico</label>
              <input
                name="email"
                type="email"
                onChange={handleChange}
                className={inputStyles}
                placeholder="maria@ejemplo.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelStyles}>Contraseña</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    onChange={handleChange}
                    className={`${inputStyles} [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-4 flex items-center justify-center text-aura-plum/60 hover:text-aura-plum transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {showPassword ? "visibility" : "visibility_off"}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className={labelStyles}>Repetir Clave</label>
                <div className="relative">
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    onChange={handleChange}
                    className={`${inputStyles} [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-4 flex items-center justify-center text-aura-plum/60 hover:text-aura-plum transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {showConfirmPassword ? "visibility" : "visibility_off"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className={pearlBtn}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-aura-plum border-t-transparent rounded-full animate-spin"></div>
                  Procesando...
                </span>
              ) : (
                "Registrarse"
              )}
            </button>
          </form>

          {/* ZONA DE ENLACES */}
          <div className="mt-8 space-y-8">
            <div className="text-center">
              <p className="text-sm text-gray-500 font-light">
                ¿Ya formas parte de la comunidad?{" "}
                <Link
                  to="/login"
                  className="font-bold text-aura-plum border-b border-purple-200 hover:border-aura-plum pb-0.5 transition-colors"
                >
                  Inicia sesión
                </Link>
              </p>
            </div>

            <div className="pt-8 border-t border-purple-100/50 flex flex-col items-center">
              <p className="text-[11px] text-gray-400 uppercase tracking-widest font-black mb-4">
                ¿Eres un profesional?
              </p>
              <Link
                to="/signup-business"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-bold text-aura-plum hover:text-purple-600 transition-colors bg-white/60 px-8 py-3.5 rounded-full border border-purple-100 shadow-sm hover:shadow-md"
              >
                <span className="material-symbols-outlined text-lg">
                  storefront
                </span>
                Registra tu Salón aquí
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
