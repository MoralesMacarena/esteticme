import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

export default function BlogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados para la sección de comentarios
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState(null);

  // ESTADOS PARA EL MODAL DE BORRADO DE POST
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ESTADOS NUEVOS PARA EL MODAL DE BORRADO DE COMENTARIOS 👇
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
  const [commentToDeleteId, setCommentToDeleteId] = useState(null);
  const [isDeletingComment, setIsDeletingComment] = useState(false);

  const token = localStorage.getItem("access_token");

  // VERIFICACIÓN ADMIN Y USUARIO ACTUAL
  const isAdmin = localStorage.getItem("user_role") === "admin";
  const userStr = localStorage.getItem("user");
  const currentUser = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/blog/posts/${slug}/`)
      .then((res) => {
        if (!res.ok) throw new Error("Post no encontrado");
        return res.json();
      })
      .then((data) => {
        setPost(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  // --- FUNCIÓN PARA CONFIRMAR EL BORRADO DEL POST ---
  const confirmDeletePost = () => {
    setIsDeleting(true);

    fetch(`http://127.0.0.1:8000/api/blog/posts/${slug}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.ok || res.status === 204) {
          navigate("/blog"); // Si se borra, volvemos a la lista del blog
        } else {
          alert("Hubo un error al eliminar el artículo. Revisa tus permisos.");
          setIsDeleting(false);
          setShowDeleteModal(false);
        }
      })
      .catch((err) => {
        console.error("Error borrando:", err);
        setIsDeleting(false);
        setShowDeleteModal(false);
      });
  };

  // --- FUNCIÓN PARA COMENTAR ---
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentLoading(true);
    setCommentError(null);

    fetch("http://127.0.0.1:8000/api/blog/comments/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        post: post.id,
        comment: newComment,
      }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Error al publicar el comentario");
        return res.json();
      })
      .then((data) => {
        setPost({
          ...post,
          comments: [data, ...post.comments],
          comment_count: post.comment_count + 1,
        });
        setNewComment("");
        setCommentLoading(false);
      })
      .catch((err) => {
        setCommentError(err.message);
        setCommentLoading(false);
      });
  };

  // --- FUNCIÓN QUE SOLO ABRE EL MODAL DE COMENTARIOS ---
  const handleDeleteComment = (commentId) => {
    setCommentToDeleteId(commentId);
    setShowDeleteCommentModal(true);
  };

  // --- NUEVA FUNCIÓN QUE EJECUTA EL BORRADO REAL DEL COMENTARIO ---
  const confirmDeleteComment = () => {
    if (!commentToDeleteId) return;

    setIsDeletingComment(true);

    fetch(`http://127.0.0.1:8000/api/blog/comments/${commentToDeleteId}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.ok || res.status === 204) {
          // Actualizamos el estado local
          setPost({
            ...post,
            comments: post.comments.filter((c) => c.id !== commentToDeleteId),
            comment_count: post.comment_count - 1,
          });
          // Cerramos modal y limpiamos ID
          setShowDeleteCommentModal(false);
          setCommentToDeleteId(null);
        } else {
          alert("No tienes permiso para borrar este comentario.");
        }
      })
      .catch((err) => console.error("Error borrando comentario:", err))
      .finally(() => {
        setIsDeletingComment(false);
      });
  };

  if (loading)
    return (
      <div className="text-center p-20 font-bold text-xl">
        Cargando artículo...
      </div>
    );
  if (!post)
    return (
      <div className="text-center p-20 font-bold text-xl text-red-500">
        Artículo no encontrado
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 font-display relative">
      {/* BARRA SUPERIOR: Volver + Acciones Admin */}
      <div className="flex items-center justify-between mb-8">
        <Link
          to="/blog"
          className="flex items-center gap-2 text-gray-400 hover:text-[#f48c25] font-bold transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Volver al Blog
        </Link>

        {/* SOLO VISIBLE PARA ADMINS */}
        {isAdmin && (
          <div className="flex items-center gap-3">
            <Link
              to={`/blog/${post.slug}/edit`}
              className="flex items-center gap-2 bg-gray-100 text-[#181411] px-5 py-2 rounded-xl font-bold hover:bg-gray-200 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              Editar
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 bg-red-50 text-red-600 px-5 py-2 rounded-xl font-bold hover:bg-red-100 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">delete</span>
              Borrar
            </button>
          </div>
        )}
      </div>

      {/* Cabecera del Artículo */}
      <div className="mb-10 text-center">
        <span className="text-[#f48c25] font-black uppercase text-sm tracking-widest bg-orange-50 px-4 py-2 rounded-full">
          {post.category_name || "General"}
        </span>
        <h1 className="text-4xl md:text-6xl font-black mt-8 mb-6 text-[#181411] leading-tight tracking-tighter">
          {post.title}
        </h1>
        <div className="text-gray-500 font-medium">
          Escrito por{" "}
          <span className="text-[#181411] font-bold">{post.author}</span> •{" "}
          {new Date(post.created_at).toLocaleDateString()}
        </div>
      </div>

      {/* Imagen Principal */}
      {post.image && (
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-[300px] md:h-[500px] object-cover rounded-[2.5rem] mb-16 shadow-xl"
        />
      )}

      {/* CONTENIDO DEL POST ENCAPSULADO Y ESTILIZADO */}
      <div
        className="max-w-3xl mx-auto w-full text-gray-700 text-lg leading-relaxed break-words
          [&>p]:mb-6 
          [&_h1]:text-4xl [&_h1]:font-black [&_h1]:text-[#181411] [&_h1]:mt-10 [&_h1]:mb-6 
          [&_h2]:text-3xl [&_h2]:font-black [&_h2]:text-[#181411] [&_h2]:mt-10 [&_h2]:mb-4 
          [&_h3]:text-2xl [&_h3]:font-black [&_h3]:text-[#181411] [&_h3]:mt-8 [&_h3]:mb-4 
          [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6 [&_ul>li]:mb-2 
          [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-6 [&_ol>li]:mb-2 
          [&_blockquote]:border-l-4 [&_blockquote]:border-[#f48c25] [&_blockquote]:bg-orange-50/50 [&_blockquote]:p-6 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:my-8 [&_blockquote]:rounded-r-2xl
          [&_a]:text-[#f48c25] [&_a]:underline [&_a]:font-bold hover:[&_a]:text-orange-600
          [&_img]:rounded-3xl [&_img]:my-10 [&_img]:w-full [&_img]:shadow-lg"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      <hr className="my-20 border-gray-100" />

      {/* SECCIÓN DE COMENTARIOS */}
      <div className="bg-gray-50 p-8 md:p-12 rounded-[3rem]">
        <h3 className="text-3xl font-black mb-8 flex items-center gap-3 text-[#181411] tracking-tighter">
          <span className="material-symbols-outlined text-[#f48c25] text-4xl">
            forum
          </span>
          Comentarios ({post.comment_count})
        </h3>

        {token ? (
          <form onSubmit={handleCommentSubmit} className="mb-12">
            <textarea
              required
              rows="3"
              placeholder="¿Qué te ha parecido el artículo? ¡Déjanos tu opinión!"
              className="w-full bg-white border-none rounded-3xl p-6 text-[#181411] focus:ring-2 focus:ring-[#f48c25] outline-none shadow-sm resize-none mb-4"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            ></textarea>

            {commentError && (
              <p className="text-red-500 font-bold mb-4">{commentError}</p>
            )}

            <button
              type="submit"
              disabled={commentLoading}
              className="bg-[#181411] text-white px-8 py-4 rounded-2xl font-black hover:bg-[#f48c25] transition-colors disabled:opacity-50"
            >
              {commentLoading ? "Publicando..." : "Publicar comentario"}
            </button>
          </form>
        ) : (
          <div className="bg-white p-6 rounded-3xl border border-gray-100 text-center mb-12 shadow-sm">
            <p className="text-gray-500 font-medium mb-4">
              Debes iniciar sesión para poder comentar.
            </p>
            <Link
              to="/login"
              className="inline-block bg-orange-100 text-[#f48c25] px-6 py-3 rounded-xl font-bold hover:bg-orange-200 transition-colors"
            >
              Iniciar Sesión
            </Link>
          </div>
        )}

        <div className="space-y-8">
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((c) => {
              // Comprobamos si el usuario logueado es el dueño de ESTE comentario
              const isOwner = currentUser && currentUser.id === c.user;

              return (
                <div
                  key={c.id}
                  className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-50 group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 text-[#f48c25] rounded-full flex items-center justify-center font-black text-lg">
                        {c.user_name
                          ? c.user_name.charAt(0).toUpperCase()
                          : "U"}
                      </div>
                      <div>
                        <p className="font-bold text-[#181411]">
                          {c.user_name || "Usuario"}
                        </p>
                        <p className="text-xs text-gray-400 font-medium">
                          {new Date(c.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* BOTÓN DE BORRAR (Solo visible para Admin o el dueño del comentario) */}
                    {(isAdmin || isOwner) && (
                      <button
                        onClick={() => handleDeleteComment(c.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-500 p-2"
                        title="Borrar comentario"
                      >
                        <span className="material-symbols-outlined text-xl">
                          delete
                        </span>
                      </button>
                    )}
                  </div>
                  <p className="text-gray-600 leading-relaxed">{c.comment}</p>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-400 font-medium py-8 italic">
              Aún no hay comentarios. ¡Sé la primera en opinar!
            </p>
          )}
        </div>
      </div>

      {/* =========================================
          MODAL DE CONFIRMACIÓN DE BORRADO DE POST 🚨
          ========================================= */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#181411]/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl transform transition-all">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl">
                delete_forever
              </span>
            </div>

            <h3 className="text-3xl font-black text-center text-[#181411] mb-4 tracking-tight">
              ¿Eliminar artículo?
            </h3>

            <p className="text-gray-500 text-center mb-10 leading-relaxed">
              Estás a punto de borrar permanentemente{" "}
              <span className="font-bold text-[#181411]">"{post.title}"</span>.
              Esta acción no se puede deshacer.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={confirmDeletePost}
                disabled={isDeleting}
                className="w-full bg-red-500 text-white py-4 rounded-2xl font-black hover:bg-red-600 transition-colors disabled:opacity-50 flex justify-center items-center"
              >
                {isDeleting ? "Eliminando..." : "Sí, eliminar artículo"}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="w-full bg-gray-50 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          MODAL DE CONFIRMACIÓN DE BORRADO DE COMENTARIO 🚨
          ========================================= */}
      {showDeleteCommentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#181411]/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl transform transition-all">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl">delete</span>
            </div>

            <h3 className="text-3xl font-black text-center text-[#181411] mb-4 tracking-tight">
              ¿Eliminar comentario?
            </h3>

            <p className="text-gray-500 text-center mb-10 leading-relaxed">
              ¿Estás segura de que quieres eliminar este comentario? Esta acción
              no se puede deshacer.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={confirmDeleteComment}
                disabled={isDeletingComment}
                className="w-full bg-red-500 text-white py-4 rounded-2xl font-black hover:bg-red-600 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isDeletingComment
                  ? "Eliminando..."
                  : "Sí, eliminar comentario"}
              </button>
              <button
                onClick={() => {
                  setShowDeleteCommentModal(false);
                  setCommentToDeleteId(null);
                }}
                disabled={isDeletingComment}
                className="w-full bg-gray-50 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
