

import React, { useState, useEffect } from "react";
import { X, Upload, Link, Check, AlertCircle } from "lucide-react";
import { Property, PropertyType, PropertyPurpose } from "../types";

interface AddPropertyModalProps {
  editingProperty: Property | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddPropertyModal({
  editingProperty,
  onClose,
  onSuccess,
}: AddPropertyModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("Douala");
  const [type, setType] = useState<PropertyType>("Apartment");
  const [purpose, setPurpose] = useState<PropertyPurpose>("rent");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [inputUrl, setInputUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (editingProperty) {
      setTitle(editingProperty.title);
      setDescription(editingProperty.description);
      setPrice(editingProperty.price.toString());
      setLocation(editingProperty.location);
      setType(editingProperty.type);
      setPurpose(editingProperty.purpose);
      setImageUrls(editingProperty.imageUrls);
    }
  }, [editingProperty]);

  const handleUrlAdd = () => {
    if (inputUrl.trim() && !imageUrls.includes(inputUrl)) {
      setImageUrls([...imageUrls, inputUrl.trim()]);
      setInputUrl("");
    }
  };

  const handleRemoveImage = (urlToRemove: string) => {
    setImageUrls(imageUrls.filter((url) => url !== urlToRemove));
  };

 
  const uploadFile = async (file: File) => {
    setUploading(true);
    setError("");

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = reader.result as string;
        const response = await fetch("/api/properties/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("propspace_token")}`,
          },
          body: JSON.stringify({
            filename: file.name,
            base64: base64Data,
          }),
        });

        const data = await response.json();
        if (response.ok && data.url) {
          setImageUrls((prev) => [...prev, data.url]);
        } else {
          throw new Error(data.error || "File upload failed.");
        }
        setUploading(false);
      };
      reader.onerror = (err) => {
        throw new Error("Failed to read local file.");
      };
    } catch (err: any) {
      setError(err.message || "Error uploading image file.");
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !description.trim() || !price || !location) {
      setError("Please fill out all required fields.");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError("Price must be a valid positive number.");
      return;
    }

    setLoading(true);

    const endpoint = editingProperty ? `/api/properties/${editingProperty.id}` : "/api/properties";
    const method = editingProperty ? "PUT" : "POST";

    const payload = {
      title,
      description,
      price: priceNum,
      location,
      type,
      purpose,
      imageUrls: imageUrls.length > 0 ? imageUrls : ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80"],
    };

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("propspace_token")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        throw new Error(data.error || "Failed to submit property listing.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h3 className="font-bold text-lg text-white font-sans tracking-tight">
            {editingProperty ? "Edit Property Listing" : "Add Property to PropSpace"}
          </h3>
          <button id="add-property-close-btn" onClick={onClose} className="text-slate-400 hover:text-white transition cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="bg-red-950/40 border border-red-900/40 text-red-400 p-3.5 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="h-4.5 w-4.5 text-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Property Title *</label>
            <input
              id="property-title-input"
              type="text"
              required
              placeholder="e.g. Modern 2-Bedroom Apartment Bastos"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Description *</label>
            <textarea
              id="property-desc-input"
              required
              rows={3}
              placeholder="Provide a comprehensive description of amenities, security, water accessibility, rooms, and surroundings..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Row: Type & Purpose */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Property Type *</label>
              <select
                id="property-type-select"
                value={type}
                onChange={(e) => setType(e.target.value as PropertyType)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-indigo-500 transition-all"
              >
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
                <option value="Studio">Studio</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Offer Purpose *</label>
              <select
                id="property-purpose-select"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value as PropertyPurpose)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-indigo-500 transition-all"
              >
                <option value="rent">For Rent</option>
                <option value="sale">For Sale</option>
              </select>
            </div>
          </div>

          {/* Row: Price & Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Price (FCFA) *</label>
              <input
                id="property-price-input"
                type="number"
                required
                placeholder="e.g. 150000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">City (Cameroon) *</label>
              <select
                id="property-location-select"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-indigo-500 transition-all"
              >
                <option value="Douala">Douala</option>
                <option value="Yaounde">Yaoundé</option>
                <option value="Limbe">Limbe</option>
                <option value="Kribi">Kribi</option>
                <option value="Buea">Buea</option>
                <option value="Bafoussam">Bafoussam</option>
              </select>
            </div>
          </div>

          {/* Image Upload section */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Property Images</label>
            
            {/* Drag & Drop File Upload */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-5 text-center flex flex-col items-center justify-center transition cursor-pointer mb-3 ${
                dragActive
                  ? "border-indigo-500 bg-indigo-950/20"
                  : "border-slate-800 hover:border-indigo-500/50 bg-slate-950"
              }`}
            >
              <input
                id="property-image-file-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="property-image-file-input" className="cursor-pointer flex flex-col items-center">
                <Upload className="h-8 w-8 text-slate-500 mb-2" />
                <span className="text-xs font-semibold text-slate-300">Drag & Drop picture here or <span className="text-indigo-400 hover:underline">browse files</span></span>
                <span className="text-[10px] text-slate-500 mt-1">Supports PNG, JPG, JPEG</span>
              </label>
            </div>

            {/* Link Entry Option */}
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Link className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  id="property-image-url-input"
                  type="text"
                  placeholder="Or enter image URL..."
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-700 rounded-xl focus:outline-hidden focus:border-indigo-500 transition-all text-sm"
                />
              </div>
              <button
                id="btn-add-img-url"
                type="button"
                onClick={handleUrlAdd}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-750 text-slate-300 px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-center cursor-pointer"
              >
                Add URL
              </button>
            </div>

            {/* Thumbnail Previews */}
            {imageUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {imageUrls.map((url, idx) => (
                  <div key={idx} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-slate-800 shadow-sm">
                    <img src={url} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(url)}
                      className="absolute top-1 right-1 bg-red-600 hover:bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition duration-150 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {uploading && (
              <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-2">
                <span className="h-3 w-3 border border-slate-700 border-t-indigo-500 rounded-full animate-spin"></span>
                <span>Uploading picture to PropSpace server...</span>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
            <button
              id="property-cancel-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-750 text-slate-300 hover:text-white text-sm font-semibold rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="property-submit-btn"
              type="submit"
              disabled={loading || uploading}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center justify-center disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Saving listing..." : editingProperty ? "Save Changes" : "Post Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
