import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function PanelProfesional() {
  const [salonName, setSalonName] = useState("");
  const [loading, setLoading] = useState(true);

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    const fetchProfileData = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/users/profiles/me/",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          setSalonName(data.business_name || data.full_name || "Mi Negocio");
        }
      } catch (error) {
        console.error("Error al cargar el perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchBookings = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/bookings/citas/",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          const bookingsArray = Array.isArray(data) ? data : data.results || [];
          setBookings(bookingsArray);
        }
      } catch (error) {
        console.error("Error al cargar las citas:", error);
      } finally {
        setLoadingBookings(false);
      }
    };

    if (token) {
      fetchProfileData();
      fetchBookings();
    }
  }, []);

  const handleStatusChange = async (bookingId, newStatus) => {
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/bookings/citas/${bookingId}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (response.ok) {
        setBookings((prevBookings) =>
          prevBookings.map((b) =>
            b.id === bookingId ? { ...b, status: newStatus } : b,
          ),
        );
      } else {
        alert("No se pudo actualizar el estado de la cita en el servidor.");
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "border-green-500";
      case "pending":
        return "border-[#f48c25]";
      case "cancelled":
        return "border-red-500 opacity-60";
      default:
        return "border-gray-300";
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "--:--";
    return timeString.substring(0, 5);
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mx-auto max-w-7xl">
          {/* ¡AQUÍ ESTÁ EL SALUDO QUE SE HABÍA PERDIDO! */}
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-4">
            <div>
              <h1 className="text-3xl font-black text-[#181411]">
                {loading ? "Cargando tu espacio..." : `Hola, ${salonName}`}
              </h1>
              <p className="text-gray-500 mt-1">
                Aquí tienes el resumen de tu actividad.
              </p>
            </div>

            <div className="flex items-center gap-6 pb-1 overflow-x-auto">
              <Link
                to="/panel"
                className="text-[#181411] font-bold border-b-2 border-[#f48c25] pb-1 text-sm whitespace-nowrap"
              >
                Agenda
              </Link>
              <Link
                to="/panel/servicios"
                className="text-gray-500 hover:text-[#f48c25] text-sm font-medium transition-colors whitespace-nowrap"
              >
                Servicios y Horario
              </Link>
              <Link
                to="/panel/perfil"
                className="text-gray-500 hover:text-[#f48c25] text-sm font-medium transition-colors whitespace-nowrap"
              >
                Mi Negocio
              </Link>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-grow lg:w-2/3">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-[#181411] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#f48c25]">
                      calendar_today
                    </span>
                    Tus Citas
                  </h2>

                  <Link
                    to="/panel/calendario"
                    className="text-sm font-bold text-[#f48c25] hover:underline"
                  >
                    Ver Calendario Completo
                  </Link>
                </div>

                <div className="flex flex-col gap-4">
                  {loadingBookings ? (
                    <p className="text-gray-500 animate-pulse">
                      Cargando tu agenda...
                    </p>
                  ) : bookings.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <span className="material-symbols-outlined text-gray-400 text-4xl mb-2">
                        event_busy
                      </span>
                      <p className="text-gray-500 font-medium">
                        No tienes ninguna cita reservada aún.
                      </p>
                    </div>
                  ) : (
                    bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className={`flex items-center justify-between p-4 rounded-lg bg-gray-50 border-l-4 transition-colors duration-300 ${getStatusColor(booking.status)}`}
                      >
                        <div className="flex gap-4 items-center">
                          <div className="text-center min-w-[60px]">
                            <p className="text-lg font-bold text-[#181411]">
                              {formatTime(booking.start_time)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {booking.booking_date}
                            </p>
                          </div>
                          <div>
                            <p className="font-bold text-[#181411] text-lg capitalize">
                              {booking.client_name || "Cliente Web"}
                            </p>
                            <p className="text-sm text-gray-600">
                              Reserva:{" "}
                              {parseFloat(booking.total_price || 0).toFixed(2)}€
                            </p>
                          </div>
                        </div>

                        <select
                          value={booking.status || "pending"}
                          onChange={(e) =>
                            handleStatusChange(booking.id, e.target.value)
                          }
                          className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-[#f48c25] cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <option value="pending">Pendiente</option>
                          <option value="confirmed">Confirmada</option>
                          <option value="cancelled">Cancelada</option>
                        </select>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="lg:w-1/3 flex flex-col gap-6">
              <Link
                to="/panel/servicios"
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer group block"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-3xl">
                      format_list_bulleted
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-gray-300">
                    arrow_forward_ios
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#181411] mb-1">
                  Servicios y Horario
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Añade tratamientos, edita precios o modifica tus horas de
                  apertura.
                </p>
              </Link>

              <Link
                to="/panel/perfil"
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer group block"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-3xl">
                      storefront
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-gray-300">
                    arrow_forward_ios
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#181411] mb-1">
                  Mi Negocio
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Edita la descripción, sube fotos del local y gestiona tu
                  dirección.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
