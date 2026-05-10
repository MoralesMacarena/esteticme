import { useState, useEffect } from "react";
import PostCard from "../components/PostCard"; // Asegúrate de que la ruta es correcta
import { Link } from "react-router-dom";

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/blog/posts/")
      .then((res) => res.json())
      .then((data) => {
        setPosts(Array.isArray(data) ? data : data.results || []);
        setLoading(false);
      });
  }, []);

  if (loading)
    return <div className="p-20 text-center font-bold">Cargando blog...</div>;

  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 font-display">
      <h1 className="text-5xl font-black mb-16 text-[#181411] tracking-tighter text-center">
        Blog <span className="text-[#f48c25]">&</span> Tendencias
      </h1>

      {/* --- POST DESTACADO (Lo dejamos fuera del componente porque tiene un diseño único y grande) --- */}
      {featuredPost && (
        <section className="mb-24">
          <div className="grid md:grid-cols-2 gap-12 items-center bg-white p-4 rounded-[3rem] shadow-sm border border-gray-50">
            <div className="overflow-hidden rounded-[2.5rem] shadow-2xl">
              <img
                src={
                  featuredPost.image || "https://via.placeholder.com/800x500"
                }
                alt={featuredPost.title}
                className="w-full h-[450px] object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="pr-8">
              <span className="bg-orange-50 text-[#f48c25] px-4 py-2 rounded-full font-black uppercase text-xs tracking-widest">
                Destacado: {featuredPost.category_name || "General"}
              </span>
              <h2 className="text-4xl font-black mt-6 mb-6 leading-tight text-[#181411]">
                {featuredPost.title}
              </h2>
              <Link
                to={`/blog/${featuredPost.slug}`}
                className="inline-block bg-[#181411] text-white px-10 py-4 rounded-2xl font-black hover:bg-[#f48c25] transition-colors shadow-lg shadow-black/10"
              >
                Leer artículo completo
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* --- LISTADO DE POSTS (Usando nuestro nuevo componente) --- */}
      <section className="max-w-5xl mx-auto space-y-16">
        {remainingPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </section>
    </div>
  );
}
