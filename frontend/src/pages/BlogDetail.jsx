import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

export default function BlogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
  const [commentToDeleteId, setCommentToDeleteId] = useState(null);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const token = localStorage.getItem("access_token");
  const isAdmin = localStorage.getItem("user_role") === "admin";

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
      .catch(() => setLoading(false));

    if (token) {
      fetch("http://127.0.0.1:8000/api/users/profiles/me/", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) setCurrentUser(data);
        });
    }
  }, [slug, token]);

  const confirmDeletePost = () => {
    setIsDeleting(true);
    fetch(`http://127.0.0.1:8000/api/blog/posts/${slug}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      if (res.ok || res.status === 204) navigate("/blog");
      else {
        setIsDeleting(false);
        setShowDeleteModal(false);
      }
    });
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommentLoading(true);
    fetch("http://127.0.0.1:8000/api/blog/comments/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ post: post.id, comment: newComment }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Error al publicar");
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

  const confirmDeleteComment = () => {
    if (!commentToDeleteId) return;
    setIsDeletingComment(true);
    fetch(`http://127.0.0.1:8000/api/blog/comments/${commentToDeleteId}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok || res.status === 204) {
          setPost({
            ...post,
            comments: post.comments.filter((c) => c.id !== commentToDeleteId),
            comment_count: post.comment_count - 1,
          });
          setShowDeleteCommentModal(false);
        }
      })
      .finally(() => setIsDeletingComment(false));
  };

  const pearlBtn =
    "bg-gradient-to-r from-purple-100 via-white to-fuchsia-100 border border-white/60 shadow-pearl text-aura-plum px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-all shadow-md";
  const adminBtn =
    "flex items-center gap-2 bg-white/50 backdrop-blur-sm text-aura-plum px-4 py-2 rounded-xl font-bold border border-purple-100 hover:bg-white transition-all text-xs uppercase tracking-widest";

  if (loading)
    return (
      <div className="text-center p-20 font-serif italic text-aura-plum text-2xl">
        Sincronizando con el Magazine...
      </div>
    );

  return (
    <div className="bg-aura-lavender min-h-screen font-sans relative pb-20 overflow-x-hidden">
      {/* HEADER POST */}
      <header className="max-w-4xl mx-auto px-6 pt-12">
        <div className="flex items-center justify-between mb-12">
          <Link
            to="/blog"
            className="flex items-center gap-2 text-purple-400 hover:text-aura-plum font-bold transition-colors uppercase text-xs tracking-widest"
          >
            <span className="material-symbols-outlined text-sm">
              arrow_back
            </span>{" "}
            Volver
          </Link>
          {isAdmin && (
            <div className="flex gap-3">
              <Link to={`/blog/${post.slug}/edit`} className={adminBtn}>
                <span className="material-symbols-outlined text-sm">edit</span>{" "}
                Editar
              </Link>
              <button
                onClick={() => setShowDeleteModal(true)}
                className={adminBtn + " text-red-400 border-red-50"}
              >
                <span className="material-symbols-outlined text-sm">
                  delete
                </span>{" "}
                Borrar
              </button>
            </div>
          )}
        </div>

        <div className="text-center mb-12">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-purple-400 bg-white px-5 py-2 rounded-full border border-purple-50 shadow-sm">
            {post.category_name || "Magazine"}
          </span>
          <h1 className="text-5xl md:text-7xl font-serif text-aura-plum mt-10 mb-8 leading-tight tracking-tight">
            {post.title}
          </h1>
          <p className="text-gray-400 font-light italic text-lg">
            Por{" "}
            <span className="text-aura-plum font-medium not-italic">
              {post.author}
            </span>{" "}
            •{" "}
            {new Date(post.created_at).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </header>

      {/* IMAGEN DESTACADA */}
      {post.image && (
        <div className="max-w-6xl mx-auto px-4 mb-20 flex justify-center">
          <img
            src={post.image}
            alt={post.title}
            className="w-full max-w-full h-auto max-h-[600px] object-cover rounded-[3rem] shadow-2xl border-8 border-white/50"
          />
        </div>
      )}

      {/* --- EL BLOQUE REPARADO --- */}
      <section className="w-full flex justify-center px-6">
        <article
          className="max-w-3xl w-full text-gray-600 text-lg leading-relaxed break-words overflow-hidden
            [&_*]:max-w-full
            [&_p]:mb-8 [&_p]:w-full [&_p]:block
            [&_h2]:text-3xl [&_h2]:font-serif [&_h2]:text-aura-plum [&_h2]:mt-14 [&_h2]:mb-6
            [&_blockquote]:border-l-4 [&_blockquote]:border-purple-200 [&_blockquote]:bg-white/50 [&_blockquote]:p-10 [&_blockquote]:italic [&_blockquote]:my-12 [&_blockquote]:rounded-r-[2rem] [&_blockquote]:text-aura-plum
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-8 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-8
            [&_img]:rounded-[2.5rem] [&_img]:my-12 [&_img]:shadow-xl [&_img]:h-auto [&_img]:w-full"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </section>

      {/* SECCIÓN COMENTARIOS */}
      <section className="max-w-4xl mx-auto px-6 mt-32">
        <div className="bg-white/40 backdrop-blur-xl p-10 md:p-16 rounded-[4rem] border border-white/60 shadow-pearl">
          <h3 className="text-4xl font-serif text-aura-plum mb-12 flex items-center gap-4">
            <span className="material-symbols-outlined text-purple-300 text-4xl">
              auto_stories
            </span>
            Conversaciones ({post.comment_count})
          </h3>

          {token ? (
            <form onSubmit={handleCommentSubmit} className="mb-20">
              <textarea
                required
                rows="4"
                placeholder="Comparte tu reflexión..."
                className="w-full bg-white/80 border border-purple-50 rounded-[2rem] p-8 text-aura-plum focus:ring-4 focus:ring-purple-100 outline-none transition-all resize-none mb-6 italic"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button
                type="submit"
                disabled={commentLoading}
                className={pearlBtn}
              >
                {commentLoading ? "Enviando..." : "Publicar Reflexión"}
              </button>
            </form>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-purple-100 rounded-[3rem] mb-12">
              <p className="text-gray-400 italic mb-6">
                Inicia sesión para participar en el magazine.
              </p>
              <Link
                to="/login"
                className="text-aura-plum font-bold uppercase tracking-widest text-xs border-b border-aura-plum pb-1"
              >
                Identificarse
              </Link>
            </div>
          )}

          <div className="space-y-10">
            {post.comments?.map((c) => {
              const isOwner = currentUser?.id === c.user;
              return (
                <div
                  key={c.id}
                  className="relative group bg-white/60 p-8 rounded-[2.5rem] border border-white hover:shadow-lg transition-all"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-aura-plum text-white rounded-2xl flex items-center justify-center font-serif text-xl shadow-lg">
                        {c.user_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-aura-plum">
                          {c.user_name}
                        </p>
                        <p className="text-[10px] text-purple-300 uppercase tracking-widest">
                          {new Date(c.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {(isAdmin || isOwner) && (
                      <button
                        onClick={() => {
                          setCommentToDeleteId(c.id);
                          setShowDeleteCommentModal(true);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"
                      >
                        <span className="material-symbols-outlined">
                          delete
                        </span>
                      </button>
                    )}
                  </div>
                  <p className="text-gray-600 leading-relaxed italic">
                    "{c.comment}"
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* MODALES */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-aura-plum/20 backdrop-blur-md p-6">
          <div className="bg-white rounded-[3rem] p-12 max-w-sm w-full shadow-2xl text-center border border-purple-50">
            <span className="material-symbols-outlined text-6xl text-red-200 mb-6 font-light">
              heart_broken
            </span>
            <h3 className="text-2xl font-serif text-aura-plum mb-4 italic">
              ¿Eliminar esta historia?
            </h3>
            <div className="flex flex-col gap-4">
              <button
                onClick={confirmDeletePost}
                disabled={isDeleting}
                className="w-full py-4 bg-red-400 text-white rounded-2xl font-bold hover:bg-red-500 transition-all"
              >
                {isDeleting ? "Borrando..." : "Confirmar Borrado"}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-full py-4 text-gray-400 font-bold"
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
