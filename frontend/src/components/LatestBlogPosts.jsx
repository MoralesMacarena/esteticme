import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function LatestBlogPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 🔥 FUNCIÓN MÁGICA PARA LIMPIAR HTML Y ENTIDADES (&nbsp;, etc) ---
  const stripHtml = (html) => {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/blog/posts/")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.slice(0, 3));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando posts para la home:", err);
        setLoading(false);
      });
  }, []);

  if (loading || posts.length === 0) return null;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-16 border-t border-gray-100 font-sans">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-[#181411] text-3xl font-black tracking-tight">
            Consejos y Tendencias
          </h2>
          <p className="text-gray-500 mt-2">
            Descubre las últimas novedades en el mundo de la estética
          </p>
        </div>
        <Link
          to="/blog"
          className="hidden sm:flex items-center gap-2 text-[#f48c25] font-bold hover:gap-3 transition-all"
        >
          Ver todo el blog{" "}
          <span className="material-symbols-outlined">arrow_forward</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {posts.map((post) => (
          <Link
            key={post.id}
            to={`/blog/${post.slug}`}
            className="group flex flex-col bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-50"
          >
            <div className="relative h-60 overflow-hidden">
              <img
                src={
                  post.image ||
                  "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=500"
                }
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute top-5 left-5">
                <span className="bg-[#f48c25] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                  {post.category_name || "Belleza"}
                </span>
              </div>
            </div>

            <div className="p-8 flex flex-col flex-grow">
              <h3 className="text-2xl font-black text-[#181411] mb-3 group-hover:text-[#f48c25] transition-colors line-clamp-2 leading-tight tracking-tight">
                {post.title}
              </h3>

              {/* Aquí usamos la función stripHtml para que el resumen se vea perfecto */}
              <p className="text-gray-500 text-sm line-clamp-3 mb-8 leading-relaxed italic">
                {stripHtml(post.content)}
              </p>

              <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
                <span>Equipo EsteticMe</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Link
        to="/blog"
        className="flex sm:hidden items-center justify-center gap-2 text-[#f48c25] font-bold mt-10"
      >
        Ver todo el blog{" "}
        <span className="material-symbols-outlined">arrow_forward</span>
      </Link>
    </section>
  );
}
