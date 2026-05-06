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

  // 3. ESTADOS GALERÍA (¡La magia para borrar y subir a la vez!)
  const [existingGallery, setExistingGallery] = useState([]); // Fotos de la BBDD
  const [imagesToDelete, setImagesToDelete] = useState([]); // IDs de fotos a borrar en BBDD

  const [newGalleryFiles, setNewGalleryFiles] = useState([]); // Archivos nuevos seleccionados
  const [newGalleryPreviews, setNewGalleryPreviews] = useState([]); // Previews locales

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

          // Foto principal (arreglamos la ruta)
          if (data.salon_picture) {
            const imageUrl = data.salon_picture.startsWith("http")
              ? data.salon_picture
              : `${BACKEND_URL}${data.salon_picture}`;
            setPreviewImage(imageUrl);
          }

          // Galería existente (arreglamos las rutas)
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
  // Borrar foto que ya existe en la base de datos
  const handleRemoveExistingImage = (imageId) => {
    setImagesToDelete([...imagesToDelete, imageId]);
    setExistingGallery(existingGallery.filter((img) => img.id !== imageId));
  };

  // Añadir fotos nuevas
  const handleAddGalleryImages = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setNewGalleryFiles((prev) => [...prev, ...files]);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setNewGalleryPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  // Borrar foto nueva antes de guardarla
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

    // Foto principal
    if (selectedImage) {
      data.append("salon_picture", selectedImage);
    } else if (removeMainImage) {
      data.append("salon_picture", "");
    }

    // Galería: Fotos nuevas a subir
    newGalleryFiles.forEach((image) => {
      data.append("gallery_images", image);
    });

    // Galería: IDs de fotos antiguas a borrar
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
        // Limpiar estados de guardado
        setNewGalleryFiles([]);
        setNewGalleryPreviews([]);
        setImagesToDelete([]);
        setRemoveMainImage(false);

        // Actualizar la galería existente con lo que devuelve el servidor
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

  if (loading)
    return <div className="p-8 text-center animate-pulse">Cargando...</div>;

  return (
    <div className="bg-gray-50 min-h-screen p-8 relative">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/panel"
          className="text-sm font-bold text-gray-500 hover:text-[#f48c25] flex items-center gap-1 mb-6 w-fit"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Volver al Panel Principal
        </Link>

        <h1 className="text-3xl font-black mb-8 text-[#181411]">Mi Negocio</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8"
        >
          {/* FOTO PRINCIPAL */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-8 border-b border-gray-100">
            <div className="size-32 rounded-2xl bg-gray-100 overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center shrink-0 relative group">
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
                    className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Eliminar foto"
                  >
                    <span className="material-symbols-outlined text-3xl">
                      delete
                    </span>
                  </button>
                </>
              ) : (
                <span className="material-symbols-outlined text-gray-400 text-4xl">
                  storefront
                </span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#181411] mb-1">
                Foto Principal
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                Esta es la foto que verán los clientes al buscar tu salón.
              </p>
              <label className="bg-[#181411] text-white px-4 py-2 rounded-lg text-sm font-bold cursor-pointer hover:bg-gray-800 transition-colors inline-block">
                Subir Foto Principal
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
          <div className="pb-8 border-b border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-lg text-[#181411]">
                  Galería de Trabajos
                </h3>
                <p className="text-xs text-gray-500">
                  Muestra tu local y tus mejores servicios.
                </p>
              </div>
              <label className="bg-gray-100 text-[#181411] border border-gray-300 px-4 py-2 rounded-lg text-sm font-bold cursor-pointer hover:bg-gray-200 transition-colors">
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
              <div className="mb-6">
                <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#f48c25] text-lg">
                    cloud_done
                  </span>
                  Fotos Públicas ({existingGallery.length})
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {existingGallery.map((img) => (
                    <div
                      key={img.id}
                      className="relative aspect-square rounded-xl overflow-hidden group border border-gray-200"
                    >
                      <img
                        src={img.url}
                        alt={`Galería ${img.id}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(img.id)}
                        className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="material-symbols-outlined text-white text-3xl mb-1">
                          delete
                        </span>
                        <span className="text-white text-xs font-bold">
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
              <div className="mt-6 p-4 bg-orange-50 border border-orange-100 rounded-xl">
                <p className="text-sm font-bold text-[#f48c25] mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">
                    upload
                  </span>
                  Nuevas fotos pendientes de guardar (
                  {newGalleryPreviews.length})
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {newGalleryPreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-xl overflow-hidden group border-2 border-dashed border-[#f48c25]"
                    >
                      <img
                        src={preview}
                        alt={`Preview Nueva ${index}`}
                        className="w-full h-full object-cover opacity-80"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-100 shadow-md flex items-center justify-center"
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
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                  <span className="material-symbols-outlined text-gray-400 text-3xl mb-2">
                    photo_library
                  </span>
                  <p className="text-sm font-medium text-gray-500">
                    Tu galería está vacía. Sube algunas fotos para atraer
                    clientes.
                  </p>
                </div>
              )}
          </div>

          {/* CAMPOS DE TEXTO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-600">
                Nombre del Salón
              </label>
              <input
                type="text"
                value={formData.business_name}
                onChange={(e) =>
                  setFormData({ ...formData, business_name: e.target.value })
                }
                className="border border-gray-200 p-3 rounded-xl focus:border-[#f48c25] outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-600">
                Teléfono
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="border border-gray-200 p-3 rounded-xl focus:border-[#f48c25] outline-none"
              />
            </div>
            <div className="md:col-span-2 flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-600">
                Dirección
              </label>
              <input
                type="text"
                value={formData.business_address}
                onChange={(e) =>
                  setFormData({ ...formData, business_address: e.target.value })
                }
                className="border border-gray-200 p-3 rounded-xl focus:border-[#f48c25] outline-none"
              />
            </div>
            <div className="md:col-span-2 flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-600">
                Descripción
              </label>
              <textarea
                rows="4"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="border border-gray-200 p-3 rounded-xl focus:border-[#f48c25] outline-none resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#f48c25] text-white py-4 rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-sm disabled:bg-gray-400"
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </form>
      </div>

      {/* --- MODAL DE ÉXITO --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-5xl">
                check_circle
              </span>
            </div>
            <h3 className="text-2xl font-black text-[#181411] mb-2">
              ¡Guardado con éxito!
            </h3>
            <p className="text-gray-500 mb-8">
              Tus cambios se han actualizado correctamente.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-[#181411] text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition-colors"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
