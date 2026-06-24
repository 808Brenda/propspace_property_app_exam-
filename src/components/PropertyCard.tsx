/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { MapPin, User, Phone, CheckCircle, Trash2, Edit } from "lucide-react";
import { Property, User as UserType } from "../types";

interface PropertyCardProps {
  key?: string;
  property: Property;
  currentUser: UserType | null;
  onPay: (property: Property) => void;
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void;
}

export default function PropertyCard({
  property,
  currentUser,
  onPay,
  onEdit,
  onDelete,
}: PropertyCardProps) {
  const isOwner = currentUser && currentUser.id === property.authorId;
  const priceFormatted = property.price.toLocaleString("fr-FR"); // Cameroon uses French formatting style often, or comma style.

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden group hover:border-indigo-500/50 transition-all duration-300 flex flex-col h-full text-slate-100" id={`property-card-${property.id}`}>
      {/* Property Image & Status badges */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
        <img
          src={property.imageUrls[0]}
          alt={property.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
        />

        {/* Badges Overlay */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
          <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider text-white shadow-lg ${
            property.purpose === "rent" ? "bg-indigo-600 shadow-indigo-600/30" : "bg-purple-600 shadow-purple-600/30"
          }`}>
            For {property.purpose === "rent" ? "Rent" : "Sale"}
          </span>
          <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-slate-950/80 text-slate-200 shadow-lg border border-slate-800">
            {property.type}
          </span>
        </div>

        {/* Sold / Rented Banner Overlay */}
        {property.isRentedOrSold && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-red-600 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg border border-red-500 animate-pulse">
              <CheckCircle className="h-4 w-4" />
              {property.purpose === "rent" ? "RENTED" : "SOLD"}
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Price */}
          <div className="flex items-baseline mb-2">
            <span className="text-2xl font-bold font-sans text-white">
              {priceFormatted}
            </span>
            <span className="text-sm font-semibold text-indigo-400 ml-1.5">
              XAF
            </span>
            {property.purpose === "rent" && (
              <span className="text-xs text-slate-400 ml-1.5">/ month</span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-white leading-snug group-hover:text-indigo-400 transition-all duration-200 line-clamp-1 mb-2">
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-center text-slate-400 text-sm gap-1 mb-3">
            <MapPin className="h-4 w-4 text-indigo-400 flex-shrink-0" />
            <span className="truncate">{property.location}, Cameroon</span>
          </div>

          {/* Description */}
          <p className="text-slate-300 text-sm line-clamp-2 mb-4 leading-relaxed">
            {property.description}
          </p>
        </div>

        {/* Host details and Footer */}
        <div className="border-t border-slate-800/80 pt-4 mt-auto">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <img
                src={property.authorAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${property.authorName}`}
                alt={property.authorName}
                className="h-8 w-8 rounded-full border-2 border-indigo-500/20 object-cover bg-slate-800 p-0.5"
              />
              <div className="text-xs">
                <p className="font-semibold text-slate-200 leading-none">{property.authorName}</p>
                <p className="text-slate-500 mt-1">Host Rep</p>
              </div>
            </div>
            {property.authorPhone && (
              <a
                href={`tel:${property.authorPhone}`}
                className="text-xs font-mono bg-slate-800/50 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1 hover:bg-slate-800 hover:text-white transition-all"
              >
                <Phone className="h-3 w-3 text-indigo-400" />
                <span className="hidden sm:inline">{property.authorPhone}</span>
              </a>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {isOwner ? (
              <>
                <button
                  id={`btn-edit-${property.id}`}
                  onClick={() => onEdit(property)}
                  className="flex-1 py-2 bg-slate-800/60 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 hover:border-slate-600 transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Edit className="h-3 w-3 text-indigo-400" />
                  Edit
                </button>
                <button
                  id={`btn-delete-${property.id}`}
                  onClick={() => onDelete(property.id)}
                  className="px-3 py-2 bg-red-950/40 hover:bg-red-900/40 text-red-400 text-xs font-semibold rounded-xl border border-red-900/40 hover:border-red-900/60 transition flex items-center justify-center cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            ) : (
              <button
                id={`btn-pay-${property.id}`}
                disabled={property.isRentedOrSold}
                onClick={() => onPay(property)}
                className={`w-full py-2.5 text-center text-xs font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  property.isRentedOrSold
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800 shadow-none"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"
                }`}
              >
                <span>
                  {property.isRentedOrSold
                    ? "Sold / Rented"
                    : property.purpose === "rent"
                    ? "Rent Property"
                    : "Buy Property"}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
