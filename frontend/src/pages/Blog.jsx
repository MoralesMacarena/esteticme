import { useState, useEffect } from "react";
import PostCard from "../components/PostCard";
import { Link } from "react-router-dom";

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const BACKEND_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/blog/posts/`)
      .then((res) => res.json())
      .then((data) => {
        setPosts(Array.isArray(data) ? data : data.results || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando el blog:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-aura-lavender">
        <div className="animate-pulse font-serif text-aura-plum text-2xl">
          Cargando Magazine...
        </div>
      </div>
    );
  }

  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);

  // --- VARIABLES DE ESTILO PREMIUM ---
  const pearlBtn =
    "inline-block px-10 py-4 bg-gradient-to-r from-purple-100 via-white to-fuchsia-100 border border-white/60 shadow-pearl text-aura-plum font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg";

  return (
    <div className="bg-aura-lavender min-h-screen pb-20 font-sans">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* HEADER REFINADO */}
        <header className="mb-20 text-center">
          <h1 className="text-6xl font-serif text-aura-plum tracking-tight mb-4">
            The Magazine
          </h1>
          <p className="text-gray-500 font-light italic text-lg">
            Tendencias, bienestar y el arte del cuidado personal.
          </p>
        </header>

        {/* --- POST DESTACADO CON ESTILO AURA --- */}
        {featuredPost && (
          <section className="mb-24">
            <div className="grid md:grid-cols-2 gap-12 items-center bg-white/40 backdrop-blur-md p-6 rounded-[3rem] shadow-sm border border-white/60">
              <div className="overflow-hidden rounded-[2.5rem] shadow-2xl group">
                <img
                  src={
                    featuredPost.image || "https://via.placeholder.com/800x500"
                  }
                  alt={featuredPost.title}
                  className="w-full h-[450px] object-cover group-hover:scale-110 transition-transform duration-1000"
                />
              </div>
              <div className="pr-8 py-4">
                <span className="bg-purple-100 text-purple-600 px-4 py-2 rounded-full font-bold uppercase text-[10px] tracking-widest border border-purple-200">
                  Destacado: {featuredPost.category_name || "Wellness"}
                </span>
                <h2 className="text-4xl font-serif mt-6 mb-8 leading-tight text-aura-plum">
                  {featuredPost.title}
                </h2>
                <Link to={`/blog/${featuredPost.slug}`} className={pearlBtn}>
                  Leer artículo completo
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* --- LISTADO DE POSTS --- */}
        <section className="max-w-5xl mx-auto space-y-16">
          {remainingPosts.length > 0
            ? remainingPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            : !featuredPost && (
                <div className="text-center py-20 font-serif italic text-gray-400">
                  Aún no hay historias para mostrar...
                </div>
              )}
        </section>
      </div>
    </div>
  );
}
