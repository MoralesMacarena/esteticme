import { useState, useEffect } from "react";
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
  if (posts.length === 0)
    return (
      <div className="p-20 text-center">No hay artículos publicados aún.</div>
    );

  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1, 5); // Cogemos los siguientes 4

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 font-display">
      <h1 className="text-4xl font-black mb-12 text-[#181411]">
        Blog & Tendencias
      </h1>

      {/* --- POST DESTACADO (EL PRIMERO) --- */}
      <section className="mb-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="overflow-hidden rounded-3xl shadow-2xl group">
            <img
              src={featuredPost.image || "https://via.placeholder.com/800x500"}
              alt={featuredPost.title}
              className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div>
            <span className="text-[#f48c25] font-black uppercase text-sm tracking-widest">
              {featuredPost.category_name || "General"}
            </span>
            <h2 className="text-4xl font-black mt-4 mb-6 leading-tight text-[#181411]">
              {featuredPost.title}
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-6 line-clamp-3">
              {featuredPost.content}
            </p>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <span className="text-gray-400 font-bold text-sm">
                {featuredPost.author_name} ·{" "}
                {new Date(featuredPost.created_at).toLocaleDateString()}
              </span>
            </div>
            <Link
              to={`/blog/${featuredPost.slug}`}
              className="inline-block bg-[#181411] text-white px-8 py-4 rounded-2xl font-black hover:bg-orange-600 transition-colors"
            >
              Sigue leyendo
            </Link>
          </div>
        </div>
      </section>

      <hr className="border-gray-100 mb-20" />

      {/* --- LISTA DE LOS SIGUIENTES 4 --- */}
      <section className="space-y-16">
        {remainingPosts.map((post) => (
          <div
            key={post.id}
            className="flex flex-col md:flex-row gap-8 items-center border-b border-gray-50 pb-16 last:border-0"
          >
            <div className="w-full md:w-1/3 overflow-hidden rounded-2xl">
              <img
                src={post.image || "https://via.placeholder.com/400x250"}
                alt={post.title}
                className="w-full h-48 object-cover hover:scale-105 transition-transform"
              />
            </div>
            <div className="w-full md:w-2/3">
              <span className="text-xs font-black text-orange-400 uppercase tracking-tighter">
                {post.category_name}
              </span>
              <h3 className="text-2xl font-black mt-2 mb-3 text-[#181411]">
                {post.title}
              </h3>
              <p className="text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                {post.content}
              </p>
              <Link
                to={`/blog/${post.slug}`}
                className="text-[#181411] font-black text-sm border-b-2 border-orange-200 hover:border-[#f48c25] transition-all pb-1"
              >
                Sigue leyendo
              </Link>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
