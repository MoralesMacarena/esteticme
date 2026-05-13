import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role");
    setIsAuthenticated(!!token);
    setUserRole(role || "client");
    setIsMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    setIsAuthenticated(false);
    setUserRole(null);
    navigate("/login");
  };

  // --- VARIABLES DE ESTILO ---
  const navLinkStyles =
    "text-aura-plum text-sm font-semibold hover:text-purple-600 transition-colors py-2 tracking-wide uppercase";
  const mobileLinkStyles =
    "text-aura-plum text-2xl font-serif py-6 border-b border-purple-50 w-full text-center";
  const pearlBtn =
    "px-8 py-2.5 bg-gradient-to-r from-purple-100 via-white to-fuchsia-100 border border-white/60 shadow-pearl text-aura-plum font-bold rounded-full text-sm transition-all hover:scale-105 active:scale-95";

  return (
    <header className="sticky top-0 z-[100] w-full bg-white/90 backdrop-blur-md border-b border-purple-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 z-[110]">
            <span className="material-symbols-outlined text-aura-plum text-3xl">
              spa
            </span>
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
              <div className="flex items-center gap-6">
                <Link
                  to={
                    userRole === "admin"
                      ? "/admin-dashboard"
                      : userRole === "professional"
                        ? "/panel"
                        : "/perfil"
                  }
                  className="flex items-center gap-2 text-aura-plum font-bold text-sm hover:opacity-70 transition-opacity"
                >
                  <span className="material-symbols-outlined">
                    account_circle
                  </span>
                  <span>
                    {userRole === "professional" ? "Panel Pro" : "Mi Perfil"}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-xs font-bold text-gray-400 hover:text-red-400 uppercase tracking-widest transition-colors"
                >
                  Salir
                </button>
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
        className={`fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center p-8 transition-transform duration-500 ease-in-out lg:hidden ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <nav className="flex flex-col items-center w-full">
          <Link to="/salones" className={mobileLinkStyles}>
            Explorar Salones
          </Link>
          <Link to="/blog" className={mobileLinkStyles}>
            Wellness Blog
          </Link>
          <Link to="/tratamientos" className={mobileLinkStyles}>
            Tratamientos
          </Link>

          <div className="w-full max-w-xs mt-12 flex flex-col gap-6">
            {isAuthenticated ? (
              <>
                <Link
                  to="/perfil"
                  className={pearlBtn + " text-center py-4 text-lg"}
                >
                  Área Personal
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-red-400 font-bold uppercase tracking-widest text-sm"
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
