import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation(); // Nos sirve para saber en qué página estamos
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para saber si estamos logueados
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Este "useEffect" mira si hay token cada vez que cambiamos de página
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [location]); // Se vuelve a ejecutar si la URL cambia

  // Función para cerrar sesión
  const handleLogout = () => {
    // 1. Rompemos las pulseras VIP
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    // 2. Actualizamos el estado
    setIsAuthenticated(false);

    // 3. Lo mandamos a la Home (o al Login)
    navigate("/login");
  };

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchTerm.trim() !== "") {
      // Mandamos al usuario a la página de salones con el parámetro de búsqueda
      navigate(`/salones?search=${searchTerm}`);
    }
  };

  return (
    <header className="sticky top-0 z-[100] w-full bg-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between whitespace-nowrap px-4 sm:px-6 lg:px-8 py-3">
        {/* LOGO */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 text-[#181411]">
            <div className="size-6 text-[#f48c25]">
              <svg
                fill="currentColor"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M13.8261 30.5736C16.7203 29.8826 20.2244 29.4783 24 29.4783C27.7756 29.4783 31.2797 29.8826 34.1739 30.5736C36.9144 31.2278 39.9967 32.7669 41.3563 33.8352L24.8486 7.36089C24.4571 6.73303 23.5429 6.73303 23.1514 7.36089L6.64374 33.8352C8.00331 32.7669 11.0856 31.2278 13.8261 30.5736Z"></path>
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M39.998 35.764C39.9944 35.7463 39.9875 35.7155 39.9748 35.6706C39.9436 35.5601 39.8949 35.4259 39.8346 35.2825C39.8168 35.2403 39.7989 35.1993 39.7813 35.1602C38.5103 34.2887 35.9788 33.0607 33.7095 32.5189C30.9875 31.8691 27.6413 31.4783 24 31.4783C20.3587 31.4783 17.0125 31.8691 14.2905 32.5189C12.0012 33.0654 9.44505 34.3104 8.18538 35.1832C8.17384 35.2075 8.16216 35.233 8.15052 35.2592C8.09919 35.3751 8.05721 35.4886 8.02977 35.589C8.00356 35.6848 8.00039 35.7333 8.00004 35.7388C8.00004 35.739 8 35.7393 8.00004 35.7388C8.00004 35.7641 8.0104 36.0767 8.68485 36.6314C9.34546 37.1746 10.4222 37.7531 11.9291 38.2772C14.9242 39.319 19.1919 40 24 40C28.8081 40 33.0758 39.319 36.0709 38.2772C37.5778 37.7531 38.6545 37.1746 39.3151 36.6314C39.9006 36.1499 39.9857 35.8511 39.998 35.764ZM4.95178 32.7688L21.4543 6.30267C22.6288 4.4191 25.3712 4.41909 26.5457 6.30267L43.0534 32.777C43.0709 32.8052 43.0878 32.8338 43.104 32.8629L41.3563 33.8352C43.104 32.8629 43.1038 32.8626 43.104 32.8629L43.1051 32.865L43.1065 32.8675L43.1101 32.8739L43.1199 32.8918C43.1276 32.906 43.1377 32.9246 43.1497 32.9473C43.1738 32.9925 43.2062 33.0545 43.244 33.1299C43.319 33.2794 43.4196 33.489 43.5217 33.7317C43.6901 34.1321 44 34.9311 44 35.7391C44 37.4427 43.003 38.7775 41.8558 39.7209C40.6947 40.6757 39.1354 41.4464 37.385 42.0552C33.8654 43.2794 29.133 44 24 44C18.867 44 14.1346 43.2794 10.615 42.0552C8.86463 41.4464 7.30529 40.6757 6.14419 39.7209C4.99695 38.7775 3.99999 37.4427 3.99999 35.7391C3.99999 34.8725 4.29264 34.0922 4.49321 33.6393C4.60375 33.3898 4.71348 33.1804 4.79687 33.0311C4.83898 32.9556 4.87547 32.8935 4.9035 32.8471C4.91754 32.8238 4.92954 32.8043 4.93916 32.7889L4.94662 32.777L4.95178 32.7688ZM35.9868 29.004L24 9.77997L12.0131 29.004C12.4661 28.8609 12.9179 28.7342 13.3617 28.6282C16.4281 27.8961 20.0901 27.4783 24 27.4783C27.9099 27.4783 31.5719 27.8961 34.6383 28.6282C35.082 28.7342 35.5339 28.8609 35.9868 29.004Z"
                ></path>
              </svg>
            </div>
            <h2 className="text-[#181411] text-xl font-bold leading-tight tracking-[-0.015em]">
              EsteticMe
            </h2>
          </Link>
        </div>

        {/* BUSCADOR Y LINKS CENTRALES */}
        <div className="flex flex-1 justify-center items-center gap-8">
          <div className="hidden md:flex items-center gap-9">
            <Link
              to="/blog"
              className="text-[#181411] text-sm font-medium hover:text-[#f48c25] transition-colors"
            >
              Blog
            </Link>
            <Link
              to="/salones"
              className="text-[#181411] text-sm font-medium hover:text-[#f48c25] transition-colors"
            >
              Salones
            </Link>
            <Link
              to="/tratamientos"
              className="text-[#181411] text-sm font-medium hover:text-[#f48c25] transition-colors"
            >
              Tratamientos
            </Link>
          </div>
          <label className="flex flex-col min-w-40 h-10 max-w-sm ml-8">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
              <div className="text-[#8a7560] flex border-none bg-[#f5f2f0] items-center justify-center pl-4 rounded-l-lg border-r-0">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input
                className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#181411] focus:outline-0 focus:ring-0 border-none bg-[#f5f2f0] focus:border-none h-full placeholder:text-[#8a7560] px-4 rounded-l-none border-l-0 pl-2 text-sm font-normal"
                placeholder="Buscar salones o servicios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
          </label>
        </div>

        {/* ZONA DERECHA: Renderizado Condicional */}
        <div className="flex gap-4 items-center">
          {isAuthenticated ? (
            // SI ESTÁ LOGUEADO: Mostramos su perfil y botón de salir
            <>
              <Link
                to="/perfil"
                className="flex items-center gap-2 text-sm font-bold text-[#181411] hover:text-[#f48c25] transition-colors"
              >
                <span className="material-symbols-outlined">
                  account_circle
                </span>
                <span className="hidden sm:inline">Mi Perfil</span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-bold text-gray-500 hover:text-red-500 transition-colors ml-2"
              >
                Salir
              </button>
            </>
          ) : (
            // SI NO ESTÁ LOGUEADO: Mostramos Login y Registro
            <>
              <Link
                to="/login"
                className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-white text-[#181411] text-sm font-bold border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-[#f48c25] text-white text-sm font-bold hover:bg-orange-600 transition-colors shadow-sm"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
