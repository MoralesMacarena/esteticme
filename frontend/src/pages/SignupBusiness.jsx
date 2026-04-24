import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function SignupBusiness() {
  const navigate = useNavigate();

  // Adaptado 100% a tu models.py (usando full_name y añadiendo los campos de negocio)
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

    // Preparamos el paquete exacto que espera tu backend
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
              "¡Cuenta profesional creada! Ya puedes entrar y añadir fotos a tu galería.",
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
    <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#181411] min-h-screen">
      <div className="w-full max-w-2xl">
        {" "}
        {/* Hecho un poco más ancho para albergar más campos */}
        <div className="bg-white shadow-2xl rounded-xl p-8 space-y-6">
          <div className="text-center mb-8">
            <span className="material-symbols-outlined text-[#f48c25] text-4xl mb-2">
              storefront
            </span>
            <h1 className="text-3xl font-black tracking-tight text-[#181411]">
              Perfil de Negocio
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Registra tu salón y empieza a recibir reservas hoy mismo.
            </p>
          </div>

          {errorMessage && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center border border-red-100">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* SECCIÓN 1: DATOS PERSONALES */}
            <div>
              <h3 className="text-lg font-bold text-[#181411] border-b pb-2 mb-4">
                1. Tus datos de acceso
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#181411] pb-1">
                    Usuario
                  </label>
                  <input
                    name="username"
                    type="text"
                    required
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 bg-white h-11 px-4 focus:ring-2 focus:ring-[#181411] outline-none"
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
                    className="w-full rounded-lg border border-gray-300 bg-white h-11 px-4 focus:ring-2 focus:ring-[#181411] outline-none"
                    placeholder="Ej. María Pérez"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#181411] pb-1">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 bg-white h-11 px-4 focus:ring-2 focus:ring-[#181411] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#181411] pb-1">
                    Teléfono
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    required
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 bg-white h-11 px-4 focus:ring-2 focus:ring-[#181411] outline-none"
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
                    className="w-full rounded-lg border border-gray-300 bg-white h-11 px-4 focus:ring-2 focus:ring-[#181411] outline-none"
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
                    className="w-full rounded-lg border border-gray-300 bg-white h-11 px-4 focus:ring-2 focus:ring-[#181411] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: DATOS DEL NEGOCIO */}
            <div>
              <h3 className="text-lg font-bold text-[#181411] border-b pb-2 mb-4 mt-6">
                2. Información del Salón
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#181411] pb-1">
                      Nombre del Negocio
                    </label>
                    <input
                      name="business_name"
                      type="text"
                      required
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 bg-white h-11 px-4 focus:ring-2 focus:ring-[#181411] outline-none"
                      placeholder="Ej. Glamour Estilistas"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#181411] pb-1">
                      Dirección Completa
                    </label>
                    <input
                      name="business_address"
                      type="text"
                      required
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 bg-white h-11 px-4 focus:ring-2 focus:ring-[#181411] outline-none"
                      placeholder="Calle, Número, Ciudad, CP"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#181411] pb-1">
                    Descripción de los servicios (Biografía)
                  </label>
                  <textarea
                    name="description"
                    required
                    rows="3"
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 bg-white p-4 focus:ring-2 focus:ring-[#181411] outline-none resize-none"
                    placeholder="Cuéntale a tus clientes qué hace especial a tu salón..."
                  ></textarea>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-lg bg-[#181411] py-4 px-4 text-lg font-bold text-white transition-colors mt-8 shadow-lg ${loading ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-800"}`}
            >
              {loading ? "Procesando..." : "Crear Cuenta y Registrar Salón"}
            </button>
          </form>

          <div className="text-center text-sm text-gray-600 pt-6 border-t border-gray-100">
            ¿Ya tienes cuenta?{" "}
            <Link
              to="/login"
              className="font-bold text-[#181411] hover:underline"
            >
              Entrar a mi panel
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
