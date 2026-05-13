import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function SignupBusiness() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    email: "",
    phone: "",
    business_name: "",
    business_address: "",
    description: "",
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

    // 1. Validaciones del Administrador
    if (!formData.username.trim()) {
      setErrorMessage("Falta el Usuario de acceso.");
      return;
    }

    if (!formData.full_name.trim()) {
      setErrorMessage("Falta el Nombre y Apellidos del administrador.");
      return;
    }

    if (!formData.email.trim()) {
      setErrorMessage("Falta el Correo Electrónico.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage(
        "El formato del correo no es válido (ejemplo: contacto@tusalon.com).",
      );
      return;
    }

    if (!formData.phone.trim()) {
      setErrorMessage("Falta el Teléfono de Contacto.");
      return;
    }

    if (!formData.password) {
      setErrorMessage("Falta la Contraseña.");
      return;
    }

    // Regex: Mínimo 8 caracteres, 1 mayúscula, 1 número
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

    // 2. Validaciones del Negocio
    if (!formData.business_name.trim()) {
      setErrorMessage("Falta el Nombre Comercial del salón.");
      return;
    }

    if (!formData.business_address.trim()) {
      setErrorMessage("Falta la Dirección Completa del salón.");
      return;
    }

    if (!formData.description.trim()) {
      setErrorMessage("Falta la Biografía / Especialidades del salón.");
      return;
    }
    // --------------------------------------------------------------

    setLoading(true);

    const payload = {
      username: formData.username,
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      business_name: formData.business_name,
      business_address: formData.business_address,
      description: formData.description,
      password: formData.password,
      role: "professional",
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
              "¡Cuenta profesional creada! Ya puedes entrar y configurar tu salón.",
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

  // --- VARIABLES DE ESTILO AURA (Con contraste mejorado) ---
  const inputStyles =
    "w-full bg-white/80 border border-purple-100 rounded-2xl px-6 py-4 text-aura-plum font-medium focus:ring-4 focus:ring-purple-100 outline-none transition-all placeholder:text-purple-300";
  const labelStyles =
    "block text-[11px] font-black text-aura-plum/80 mb-2 uppercase tracking-[0.2em] ml-2";
  const sectionTitle =
    "text-2xl font-serif text-aura-plum mb-6 flex items-center gap-3";
  const pearlBtn =
    "w-full bg-gradient-to-r from-purple-100 via-white to-fuchsia-100 border border-white/60 shadow-pearl text-aura-plum py-5 rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center shadow-lg mt-8";

  return (
    <main className="min-h-screen bg-aura-lavender flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Círculos decorativos de fondo */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-white/40 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/4"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-200/30 rounded-full blur-3xl translate-y-1/3 translate-x-1/4"></div>

      {/* Contenedor más ancho (max-w-4xl) para el formulario de negocios */}
      <div className="w-full max-w-4xl relative z-10">
        <div className="bg-white/50 backdrop-blur-xl shadow-[0_20px_50px_rgba(200,160,255,0.2)] rounded-[3rem] p-10 sm:p-16 border border-white/60">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-purple-50">
              <span className="material-symbols-outlined text-aura-plum text-4xl">
                storefront
              </span>
            </div>
            <h1 className="text-5xl font-serif text-aura-plum tracking-tight mb-4">
              Perfil de Negocio
            </h1>
            <p className="text-lg text-gray-500 font-light italic">
              Digitaliza tu salón y empieza a recibir reservas hoy mismo.
            </p>
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-100 text-red-500 p-4 rounded-2xl text-sm text-center mb-8 flex items-center justify-center gap-2 font-medium">
              <span className="material-symbols-outlined text-lg">error</span>
              {errorMessage}
            </div>
          )}

          {/* EL ATRIBUTO noValidate BLOQUEA LOS TOOLTIPS NATIVOS DEL NAVEGADOR */}
          <form onSubmit={handleSubmit} className="space-y-12" noValidate>
            {/* SECCIÓN 1: DATOS PERSONALES */}
            <div className="bg-white/60 p-8 rounded-[2rem] border border-white">
              <h3 className={sectionTitle}>
                <span className="bg-purple-100 text-aura-plum w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </span>
                Datos del Administrador
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelStyles}>Usuario de acceso</label>
                  <input
                    name="username"
                    type="text"
                    onChange={handleChange}
                    className={inputStyles}
                    placeholder="Ej. admin_glamour"
                  />
                </div>
                <div>
                  <label className={labelStyles}>Nombre y Apellidos</label>
                  <input
                    name="full_name"
                    type="text"
                    onChange={handleChange}
                    className={inputStyles}
                    placeholder="Ej. María Pérez"
                  />
                </div>
                <div>
                  <label className={labelStyles}>Correo Electrónico</label>
                  <input
                    name="email"
                    type="email"
                    onChange={handleChange}
                    className={inputStyles}
                    placeholder="contacto@tusalon.com"
                  />
                </div>
                <div>
                  <label className={labelStyles}>Teléfono de Contacto</label>
                  <input
                    name="phone"
                    type="tel"
                    onChange={handleChange}
                    className={inputStyles}
                    placeholder="+34 600 000 000"
                  />
                </div>

                {/* Contraseñas */}
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
                  <label className={labelStyles}>Confirmar Contraseña</label>
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
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      <span className="material-symbols-outlined text-sm">
                        {showConfirmPassword ? "visibility" : "visibility_off"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: DATOS DEL NEGOCIO */}
            <div className="bg-white/60 p-8 rounded-[2rem] border border-white">
              <h3 className={sectionTitle}>
                <span className="bg-purple-100 text-aura-plum w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </span>
                Información del Salón
              </h3>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelStyles}>Nombre Comercial</label>
                    <input
                      name="business_name"
                      type="text"
                      onChange={handleChange}
                      className={inputStyles}
                      placeholder="Ej. Glamour Estilistas"
                    />
                  </div>
                  <div>
                    <label className={labelStyles}>Dirección Completa</label>
                    <input
                      name="business_address"
                      type="text"
                      onChange={handleChange}
                      className={inputStyles}
                      placeholder="Calle, Número, Localidad"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelStyles}>
                    Biografía / Especialidades
                  </label>
                  <textarea
                    name="description"
                    rows="4"
                    onChange={handleChange}
                    className={`${inputStyles} resize-none`}
                    placeholder="Cuéntale a tus futuros clientes qué hace especial a tu salón, qué marcas utilizáis o cuál es vuestro tratamiento estrella..."
                  ></textarea>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className={pearlBtn}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-aura-plum border-t-transparent rounded-full animate-spin"></div>
                  Verificando datos...
                </span>
              ) : (
                "Completar Registro Profesional"
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-purple-100/50 text-center">
            <p className="text-sm text-gray-500 font-light">
              ¿Ya gestionas tu negocio con nosotros?{" "}
              <Link
                to="/login"
                className="font-bold text-aura-plum border-b border-purple-200 hover:border-aura-plum pb-0.5 transition-colors"
              >
                Accede a tu panel
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
