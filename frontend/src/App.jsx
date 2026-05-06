import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Salones from "./pages/Salones";
import SalonDetail from "./pages/SalonDetail";
import Checkout from "./pages/Checkout";
import Success from "./pages/Success";
import Signup from "./pages/Signup";
import SignupBusiness from "./pages/SignupBusiness";
import ProtectedRoute from "./components/ProtectedRoute";
import PanelProfesional from "./pages/PanelProfesional";
import PanelServicios from "./pages/PanelServicios";
import PanelNegocio from "./pages/PanelNegocio";
import CalendarioProfesional from "./pages/CalendarioProfesional";
import Perfil from "./pages/Perfil";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Header />

        {/* el contenido cambia según la URL */}
        <main className="flex-grow">
          <Routes>
            {/* RUTAS PÚBLICAS */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/signup-business" element={<SignupBusiness />} />
            <Route path="/salones" element={<Salones />} />
            <Route path="/salones/:id" element={<SalonDetail />} />
            <Route path="/panel/perfil" element={<PanelNegocio />} />
            <Route
              path="/panel/calendario"
              element={<CalendarioProfesional />}
            />

            {/* RUTAS PROTEGIDAS GENERALES */}
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/success"
              element={
                <ProtectedRoute>
                  <Success />
                </ProtectedRoute>
              }
            />

            {/* ¡RUTA DESCONGELADA Y LISTA PARA USAR! */}
            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <Perfil />
                </ProtectedRoute>
              }
            />

            <Route
              path="/panel"
              element={
                <ProtectedRoute allowedRole="professional">
                  <PanelProfesional />
                </ProtectedRoute>
              }
            />
            <Route
              path="/panel/servicios"
              element={
                <ProtectedRoute allowedRole="professional">
                  <PanelServicios />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}
