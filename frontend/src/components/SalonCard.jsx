export default function SalonCard({ salon }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
      <img
        src={
          salon.profile_picture ||
          "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800"
        }
        className="w-full h-48 object-cover"
        alt={salon.business_name}
      />
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1 text-[#181411]">
          {salon.business_name}
        </h3>
        <p className="text-gray-500 text-sm mb-2">
          {salon.address || "Dirección no disponible"}
        </p>
        <div className="flex items-center gap-1 text-sm">
          <span className="material-symbols-outlined text-yellow-500 text-sm">
            star
          </span>
          <b>4.9</b> (120 reseñas)
        </div>
      </div>
    </div>
  );
}
