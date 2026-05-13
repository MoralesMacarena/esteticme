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
import Tratamientos from "./pages/Tratamientos";
import Blog from "./pages/Blog";
import AdminDashboard from "./pages/AdminDashboard";
import CreatePost from "./pages/CreatePost";
import BlogDetail from "./pages/BlogDetail";
import EditPost from "./pages/EditPost";
import CookieConsent from "./components/CookieConsent";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Header />

        {/* el contenido cambia según la URL */}
        <main className="flex-grow">
          <Routes>
            {/* 🟢 RUTAS PÚBLICAS (Cualquiera puede entrar) */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/signup-business" element={<SignupBusiness />} />
            <Route path="/salones" element={<Salones />} />
            <Route path="/salones/:id" element={<SalonDetail />} />
            <Route path="/tratamientos" element={<Tratamientos />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />

            {/* 🟡 RUTAS PROTEGIDAS GENERALES (Cualquiera que haya hecho login) */}
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
            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <Perfil />
                </ProtectedRoute>
              }
            />

            {/* 🟠 RUTAS PROTEGIDAS PROFESIONALES (Solo role="professional") */}
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
            <Route
              path="/panel/perfil"
              element={
                <ProtectedRoute allowedRole="professional">
                  <PanelNegocio />
                </ProtectedRoute>
              }
            />
            <Route
              path="/panel/calendario"
              element={
                <ProtectedRoute allowedRole="professional">
                  <CalendarioProfesional />
                </ProtectedRoute>
              }
            />

            {/* 🔴 RUTAS PROTEGIDAS ADMINISTRADOR (Solo role="admin") */}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard/nuevo-post"
              element={
                <ProtectedRoute allowedRole="admin">
                  <CreatePost />
                </ProtectedRoute>
              }
            />
            <Route
              path="/blog/:slug/edit"
              element={
                <ProtectedRoute allowedRole="admin">
                  <EditPost />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <CookieConsent />
        <Footer />
      </div>
    </BrowserRouter>
  );
}
