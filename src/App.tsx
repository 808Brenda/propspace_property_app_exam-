
import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import PropertyCard from "./components/PropertyCard";
import FilterSidebar from "./components/FilterSidebar";
import PaymentModal from "./components/PaymentModal";
import AuthModal from "./components/AuthModal";
import AddPropertyModal from "./components/AddPropertyModal";
import ProfileDashboard from "./components/ProfileDashboard";
import { User, Property } from "./types";
import { MapPin, Search, AlertCircle, Building, DollarSign, ListFilter, Plus, User as UserIcon } from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"feed" | "my-listings" | "profile">("feed");
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [addPropertyModalOpen, setAddPropertyModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [payingProperty, setPayingProperty] = useState<Property | null>(null);

  // Filters State
  const [filters, setFilters] = useState({
    query: "",
    city: "",
    type: "",
    purpose: "",
    minPrice: "",
    maxPrice: "",
  });

 
  useEffect(() => {
    checkLoggedInUser();
    fetchProperties();
  }, [filters]);

  const checkLoggedInUser = async () => {
    const token = localStorage.getItem("propspace_token");
    if (!token) return;

    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
      } else {
        // Token expired or invalid
        localStorage.removeItem("propspace_token");
      }
    } catch (e) {
      console.error("Failed to check token status:", e);
    }
  };

  const fetchProperties = async () => {
    setLoading(true);
    setError("");

    // Build query params
    const params = new URLSearchParams();
    if (filters.query) params.append("query", filters.query);
    if (filters.city) params.append("city", filters.city);
    if (filters.type) params.append("type", filters.type);
    if (filters.purpose) params.append("purpose", filters.purpose);
    if (filters.minPrice) params.append("minPrice", filters.minPrice);
    if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);

    try {
      const response = await fetch(`/api/properties?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      } else {
        throw new Error("Failed to load properties feed.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching properties.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleLogout = () => {
    localStorage.removeItem("propspace_token");
    setCurrentUser(null);
    setActiveTab("feed");
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setAuthModalOpen(false);
  };

  const handlePropertySubmitSuccess = () => {
    fetchProperties();
    setAddPropertyModalOpen(false);
    setEditingProperty(null);
  };

  const handlePaymentSuccess = (paymentRecord: any) => {
    fetchProperties();
    setPayingProperty(null);
    // Redirect to profile to see the payment ledger
    setActiveTab("profile");
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setAddPropertyModalOpen(true);
  };

  const handleDeleteProperty = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this listing from PropSpace?")) return;

    try {
      const response = await fetch(`/api/properties/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("propspace_token")}`,
        },
      });

      if (response.ok) {
        fetchProperties();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete listing.");
      }
    } catch (err) {
      console.error(err);
      alert("Error contacting the server.");
    }
  };

  const myListings = properties.filter((p) => currentUser && p.authorId === currentUser.id);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100 relative overflow-x-hidden" id="propspace-app-root">
      
      {/* Immersive Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 blur-[120px] pointer-events-none"></div>

      {/* Navbar Header */}
      <Navbar
        currentUser={currentUser}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenAddProperty={() => {
          setEditingProperty(null);
          setAddPropertyModalOpen(true);
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Hero Banner Section (Only on Feed tab) */}
      {activeTab === "feed" && (
        <div className="bg-slate-900 text-white relative py-16 md:py-24 overflow-hidden border-b border-slate-900">
          {/* Subtle background decoration */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1600&q=80')] opacity-10 bg-cover bg-center"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-slate-900/60"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-5 max-w-4xl">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold font-mono tracking-wider text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 rounded-full uppercase">
              Verified Property Portal
            </span>
            <h1 className="text-4xl md:text-6xl font-black font-sans tracking-tight text-white leading-tight">
              Find Your Dream Property <br className="hidden sm:inline" /> in <span className="text-indigo-400">Cameroon</span>
            </h1>
            <p className="text-slate-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-sans font-medium">
              Discover premium apartments, modern houses, and cozy studios for rent or sale in Douala, Yaoundé, Limbe, and Kribi. 
              Settle lease agreements instantly with integrated secure Stripe payments.
            </p>
            
            {/* Quick stats ribbon */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center max-w-2xl mx-auto divide-x divide-slate-800">
              <div className="px-2">
                <p className="text-lg md:text-2xl font-black font-sans text-indigo-400">FCFA / XAF</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Cameroon Currency</p>
              </div>
              <div className="px-2">
                <p className="text-lg md:text-2xl font-black font-sans text-white">Stripe</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Secure Payments</p>
              </div>
              <div className="px-2">
                <p className="text-lg md:text-2xl font-black font-sans text-white">Verified</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Legally Compliant</p>
              </div>
              <div className="px-2">
                <p className="text-lg md:text-2xl font-black font-sans text-white">100% Secure</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Legal Compliance</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Container Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        
        {/* PUBLIC FEED TAB */}
        {activeTab === "feed" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filter Sidebar Col */}
            <div className="lg:col-span-1">
              <FilterSidebar onFilterChange={handleFilterChange} />
            </div>

            {/* Properties Feed Col */}
            <div className="lg:col-span-3 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white font-sans tracking-tight">Available Listings</h2>
                  <p className="text-xs text-slate-400 mt-1">Showing {properties.length} matches across Cameroon</p>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-20 bg-slate-900/40 border border-slate-800 rounded-2xl shadow-lg">
                  <span className="h-8 w-8 border-3 border-slate-800 border-t-indigo-500 rounded-full animate-spin inline-block"></span>
                  <p className="text-sm font-semibold text-slate-300 mt-4">Analyzing Cameroon property market...</p>
                  <p className="text-xs text-slate-500 mt-1">Retrieving real-time listings on PropSpace Ledger</p>
                </div>
              ) : error ? (
                <div className="bg-red-950/30 border border-red-900/40 rounded-2xl p-8 text-center text-red-400 max-w-md mx-auto">
                  <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
                  <h3 className="font-bold text-md">Failed to connect</h3>
                  <p className="text-xs text-red-500 mt-1 leading-relaxed">{error}</p>
                  <button
                    id="btn-retry-fetch"
                    onClick={fetchProperties}
                    className="mt-4 px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Retry Connection
                  </button>
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/40 border border-slate-800 rounded-2xl shadow-lg max-w-2xl mx-auto">
                  <Building className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                  <h3 className="font-bold text-lg text-white">No properties found</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                    We couldn't find any listings matching your search criteria. Try adjusting your price ranges or selecting another Cameroonian city.
                  </p>
                  <button
                    id="btn-reset-filters-feed"
                    onClick={() => handleFilterChange({
                      query: "",
                      city: "",
                      type: "",
                      purpose: "",
                      minPrice: "",
                      maxPrice: "",
                    })}
                    className="mt-5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-indigo-600/20 cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {properties.map((p) => (
                    <PropertyCard
                      key={p.id}
                      property={p}
                      currentUser={currentUser}
                      onPay={(prop) => {
                        if (!currentUser) {
                          setAuthModalOpen(true);
                        } else {
                          setPayingProperty(prop);
                        }
                      }}
                      onEdit={handleEditProperty}
                      onDelete={handleDeleteProperty}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PRIVATE PORTFOLIO "MY LISTINGS" TAB */}
        {activeTab === "my-listings" && (
          <div className="space-y-6">
            {!currentUser ? (
              <div className="text-center py-20 bg-slate-900/40 border border-slate-800 rounded-2xl shadow-lg max-w-md mx-auto">
                <Building className="h-12 w-12 text-indigo-400 mx-auto mb-3 animate-pulse" />
                <h3 className="font-bold text-lg text-white">Access Host Portfolio</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  Please sign in to view, create, edit, or delete listings in your personal PropSpace representative portfolio.
                </p>
                <button
                  id="btn-login-portfolio"
                  onClick={() => setAuthModalOpen(true)}
                  className="mt-5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  Log In to Account
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-2xl font-black text-white font-sans tracking-tight">My Representative Listings</h2>
                    <p className="text-xs text-slate-400 mt-1">Managing {myListings.length} hosted properties on PropSpace Cameroon</p>
                  </div>
                  <button
                    id="btn-add-property-listings"
                    onClick={() => {
                      setEditingProperty(null);
                      setAddPropertyModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    List Property
                  </button>
                </div>

                {myListings.length === 0 ? (
                  <div className="text-center py-20 bg-slate-900/40 border border-slate-800 rounded-2xl shadow-lg max-w-xl mx-auto">
                    <Building className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                    <h3 className="font-bold text-md text-white">You haven't listed any property yet</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      List your apartments, houses, or studios and accept secure FCFA lease settlements or buyouts powered by Stripe.
                    </p>
                    <button
                      id="btn-add-property-empty"
                      onClick={() => setAddPropertyModalOpen(true)}
                      className="mt-5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-indigo-600/20 cursor-pointer"
                    >
                      Post Your First Listing
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myListings.map((p) => (
                      <PropertyCard
                        key={p.id}
                        property={p}
                        currentUser={currentUser}
                        onPay={() => {}}
                        onEdit={handleEditProperty}
                        onDelete={handleDeleteProperty}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}



        {/* PROFILE DASHBOARD TAB */}
        {activeTab === "profile" && (
          <div>
            {!currentUser ? (
              <div className="text-center py-20 bg-slate-900/40 border border-slate-800 rounded-2xl shadow-lg max-w-sm mx-auto">
                <UserIcon className="h-12 w-12 text-indigo-400 mx-auto mb-3 animate-pulse" />
                <h3 className="font-bold text-lg text-white">Account Dashboard</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Please log in to access profile details, secure ledger history, and system adjustments.
                </p>
                <button
                  id="btn-login-profile-tab"
                  onClick={() => setAuthModalOpen(true)}
                  className="mt-5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  Log In to Account
                </button>
              </div>
            ) : (
              <ProfileDashboard
                currentUser={currentUser}
                onProfileUpdate={(updated) => setCurrentUser(updated)}
                onLogout={handleLogout}
              />
            )}
          </div>
        )}

      </main>



      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-900 mt-auto py-10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400 space-y-2">
          <p className="font-bold font-sans text-white text-sm">PropSpace Cameroon Portal</p>
          <p>
            Secure lease listings with decentralized verified hosts. Settle rentals instantly via Stripe Checkout.
          </p>
          <p className="font-mono text-[10px] text-slate-600 pt-2 border-t border-slate-900 max-w-xs mx-auto">
            © 2026 PropSpace. MINDCAF & Titre Foncier compliant.
          </p>
        </div>
      </footer>

      {/* MODALS RENDER STAGE */}
      {authModalOpen && (
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {addPropertyModalOpen && (
        <AddPropertyModal
          editingProperty={editingProperty}
          onClose={() => {
            setAddPropertyModalOpen(false);
            setEditingProperty(null);
          }}
          onSuccess={handlePropertySubmitSuccess}
        />
      )}

      {payingProperty && (
        <PaymentModal
          property={payingProperty}
          currentUser={currentUser}
          onClose={() => setPayingProperty(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

    </div>
  );
}
