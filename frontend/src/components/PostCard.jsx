import { Link } from "react-router-dom";

export default function PostCard({ post }) {
  // Función para limpiar HTML (la ponemos aquí para que cada card sepa gestionarlo)
  const stripHtml = (html) => {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 items-center border-b border-gray-50 pb-16 last:border-0 group">
      {/* Imagen */}
      <div className="w-full md:w-1/3 overflow-hidden rounded-2xl shadow-sm">
        <img
          src={post.image || "https://via.placeholder.com/400x250"}
          alt={post.title}
          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Info */}
      <div className="w-full md:w-2/3">
        <span className="text-xs font-black text-[#f48c25] uppercase tracking-widest">
          {post.category_name || "General"}
        </span>
        <h3 className="text-2xl md:text-3xl font-black mt-2 mb-3 text-[#181411] group-hover:text-[#f48c25] transition-colors">
          {post.title}
        </h3>
        <p className="text-gray-500 line-clamp-2 mb-6 leading-relaxed">
          {stripHtml(post.content)}
        </p>

        <div className="flex items-center justify-between">
          <Link
            to={`/blog/${post.slug}`}
            className="text-[#181411] font-black text-sm border-b-2 border-orange-200 hover:border-[#f48c25] transition-all pb-1"
          >
            Sigue leyendo
          </Link>
          <span className="text-xs text-gray-400 font-bold">
            {new Date(post.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
