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

  // --- VARIABLES DE ESTILOS PREMIUM ---
  const sectionTitleStyles =
    "text-aura-plum text-4xl font-serif mb-4 text-center tracking-wide";
  const sectionSubtitleStyles =
    "text-gray-500 text-center font-light tracking-wider uppercase text-sm mb-12";
  const cardStyles =
    "bg-white rounded-3xl p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(200,160,255,0.15)] transition-all duration-500 group border border-purple-50/50 flex flex-col";
  const imageContainer = "relative h-56 rounded-2xl overflow-hidden mb-5";
  const badgeStyles =
    "absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-semibold text-aura-plum uppercase tracking-widest shadow-sm";
  const cardTitleStyles =
    "text-2xl font-serif text-aura-plum px-2 mb-3 group-hover:text-purple-700 transition-colors line-clamp-2 leading-tight";
  const cardExcerptStyles =
    "text-gray-500 text-sm line-clamp-3 mb-6 px-2 leading-relaxed font-light";
  const cardFooterStyles =
    "mt-auto pt-4 mx-2 border-t border-purple-50 flex items-center justify-between text-[11px] font-medium text-gray-400 uppercase tracking-widest";

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-20 font-sans">
      {/* Cabecera Centrada Premium */}
      <div className="flex flex-col items-center">
        <h2 className={sectionTitleStyles}>Tendencias en Bienestar</h2>
        <p className={sectionSubtitleStyles}>
          Descubre las últimas novedades en el mundo de la estética
        </p>
      </div>

      {/* Grid de Artículos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {posts.map((post) => (
          <Link key={post.id} to={`/blog/${post.slug}`} className={cardStyles}>
            {/* Imagen y Etiqueta */}
            <div className={imageContainer}>
              <img
                src={
                  post.image ||
                  "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=500"
                }
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className={badgeStyles}>
                {post.category_name || "Belleza"}
              </div>
            </div>

            {/* Contenido del Post */}
            <div className="flex flex-col flex-grow">
              <h3 className={cardTitleStyles}>{post.title}</h3>

              <p className={cardExcerptStyles}>{stripHtml(post.content)}</p>

              <div className={cardFooterStyles}>
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
                <span>Equipo EsteticMe</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Enlace elegante unificado para ver todo el blog */}
      <div className="mt-12 flex justify-center">
        <Link
          to="/blog"
          className="group flex items-center gap-2 px-8 py-3 rounded-full text-aura-plum font-serif italic text-lg hover:text-purple-700 transition-all duration-300"
        >
          Explorar todos los artículos
          <span className="material-symbols-outlined text-sm group-hover:translate-x-2 transition-transform">
            arrow_forward
          </span>
        </Link>
      </div>
    </section>
  );
}
