import { Link } from "react-router-dom";

export default function PostCard({ post }) {
  // Mantenemos tu lógica de limpieza de HTML
  const stripHtml = (html) => {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  return (
    <div className="flex flex-col md:flex-row gap-10 items-center border-b border-purple-50 pb-16 last:border-0 group">
      {/* Imagen con bordes más suaves y efecto zoom */}
      <div className="w-full md:w-2/5 overflow-hidden rounded-[2rem] shadow-sm bg-white">
        <img
          src={post.image || "https://via.placeholder.com/400x250"}
          alt={post.title}
          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-1000 ease-in-out"
        />
      </div>

      {/* Info con tipografía editorial */}
      <div className="w-full md:w-3/5">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em] bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
            {post.category_name || "Tendencias"}
          </span>
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
            {new Date(post.created_at).toLocaleDateString("es-ES", {
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>

        <h3 className="text-3xl font-serif text-aura-plum mb-4 leading-tight group-hover:text-purple-600 transition-colors duration-300">
          {post.title}
        </h3>

        <p className="text-gray-500 line-clamp-2 mb-8 leading-relaxed font-light text-sm italic">
          "{stripHtml(post.content)}"
        </p>

        <div className="flex items-center">
          <Link
            to={`/blog/${post.slug}`}
            className="text-aura-plum font-bold text-xs uppercase tracking-[0.15em] border-b border-purple-200 hover:border-aura-plum transition-all pb-2"
          >
            Sigue leyendo
          </Link>
        </div>
      </div>
    </div>
  );
}
