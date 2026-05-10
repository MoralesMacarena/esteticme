import { useState } from "react";

export default function FAQFloating() {
  const [isOpen, setIsOpen] = useState(false);

  const faqs = [
    {
      q: "¿Cómo funcionan los puntos?",
      a: "Por cada 1€ que gastes ganas 1 punto. Cada 100 puntos acumulados equivalen a 1€ de descuento en tu próxima reserva.",
    },
    {
      q: "¿Tengo que pagar al reservar?",
      a: "No, en EsteticMe solo gestionamos la reserva. El pago se realiza directamente en el salón tras finalizar tu tratamiento.",
    },
    {
      q: "¿Puedo cancelar una cita?",
      a: "Sí, puedes cancelar o reprogramar tus citas desde tu Área de Cliente hasta 24h antes de la misma.",
    },
    {
      q: "¿Cómo gano puntos extra?",
      a: "¡Mantente atenta a nuestro blog! A veces lanzamos promociones de puntos dobles en servicios seleccionados.",
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      {/* Burbuja de preguntas */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 md:w-96 bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-[#181411] p-6 text-white">
            <h3 className="text-xl font-black flex items-center gap-2">
              <span className="material-symbols-outlined text-[#f48c25]">
                help
              </span>
              Preguntas Frecuentes
            </h3>
            <p className="text-xs text-gray-400 mt-1 font-medium">
              Resolvemos tus dudas al instante
            </p>
          </div>

          <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="group">
                <p className="font-bold text-[#181411] text-sm mb-1 group-hover:text-[#f48c25] transition-colors">
                  {faq.q}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">{faq.a}</p>
                {index !== faqs.length - 1 && (
                  <hr className="mt-4 border-gray-50" />
                )}
              </div>
            ))}
          </div>

          <div className="bg-gray-50 p-4 text-center">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              EsteticMe Support
            </p>
          </div>
        </div>
      )}

      {/* Botón Flotante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? "bg-red-500 rotate-90"
            : "bg-[#181411] hover:bg-[#f48c25] hover:scale-110"
        }`}
      >
        <span className="material-symbols-outlined text-white text-3xl">
          {isOpen ? "close" : "chat_bubble"}
        </span>
      </button>
    </div>
  );
}
