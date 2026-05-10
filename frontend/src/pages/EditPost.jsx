import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

export default function EditPost() {
  const { slug } = useParams(); // Sacamos el slug de la URL para saber qué post editar
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // Para el spinner de carga inicial
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  // Estado del formulario
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    is_published: false,
    author: "",
    category: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState(null); // Para mostrar la imagen que ya tiene

  const token = localStorage.getItem("access_token");

  // 1. Cargar las categorías y los datos del Post al entrar
  useEffect(() => {
    // Cargar categorías
    fetch("http://127.0.0.1:8000/api/bookings/categories/")
      .then((res) => res.json())
      .then((data) =>
        setCategories(Array.isArray(data) ? data : data.results || []),
      )
      .catch(console.error);

    // Cargar los datos del post a editar
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
          category: data.category || "", // Si es null, lo dejamos vacío
        });
        setCurrentImage(data.image);
        setInitialLoading(false);
      })
      .catch((err) => {
        setError("Error al cargar el artículo.");
        setInitialLoading(false);
      });
  }, [slug]);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "blockquote", "code-block"],
      ["clean"],
    ],
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = new FormData();
    data.append("title", formData.title);
    // Nota: A veces es mejor no dejar cambiar el slug en edición para no romper links viejos,
    // pero si lo quieres enviar, lo dejamos:
    data.append("slug", formData.slug);
    data.append("content", formData.content);
    data.append("is_published", formData.is_published);
    data.append("author", formData.author);

    // Si tiene categoría la enviamos, si la quitaron enviamos vacío para que Django ponga null
    data.append("category", formData.category);

    // Solo enviamos la imagen si el usuario ha seleccionado una nueva
    if (imageFile) {
      data.append("image", imageFile);
    }

    // OJO: Usamos PATCH en lugar de POST para actualizar parcialmente
    fetch(`http://127.0.0.1:8000/api/blog/posts/${slug}/`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: data,
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json();
          console.error("Detalles del error:", errData);
          throw new Error("Error al actualizar el post");
        }
        return res.json();
      })
      .then((data) => {
        setLoading(false);
        navigate(`/blog/${data.slug}`); // Volvemos a ver el artículo actualizado
      })
      .catch((err) => {
        setError("Error al guardar los cambios.");
        setLoading(false);
      });
  };

  if (initialLoading) {
    return (
      <div className="text-center p-20 font-bold text-xl text-[#181411]">
        Cargando editor...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 font-display">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to={`/blog/${slug}`}
          className="text-gray-400 hover:text-[#f48c25] transition-colors"
        >
          <span className="material-symbols-outlined text-3xl">arrow_back</span>
        </Link>
        <h1 className="text-4xl font-black text-[#181411]">Editar Artículo</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 font-bold">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8"
      >
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
              Título
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-[#181411] text-xl font-bold focus:ring-2 focus:ring-[#f48c25] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
              Autor / Créditos
            </label>
            <input
              type="text"
              required
              value={formData.author}
              onChange={(e) =>
                setFormData({ ...formData, author: e.target.value })
              }
              className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-[#181411] text-xl font-bold focus:ring-2 focus:ring-[#f48c25] outline-none"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
              Categoría (Opcional)
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-[#181411] font-bold focus:ring-2 focus:ring-[#f48c25] outline-none cursor-pointer"
            >
              <option value="">Ninguna / General</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
              Actualizar Imagen
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="w-full bg-gray-50 rounded-2xl px-6 py-4 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#181411] file:text-white hover:file:bg-gray-800 cursor-pointer"
            />
            {currentImage && !imageFile && (
              <p className="text-xs text-gray-400 mt-2 font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">image</span>
                Imagen actual guardada
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
            Contenido del artículo
          </label>
          <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <ReactQuill
              theme="snow"
              value={formData.content}
              onChange={(value) => setFormData({ ...formData, content: value })}
              modules={modules}
              className="bg-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 bg-orange-50 p-6 rounded-2xl border border-orange-100">
          <input
            type="checkbox"
            className="w-5 h-5 accent-[#f48c25] cursor-pointer"
            checked={formData.is_published}
            onChange={(e) =>
              setFormData({ ...formData, is_published: e.target.checked })
            }
          />
          <span className="font-bold text-[#181411]">
            Publicado (Visible para todos)
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#181411] text-white py-5 rounded-2xl font-black text-lg hover:bg-[#f48c25] transition-colors"
        >
          {loading ? "Actualizando..." : "Actualizar Artículo"}
        </button>
      </form>
    </div>
  );
}
