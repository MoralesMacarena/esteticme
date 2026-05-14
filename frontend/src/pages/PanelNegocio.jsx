import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function PanelNegocio() {
  const BACKEND_URL = "http://127.0.0.1:8000";

  // 1. ESTADOS TEXTOS
  const [formData, setFormData] = useState({
    business_name: "",
    business_address: "",
    phone: "",
    description: "",
  });

  // 2. ESTADOS FOTO PRINCIPAL
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [removeMainImage, setRemoveMainImage] = useState(false);

  // 3. ESTADOS GALERÍA (Lógica intacta)
  const [existingGallery, setExistingGallery] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [newGalleryFiles, setNewGalleryFiles] = useState([]);
  const [newGalleryPreviews, setNewGalleryPreviews] = useState([]);

  // 4. ESTADOS UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("access_token");
      try {
        const response = await fetch(`${BACKEND_URL}/api/users/profiles/me/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setFormData({
            business_name: data.business_name || "",
            business_address: data.business_address || "",
            phone: data.phone || "",
            description: data.description || "",
          });

          // Foto principal
          if (data.salon_picture) {
            const imageUrl = data.salon_picture.startsWith("http")
              ? data.salon_picture
              : `${BACKEND_URL}${data.salon_picture}`;
            setPreviewImage(imageUrl);
          }

          // Galería existente
          if (data.gallery_images && Array.isArray(data.gallery_images)) {
            const formattedGallery = data.gallery_images.map((img) => ({
              id: img.id,
              url: img.image.startsWith("http")
                ? img.image
                : `${BACKEND_URL}${img.image}`,
            }));
            setExistingGallery(formattedGallery);
          }
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // --- HANDLERS FOTO PRINCIPAL ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
      setRemoveMainImage(false);
    }
  };

  const handleRemoveMainPhoto = () => {
    setSelectedImage(null);
    setPreviewImage(null);
    setRemoveMainImage(true);
  };

  // --- HANDLERS GALERÍA ---
  const handleRemoveExistingImage = (imageId) => {
    setImagesToDelete([...imagesToDelete, imageId]);
    setExistingGallery(existingGallery.filter((img) => img.id !== imageId));
  };

  const handleAddGalleryImages = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setNewGalleryFiles((prev) => [...prev, ...files]);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setNewGalleryPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveNewImage = (indexToRemove) => {
    setNewGalleryFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
    setNewGalleryPreviews((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem("access_token");

    const data = new FormData();
    data.append("business_name", formData.business_name);
    data.append("business_address", formData.business_address);
    data.append("phone", formData.phone);
    data.append("description", formData.description);

    if (selectedImage) {
      data.append("salon_picture", selectedImage);
    } else if (removeMainImage) {
      data.append("salon_picture", "");
    }

    newGalleryFiles.forEach((image) => {
      data.append("gallery_images", image);
    });

    imagesToDelete.forEach((id) => {
      data.append("delete_gallery_images", id);
    });

    try {
      const response = await fetch(`${BACKEND_URL}/api/users/profiles/me/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      if (response.ok) {
        const responseData = await response.json();
        setShowSuccessModal(true);
        setNewGalleryFiles([]);
        setNewGalleryPreviews([]);
        setImagesToDelete([]);
        setRemoveMainImage(false);

        if (responseData.gallery_images) {
          const formattedGallery = responseData.gallery_images.map((img) => ({
            id: img.id,
            url: img.image.startsWith("http")
              ? img.image
              : `${BACKEND_URL}${img.image}`,
          }));
          setExistingGallery(formattedGallery);
        }
      } else {
        alert("Hubo un error al guardar los datos.");
      }
    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      setSaving(false);
    }
  };

  // --- VARIABLES DE ESTILO AURA ---
  const inputStyles =
    "w-full bg-white/80 border border-purple-100 rounded-2xl px-6 py-4 text-aura-plum font-medium focus:ring-4 focus:ring-purple-100 outline-none transition-all";
  const labelStyles =
    "block text-[11px] font-black text-aura-plum/60 mb-2 uppercase tracking-widest ml-2";
  const pearlBtn =
    "w-full bg-gradient-to-r from-purple-100 via-white to-fuchsia-100 border border-white/60 shadow-pearl text-aura-plum py-5 rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center disabled:opacity-50 disabled:grayscale";

  if (loading)
    return (
      <div className="min-h-screen bg-aura-lavender flex flex-col justify-center items-center gap-4">
        <div className="w-12 h-12 border-4 border-aura-plum border-t-transparent rounded-full animate-spin"></div>
        <div className="animate-pulse text-aura-plum font-serif italic text-xl">
          Cargando panel...
        </div>
      </div>
    );

  return (
    <div className="bg-aura-lavender min-h-screen p-8 relative overflow-hidden">
      {/* Decoración de fondo */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <Link
          to="/panel"
          className="text-sm font-bold text-aura-plum/60 hover:text-aura-plum flex items-center gap-1 mb-8 w-fit transition-colors bg-white/40 px-4 py-2 rounded-xl border border-white/60 shadow-sm"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Volver al Panel Principal
        </Link>

        <h1 className="text-4xl font-serif mb-10 text-aura-plum tracking-tight">
          Mi Negocio
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white/60 backdrop-blur-xl rounded-[3rem] shadow-pearl border border-white p-10 space-y-10"
        >
          {/* FOTO PRINCIPAL */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 pb-10 border-b border-purple-50">
            <div className="size-36 rounded-[2rem] bg-purple-50 overflow-hidden border border-purple-100 flex items-center justify-center shrink-0 relative group shadow-inner">
              {previewImage ? (
                <>
                  <img
                    src={previewImage}
                    className="w-full h-full object-cover"
                    alt="Perfil del Salón"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveMainPhoto}
                    className="absolute inset-0 bg-aura-plum/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]"
                    title="Eliminar foto"
                  >
                    <span className="material-symbols-outlined text-3xl mb-1">
                      delete
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Borrar
                    </span>
                  </button>
                </>
              ) : (
                <span className="material-symbols-outlined text-purple-200 text-5xl">
                  storefront
                </span>
              )}
            </div>
            <div>
              <h3 className="font-serif text-2xl text-aura-plum mb-2">
                Foto Principal
              </h3>
              <p className="text-sm text-gray-500 font-light italic mb-4 max-w-sm">
                Esta es la foto que verán los clientes al buscar tu salón.
                Intenta que sea luminosa.
              </p>
              <label className="bg-white border border-purple-100 text-aura-plum px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer hover:bg-purple-50 transition-colors inline-block shadow-sm">
                Subir Foto
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>

          {/* GALERÍA COMPLETA */}
          <div className="pb-10 border-b border-purple-50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h3 className="font-serif text-2xl text-aura-plum mb-1">
                  Galería de Trabajos
                </h3>
                <p className="text-sm text-gray-500 font-light italic">
                  Muestra tu local y tus mejores servicios.
                </p>
              </div>
              <label className="bg-aura-plum text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer hover:scale-105 transition-all shadow-md">
                + Añadir Fotos
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleAddGalleryImages}
                />
              </label>
            </div>

            {/* FOTOS ACTUALES DE LA BASE DE DATOS */}
            {existingGallery.length > 0 && (
              <div className="mb-8">
                <p className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">
                    cloud_done
                  </span>
                  Fotos Públicas ({existingGallery.length})
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {existingGallery.map((img) => (
                    <div
                      key={img.id}
                      className="relative aspect-square rounded-[1.5rem] overflow-hidden group border border-purple-100 shadow-sm"
                    >
                      <img
                        src={img.url}
                        alt={`Galería ${img.id}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(img.id)}
                        className="absolute inset-0 bg-aura-plum/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]"
                      >
                        <span className="material-symbols-outlined text-white text-3xl mb-1">
                          delete
                        </span>
                        <span className="text-white text-[10px] font-black uppercase tracking-widest">
                          Borrar
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FOTOS NUEVAS PENDIENTES DE GUARDAR */}
            {newGalleryPreviews.length > 0 && (
              <div className="mt-8 p-6 bg-purple-50/50 border border-purple-100 rounded-3xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-aura-plum mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">
                    upload
                  </span>
                  Pendientes de guardar ({newGalleryPreviews.length})
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {newGalleryPreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-[1.5rem] overflow-hidden group border-2 border-dashed border-aura-plum/40 bg-white"
                    >
                      <img
                        src={preview}
                        alt={`Preview Nueva ${index}`}
                        className="w-full h-full object-cover opacity-80"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(index)}
                        className="absolute top-2 right-2 size-8 bg-red-400 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-500 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">
                          close
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {existingGallery.length === 0 &&
              newGalleryPreviews.length === 0 && (
                <div className="bg-white/40 border border-dashed border-purple-200 rounded-[2rem] p-10 text-center">
                  <span className="material-symbols-outlined text-purple-200 text-5xl mb-3">
                    photo_library
                  </span>
                  <p className="text-aura-plum font-serif italic text-lg">
                    Tu galería está vacía. <br />
                    Sube fotos para enamorar a tus clientes.
                  </p>
                </div>
              )}
          </div>

          {/* CAMPOS DE TEXTO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col">
              <label className={labelStyles}>Nombre del Salón</label>
              <input
                type="text"
                value={formData.business_name}
                onChange={(e) =>
                  setFormData({ ...formData, business_name: e.target.value })
                }
                className={inputStyles}
              />
            </div>
            <div className="flex flex-col">
              <label className={labelStyles}>Teléfono</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className={inputStyles}
              />
            </div>
            <div className="md:col-span-2 flex flex-col">
              <label className={labelStyles}>Dirección</label>
              <input
                type="text"
                value={formData.business_address}
                onChange={(e) =>
                  setFormData({ ...formData, business_address: e.target.value })
                }
                className={inputStyles}
              />
            </div>
            <div className="md:col-span-2 flex flex-col">
              <label className={labelStyles}>Descripción</label>
              <textarea
                rows="4"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className={`${inputStyles} resize-none leading-relaxed`}
              />
            </div>
          </div>

          <button type="submit" disabled={saving} className={pearlBtn}>
            {saving ? (
              <div className="size-6 border-2 border-aura-plum border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Guardar Cambios"
            )}
          </button>
        </form>
      </div>

      {/* --- MODAL DE ÉXITO --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-aura-plum/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[3rem] border border-white shadow-2xl p-10 w-full max-w-sm flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
            <div className="w-24 h-24 bg-green-50 text-green-400 rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-6xl">
                check_circle
              </span>
            </div>
            <h3 className="text-2xl font-serif text-aura-plum mb-3">
              ¡Guardado con éxito!
            </h3>
            <p className="text-gray-500 font-light italic mb-8">
              Tu escaparate se ha actualizado correctamente.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-aura-plum text-white py-4 rounded-2xl font-bold hover:scale-[1.02] transition-all shadow-md"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
