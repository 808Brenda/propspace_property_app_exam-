
import React from "react";
import { Home, MessageSquare, User, LogOut, Plus, Activity } from "lucide-react";
import { User as UserType } from "../types";

interface NavbarProps {
  currentUser: UserType | null;
  onOpenAuth: () => void;
  onOpenAddProperty: () => void;
  activeTab: "feed" | "my-listings" | "profile";
  setActiveTab: (tab: "feed" | "my-listings" | "profile") => void;
}

export default function Navbar({
  currentUser,
  onOpenAuth,
  onOpenAddProperty,
  activeTab,
  setActiveTab,
}: NavbarProps) {
  return (
    <nav className="bg-slate-900/30 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => setActiveTab("feed")}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Home className="h-5 w-5 text-white" id="nav-logo-icon" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Prop<span className="text-indigo-400">Space</span>
              </span>
            </div>
            <span className="ml-3 hidden sm:inline-block text-xs font-mono px-2.5 py-0.5 bg-indigo-950/60 text-indigo-400 border border-indigo-800/60 rounded-full">
              Cameroon
            </span>
          </div>

          {/* Nav Items */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            <button
              id="tab-feed"
              onClick={() => setActiveTab("feed")}
              className={`flex items-center space-x-1 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer ${
                activeTab === "feed"
                  ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <Home className="h-4 w-4" />
              <span className="hidden md:inline">Browse</span>
            </button>



            {currentUser ? (
              <>
                <button
                  id="tab-my-listings"
                  onClick={() => setActiveTab("my-listings")}
                  className={`flex items-center space-x-1 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer ${
                    activeTab === "my-listings"
                      ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <Activity className="h-4 w-4" />
                  <span>My Listings</span>
                </button>

                <button
                  id="btn-add-property"
                  onClick={onOpenAddProperty}
                  className="flex items-center space-x-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all duration-200 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">List Property</span>
                </button>

                <button
                  id="tab-profile"
                  onClick={() => setActiveTab("profile")}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer ${
                    activeTab === "profile"
                      ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <img
                    src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.username}`}
                    alt={currentUser.username}
                    className="h-7 w-7 rounded-full object-cover border-2 border-indigo-500/30 p-0.5"
                  />
                  <span className="max-w-[100px] truncate hidden sm:inline">{currentUser.username}</span>
                </button>
              </>
            ) : (
              <button
                id="btn-login-trigger"
                onClick={onOpenAuth}
                className="flex items-center space-x-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-indigo-600/20 cursor-pointer"
              >
                <User className="h-4 w-4" />
                <span>Log In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
