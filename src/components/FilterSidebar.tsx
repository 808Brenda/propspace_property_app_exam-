
import React, { useState } from "react";
import { Search, MapPin, DollarSign, Filter, RefreshCw } from "lucide-react";

interface FilterSidebarProps {
  onFilterChange: (filters: {
    query: string;
    city: string;
    type: string;
    purpose: string;
    minPrice: string;
    maxPrice: string;
  }) => void;
}

export default function FilterSidebar({ onFilterChange }: FilterSidebarProps) {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [purpose, setPurpose] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onFilterChange({
      query,
      city,
      type,
      purpose,
      minPrice,
      maxPrice,
    });
  };

  const handleClear = () => {
    setQuery("");
    setCity("");
    setType("");
    setPurpose("");
    setMinPrice("");
    setMaxPrice("");
    onFilterChange({
      query: "",
      city: "",
      type: "",
      purpose: "",
      minPrice: "",
      maxPrice: "",
    });
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 shadow-xs h-fit sticky top-24 text-slate-100">
      <div className="flex items-center justify-between mb-5 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4.5 w-4.5 text-indigo-400" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Search Filters</h2>
        </div>
        <button
          id="btn-clear-filters"
          onClick={handleClear}
          className="text-xs text-slate-500 hover:text-indigo-400 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <RefreshCw className="h-3 w-3" />
          Reset
        </button>
      </div>

      <form onSubmit={handleApply} className="space-y-4">
        {/* Keywords Search */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Keywords</label>
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              id="filter-query-input"
              type="text"
              placeholder="e.g. Bastos studio, pool..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-600 rounded-xl pl-10 pr-3.5 py-2.5 text-sm focus:outline-hidden focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* City Select */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">City (Cameroon)</label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
            <select
              id="filter-city-select"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-sm focus:outline-hidden focus:border-indigo-500 transition bg-slate-950 appearance-none cursor-pointer"
            >
              <option value="">All Cities</option>
              <option value="Douala">Douala</option>
              <option value="Yaounde">Yaoundé</option>
              <option value="Limbe">Limbe</option>
              <option value="Kribi">Kribi</option>
              <option value="Buea">Buea</option>
              <option value="Bafoussam">Bafoussam</option>
            </select>
          </div>
        </div>

        {/* Property Type */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Property Type</label>
          <select
            id="filter-type-select"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-indigo-500 transition bg-slate-950 appearance-none cursor-pointer"
          >
            <option value="">All Types</option>
            <option value="Apartment">Apartment</option>
            <option value="House">House</option>
            <option value="Studio">Studio</option>
          </select>
        </div>

        {/* Purpose */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Offer Purpose</label>
          <div className="flex gap-2">
            <button
              id="filter-purpose-rent"
              type="button"
              onClick={() => setPurpose(purpose === "rent" ? "" : "rent")}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                purpose === "rent"
                  ? "bg-indigo-600/20 text-indigo-400 border-indigo-500/30 shadow-xs"
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              For Rent
            </button>
            <button
              id="filter-purpose-sale"
              type="button"
              onClick={() => setPurpose(purpose === "sale" ? "" : "sale")}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                purpose === "sale"
                  ? "bg-purple-600/20 text-purple-400 border-purple-500/30 shadow-xs"
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              For Sale
            </button>
          </div>
        </div>

        {/* Price Range (XAF) */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Price Range (XAF)</label>
          <div className="flex items-center gap-2">
            <input
              id="filter-min-price-input"
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-700 px-3 py-2 text-xs rounded-xl focus:outline-hidden focus:border-indigo-500 transition"
            />
            <span className="text-slate-600 text-xs">—</span>
            <input
              id="filter-max-price-input"
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-700 px-3 py-2 text-xs rounded-xl focus:outline-hidden focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          id="btn-apply-filters"
          type="submit"
          className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Search className="h-4 w-4" />
          Apply Search
        </button>
      </form>
    </div>
  );
}
