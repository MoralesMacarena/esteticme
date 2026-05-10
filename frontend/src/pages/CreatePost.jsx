import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

export default function CreatePost() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]); // <-- Estado para las categorías

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    is_published: false,
    author: "Equipo EsteticMe", // <-- Valor por defecto
    category: "", // <-- Categoría vacía por defecto (opcional)
  });
  const [imageFile, setImageFile] = useState(null);

  // Cargar las categorías al entrar a la página
  useEffect(() => {
    // OJO: Asegúrate de que esta es la URL donde tu app devuelve las categorías de los servicios
    fetch("http://127.0.0.1:8000/api/bookings/categorias/")
      .then((res) => {
        if (!res.ok) throw new Error("No se pudieron cargar las categorías");
        return res.json();
      })
      .then((data) => {
        setCategories(Array.isArray(data) ? data : data.results || []);
      })
      .catch((err) => console.error(err));
  }, []);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "blockquote", "code-block"],
      ["clean"],
    ],
  };

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setFormData({
      ...formData,
      title: newTitle,
      slug: generateSlug(newTitle),
    });
  };

  const handleContentChange = (value) => {
    setFormData({ ...formData, content: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("access_token");
    const data = new FormData();
    data.append("title", formData.title);
    data.append("slug", formData.slug);
    data.append("content", formData.content);
    data.append("is_published", formData.is_published);
    data.append("author", formData.author); // <-- Enviamos el autor

    // Solo enviamos la categoría si el usuario seleccionó una
    if (formData.category) {
      data.append("category", formData.category);
    }

    if (imageFile) {
      data.append("image", imageFile); // <-- ¡Ya con el nombre correcto!
    }

    fetch("http://127.0.0.1:8000/api/blog/posts/", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: data,
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json();
          console.error("Detalles del error:", errData);
          throw new Error("Error al crear el post");
        }
        return res.json();
      })
      .then((data) => {
        setLoading(false);
        navigate(`/blog/`);
      })
      .catch((err) => {
        setError(
          "Error al guardar. Revisa que el slug no esté repetido o falten campos.",
        );
        setLoading(false);
      });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 font-display">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/admin-dashboard"
          className="text-gray-400 hover:text-[#f48c25]"
        >
          <span className="material-symbols-outlined text-3xl">arrow_back</span>
        </Link>
        <h1 className="text-4xl font-black text-[#181411]">Nuevo Artículo</h1>
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
        {/* FILA: Título y Autor */}
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
              Título
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={handleTitleChange}
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

        {/* FILA: Categoría e Imagen */}
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
              Imagen de Portada
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="w-full bg-gray-50 rounded-2xl px-6 py-4 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#181411] file:text-white hover:file:bg-gray-800 cursor-pointer"
            />
          </div>
        </div>

        {/* CONTENIDO (Editor Enriquecido) */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
            Contenido del artículo
          </label>
          <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <ReactQuill
              theme="snow"
              value={formData.content}
              onChange={handleContentChange}
              modules={modules}
              placeholder="Escribe aquí tu historia..."
              className="bg-white"
            />
          </div>
        </div>

        {/* Toggle Publicar */}
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
            Publicar inmediatamente
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#181411] text-white py-5 rounded-2xl font-black text-lg hover:bg-[#f48c25] transition-colors"
        >
          {loading ? "Guardando..." : "Guardar Artículo"}
        </button>
      </form>
    </div>
  );
}
