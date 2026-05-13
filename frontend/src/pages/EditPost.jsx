import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

export default function EditPost() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    is_published: false,
    author: "",
    category: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    // Cargar categorías
    fetch("http://127.0.0.1:8000/api/bookings/categorias/")
      .then((res) => res.json())
      .then((data) =>
        setCategories(Array.isArray(data) ? data : data.results || []),
      )
      .catch(console.error);

    // Cargar datos del post
    fetch(`http://127.0.0.1:8000/api/blog/posts/${slug}/`)
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo cargar el artículo");
        return res.json();
      })
      .then((data) => {
        setFormData({
          title: data.title,
          slug: data.slug,
          content: data.content,
          is_published: data.is_published,
          author: data.author,
          category: data.category || "",
        });
        setCurrentImage(data.image);
        setInitialLoading(false);
      })
      .catch(() => {
        setError("Error al cargar el artículo.");
        setInitialLoading(false);
      });
  }, [slug]);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "blockquote"],
      ["clean"],
    ],
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("slug", formData.slug);
    data.append("content", formData.content);
    data.append("is_published", formData.is_published);
    data.append("author", formData.author);
    data.append("category", formData.category);

    if (imageFile) {
      data.append("image", imageFile);
    }

    fetch(`http://127.0.0.1:8000/api/blog/posts/${slug}/`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: data,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Error al actualizar el post");
        return res.json();
      })
      .then((data) => {
        setLoading(false);
        navigate(`/blog/${data.slug}`);
      })
      .catch(() => {
        setError("Error al guardar los cambios.");
        setLoading(false);
      });
  };

  // --- VARIABLES DE ESTILO AURA ---
  const inputStyles =
    "w-full bg-white/60 border border-purple-50 rounded-2xl px-6 py-4 text-aura-plum font-medium focus:ring-4 focus:ring-purple-100 outline-none transition-all";
  const labelStyles =
    "block text-[10px] font-bold text-purple-400 mb-2 uppercase tracking-[0.2em] ml-2";
  const pearlBtn =
    "w-full bg-gradient-to-r from-purple-100 via-white to-fuchsia-100 border border-white/60 shadow-pearl text-aura-plum py-5 rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg";

  if (initialLoading)
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-aura-lavender">
        <div className="w-12 h-12 border-4 border-purple-100 border-t-aura-plum rounded-full animate-spin mb-4"></div>
        <p className="font-serif italic text-aura-plum">
          Preparando el editor...
        </p>
      </div>
    );

  return (
    <div className="bg-aura-lavender min-h-screen pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* ENCABEZADO */}
        <div className="flex items-center gap-6 mb-12">
          <Link
            to={`/blog/${slug}`}
            className="p-3 bg-white rounded-full text-purple-300 hover:text-aura-plum shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">
              arrow_back
            </span>
          </Link>
          <h1 className="text-5xl font-serif text-aura-plum tracking-tight">
            Editar Historia
          </h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-400 p-6 rounded-[2rem] mb-8 flex items-center gap-3">
            <span className="material-symbols-outlined">error</span>
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white/40 backdrop-blur-md p-10 md:p-16 rounded-[4rem] border border-white shadow-pearl space-y-10"
        >
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className={labelStyles}>Título</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className={inputStyles + " text-xl font-serif italic"}
              />
            </div>
            <div className="space-y-2">
              <label className={labelStyles}>Autor</label>
              <input
                type="text"
                required
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                className={inputStyles}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className={labelStyles}>Categoría</label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className={inputStyles + " cursor-pointer appearance-none"}
              >
                <option value="">General</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className={labelStyles}>Imagen de Portada</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full opacity-0 absolute inset-0 cursor-pointer z-10"
                />
                <div
                  className={
                    inputStyles +
                    " flex items-center gap-3 " +
                    (imageFile ? "text-aura-plum" : "text-purple-200")
                  }
                >
                  <span className="material-symbols-outlined">refresh</span>
                  <span className="text-sm truncate">
                    {imageFile
                      ? imageFile.name
                      : currentImage
                        ? "Cambiar imagen actual"
                        : "Subir imagen..."}
                  </span>
                </div>
              </div>
              {currentImage && !imageFile && (
                <div className="mt-4 px-4 py-2 bg-white/50 rounded-xl border border-purple-50 flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs text-purple-300">
                    image
                  </span>
                  <span className="text-[10px] uppercase font-bold text-purple-300 tracking-widest">
                    Imagen actual conservada
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <label className={labelStyles}>Contenido</label>
            <div className="rounded-[2.5rem] border border-purple-50 overflow-hidden bg-white min-h-[400px]">
              <ReactQuill
                theme="snow"
                value={formData.content}
                onChange={(val) => setFormData({ ...formData, content: val })}
                modules={modules}
                className="h-full border-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 bg-white/80 p-8 rounded-[2.5rem] border border-purple-50">
            <div className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formData.is_published}
                onChange={(e) =>
                  setFormData({ ...formData, is_published: e.target.checked })
                }
              />
              <div className="w-11 h-6 bg-purple-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-aura-plum"></div>
            </div>
            <div>
              <p className="text-aura-plum font-bold text-sm">
                Estado de publicación
              </p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                Marcar para que el post sea visible
              </p>
            </div>
          </div>

          <button type="submit" disabled={loading} className={pearlBtn}>
            {loading ? "Actualizando..." : "Guardar Cambios"}
          </button>
        </form>
      </div>
    </div>
  );
}
