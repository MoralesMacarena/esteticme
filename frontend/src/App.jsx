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

            {/* ⚠️ RUTAS EN LA NEVERA (Comentadas hasta que creemos los archivos) ⚠️ */}
            {/*
            <Route
              path="/perfil"
              element={
                <ProtectedRoute allowedRole="client">
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
            */}
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}
