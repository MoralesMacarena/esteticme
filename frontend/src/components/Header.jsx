import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role");
    let name = localStorage.getItem("user_name");

    // 🔥 LA SOLUCIÓN: Limpiar la palabra literal "undefined" o "null" de JavaScript
    if (
      !name ||
      name === "undefined" ||
      name === "null" ||
      name.trim() === ""
    ) {
      name = "Mi Cuenta";
    }

    setIsAuthenticated(!!token);
    // Si no hay rol (por algún error), asumimos cliente por defecto para no romper la app
    setUserRole(role || "client");
    setUserName(name);

    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  }, [location]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_name");
    setIsAuthenticated(false);
    setUserRole(null);
    setUserName("");
    navigate("/login");
  };

  // --- VARIABLES DE ESTILO ---
  const navLinkStyles =
    "text-aura-plum text-sm font-semibold hover:text-purple-600 transition-colors py-2 tracking-wide uppercase";
  const mobileLinkStyles =
    "text-aura-plum text-2xl font-serif py-6 border-b border-purple-50 w-full text-center";
  const pearlBtn =
    "px-8 py-2.5 bg-gradient-to-r from-purple-100 via-white to-fuchsia-100 border border-white/60 shadow-pearl text-aura-plum font-bold rounded-full text-sm transition-all hover:scale-105 active:scale-95";
  const dropdownItemStyles =
    "block w-full text-left px-6 py-3 text-sm font-bold text-aura-plum hover:bg-purple-50 transition-colors";

  return (
    <header className="sticky top-0 z-[100] w-full bg-white/90 backdrop-blur-md border-b border-purple-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3 z-[110]">
            <img
              src="/faviconmtrans.svg"
              alt="Logo EsteticMe"
              className="w-8 h-8 object-contain"
            />
            <h1 className="text-aura-plum text-2xl font-serif tracking-tight">
              EsteticMe
            </h1>
          </Link>

          {/* NAV CENTRAL (SOLO DESKTOP) */}
          <nav className="hidden lg:flex items-center gap-12">
            <Link to="/salones" className={navLinkStyles}>
              Salones
            </Link>
            <Link to="/blog" className={navLinkStyles}>
              Magazine
            </Link>
            <Link to="/tratamientos" className={navLinkStyles}>
              Tratamientos
            </Link>
          </nav>

          {/* ACCIONES DERECHA (DESKTOP) */}
          <div className="hidden lg:flex items-center gap-6">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                {/* BOTÓN DEL NOMBRE */}
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 text-aura-plum font-bold text-sm bg-purple-50/50 hover:bg-purple-100/50 px-5 py-2.5 rounded-full transition-colors border border-purple-100"
                >
                  <span className="material-symbols-outlined text-xl">
                    account_circle
                  </span>
                  <span className="max-w-[150px] truncate">{userName}</span>
                  <span
                    className="material-symbols-outlined text-lg transition-transform duration-300"
                    style={{
                      transform: isDropdownOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    }}
                  >
                    expand_more
                  </span>
                </button>

                {/* MENÚ DESPLEGABLE */}
                <div
                  className={`absolute right-0 mt-3 w-56 bg-white border border-purple-100 rounded-[2rem] shadow-xl overflow-hidden transition-all duration-200 origin-top-right ${
                    isDropdownOpen
                      ? "opacity-100 scale-100 visible"
                      : "opacity-0 scale-95 invisible"
                  }`}
                >
                  <div className="py-2">
                    {/* Opción SOLO Admin */}
                    {userRole === "admin" && (
                      <Link
                        to="/admin-dashboard"
                        className={dropdownItemStyles}
                      >
                        <span className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-[20px]">
                            admin_panel_settings
                          </span>
                          Gestión
                        </span>
                      </Link>
                    )}

                    {/* Opción SOLO Profesional */}
                    {userRole === "professional" && (
                      <Link to="/panel" className={dropdownItemStyles}>
                        <span className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-[20px]">
                            storefront
                          </span>
                          Panel Pro
                        </span>
                      </Link>
                    )}

                    {/* Opción SOLO Cliente */}
                    {userRole === "client" && (
                      <Link to="/perfil" className={dropdownItemStyles}>
                        <span className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-[20px]">
                            person
                          </span>
                          Mi Perfil
                        </span>
                      </Link>
                    )}

                    <hr className="border-purple-50 my-2 mx-4" />

                    {/* Botón Salir (Para todos) */}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-6 py-3 text-sm font-black text-red-400 hover:bg-red-50 transition-colors flex items-center gap-3"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        logout
                      </span>
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-8">
                <Link
                  to="/login"
                  className="text-aura-plum text-sm font-bold uppercase tracking-widest hover:text-purple-600 transition-colors"
                >
                  Entrar
                </Link>
                <Link to="/signup" className={pearlBtn}>
                  Únete
                </Link>
              </div>
            )}
          </div>

          {/* BOTÓN HAMBURGUESA (MÓVIL) */}
          <button
            className="lg:hidden z-[110] text-aura-plum p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
          >
            <span className="material-symbols-outlined text-3xl">
              {isMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* MENÚ MÓVIL (FULL SCREEN) */}
      <div
        className={`fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center p-8 transition-transform duration-500 ease-in-out lg:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <nav className="flex flex-col items-center w-full">
          {isAuthenticated && (
            <div className="mb-8 text-center">
              <p className="text-sm text-gray-400 uppercase tracking-widest font-bold">
                Bienvenido/a
              </p>
              <p className="text-3xl font-serif text-aura-plum">{userName}</p>
            </div>
          )}

          <Link to="/salones" className={mobileLinkStyles}>
            Explorar Salones
          </Link>
          <Link to="/blog" className={mobileLinkStyles}>
            Magazine
          </Link>
          <Link to="/tratamientos" className={mobileLinkStyles}>
            Tratamientos
          </Link>

          <div className="w-full max-w-xs mt-12 flex flex-col gap-6">
            {isAuthenticated ? (
              <>
                {/* Opciones Móviles Filtradas por Rol */}
                {userRole === "admin" && (
                  <Link
                    to="/admin-dashboard"
                    className={pearlBtn + " text-center py-4 text-lg"}
                  >
                    Gestión
                  </Link>
                )}

                {userRole === "professional" && (
                  <Link
                    to="/panel"
                    className={pearlBtn + " text-center py-4 text-lg"}
                  >
                    Panel Pro
                  </Link>
                )}

                {userRole === "client" && (
                  <Link
                    to="/perfil"
                    className={pearlBtn + " text-center py-4 text-lg"}
                  >
                    Mi Perfil
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="text-red-400 font-bold uppercase tracking-widest text-sm py-4"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-aura-plum text-xl font-serif text-center py-4"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/signup"
                  className={pearlBtn + " text-center text-xl py-5"}
                >
                  Crear Cuenta
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
