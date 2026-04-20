import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Salones from "./pages/Salones";
import SalonDetail from "./pages/SalonDetail";
import Checkout from "./pages/Checkout";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Header />

        {/*el contenido cambia según la URL */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/salones" element={<Salones />} />
            <Route path="/salones/:id" element={<SalonDetail />} />
            <Route path="/checkout" element={<Checkout />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}
