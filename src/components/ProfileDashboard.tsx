

import React, { useState, useEffect } from "react";
import { User, Phone, Mail, ShieldAlert, CreditCard, CheckCircle, Award, FileText, AlertCircle, RefreshCw, KeyRound } from "lucide-react";
import { User as UserType, Payment } from "../types";

interface ProfileDashboardProps {
  currentUser: UserType | null;
  onProfileUpdate: (updatedUser: UserType) => void;
  onLogout: () => void;
}

export default function ProfileDashboard({
  currentUser,
  onProfileUpdate,
  onLogout,
}: ProfileDashboardProps) {
  if (!currentUser) return null;

  // Profile Edit fields
  const [username, setUsername] = useState(currentUser.username);
  const [contactNumber, setContactNumber] = useState(currentUser.contactNumber || "");
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || "");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  // Password fields
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Payments log
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [currentUser]);

  const fetchPayments = async () => {
    setPaymentsLoading(true);
    try {
      const response = await fetch("/api/payments/my", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("propspace_token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      }
    } catch (e) {
      console.error("Error fetching payments log:", e);
    } finally {
      setPaymentsLoading(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess("");
    setProfileError("");
    setProfileLoading(true);

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("propspace_token")}`,
        },
        body: JSON.stringify({
          username,
          contactNumber,
          avatarUrl,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setProfileSuccess("Profile metrics successfully updated!");
        onProfileUpdate(data.user);
      } else {
        throw new Error(data.error || "Failed to update profile.");
      }
    } catch (err: any) {
      setProfileError(err.message || "An error occurred.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess("");
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await fetch("/api/auth/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("propspace_token")}`,
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setPasswordSuccess("Account security adjustments saved!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        throw new Error(data.error || "Failed to update password.");
      }
    } catch (err: any) {
      setPasswordError(err.message || "An error occurred.");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="profile-dashboard-container">
      {/* Col 1 & 2: Forms & History */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Profile Settings (Read/Write) */}
        <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-5 border-b border-slate-800 pb-3">
            <User className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white font-sans">Profile Dashboard Settings</h2>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-4">
            {profileSuccess && (
              <div className="bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 p-3.5 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />
                <span>{profileSuccess}</span>
              </div>
            )}
            {profileError && (
              <div className="bg-red-950/40 border border-red-900/40 text-red-400 p-3.5 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="h-4.5 w-4.5 text-red-500" />
                <span>{profileError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Profile Name</label>
                <input
                  id="profile-username-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Phone Number (Cameroon)</label>
                <input
                  id="profile-phone-input"
                  type="text"
                  placeholder="e.g. +237 670 123 456"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-indigo-500 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Avatar Image Link</label>
              <input
                id="profile-avatar-input"
                type="text"
                placeholder="https://..."
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-indigo-500 transition-all"
              />
            </div>

            <button
              id="btn-save-profile"
              type="submit"
              disabled={profileLoading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition disabled:bg-slate-800 disabled:text-slate-500 cursor-pointer"
            >
              {profileLoading ? "Updating Profile..." : "Update Configuration"}
            </button>
          </form>
        </div>

        {/* Security Adjustments (Password) */}
        <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-5 border-b border-slate-800 pb-3">
            <KeyRound className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white font-sans">Security Adjustments</h2>
          </div>

          <form onSubmit={handlePasswordSave} className="space-y-4">
            {passwordSuccess && (
              <div className="bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 p-3.5 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />
                <span>{passwordSuccess}</span>
              </div>
            )}
            {passwordError && (
              <div className="bg-red-950/40 border border-red-900/40 text-red-400 p-3.5 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="h-4.5 w-4.5 text-red-500" />
                <span>{passwordError}</span>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Current Password</label>
              <input
                id="security-old-password"
                type="password"
                placeholder="••••••••"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                className="w-full max-w-sm bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">New Secure Password</label>
                <input
                  id="security-new-password"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Confirm Password</label>
                <input
                  id="security-confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <button
              id="btn-save-password"
              type="submit"
              disabled={passwordLoading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition disabled:bg-slate-800 disabled:text-slate-500 cursor-pointer"
            >
              {passwordLoading ? "Updating security..." : "Save Password"}
            </button>
          </form>
        </div>

        {/* Secure Stripe Rental Transaction History log */}
        <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-5 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white font-sans">Stripe Payment Ledger</h2>
            </div>
            <button
              id="btn-refresh-payments"
              onClick={fetchPayments}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors cursor-pointer font-semibold"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reload Ledger
            </button>
          </div>

          {paymentsLoading ? (
            <div className="text-center py-6">
              <span className="h-5 w-5 border-2 border-slate-800 border-t-indigo-500 rounded-full animate-spin inline-block"></span>
              <p className="text-xs text-slate-500 mt-2">Connecting to secure Stripe database...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 bg-slate-950 rounded-xl border border-dashed border-slate-850">
              <FileText className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-400">No transactions recorded</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                Any rentals or purchases you settle via PropSpace secure Stripe portals will be receipted here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {payments.map((p) => (
                <div key={p.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
                  <div>
                    <p className="font-bold text-white line-clamp-1">{p.propertyTitle}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="font-mono">Ref: {p.id}</span>
                      <span>•</span>
                      <span>{new Date(p.date).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <span className="font-bold text-indigo-400 font-sans">{p.amount.toLocaleString("fr-FR")} FCFA</span>
                    <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Success
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Col 3: Side Card Summary */}
      <div className="space-y-6">
        
        {/* Profile Card Summary */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-800 text-white p-6 rounded-3xl shadow-xl border border-indigo-500/20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 opacity-10">
            <Award className="h-40 w-40" />
          </div>
          
          <img
            src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.username}`}
            alt={currentUser.username}
            className="h-20 w-20 rounded-full object-cover border-4 border-indigo-500/30 mx-auto shadow-md mb-4 bg-slate-900 p-0.5"
          />

          <h3 className="text-lg font-bold tracking-tight">{currentUser.username}</h3>
          <p className="text-indigo-200 text-xs mt-1 font-sans">{currentUser.email}</p>
          {currentUser.contactNumber && (
            <p className="text-indigo-300 text-xs mt-1.5 font-mono">{currentUser.contactNumber}</p>
          )}

          <div className="border-t border-white/10 pt-4 mt-5 grid grid-cols-2 gap-2 text-center">
            <div>
              <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest">Account Tier</p>
              <p className="text-sm font-black mt-0.5 text-yellow-300">Gold Partner</p>
            </div>
            <div>
              <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest">Member Since</p>
              <p className="text-sm font-black mt-0.5 text-white">{new Date(currentUser.createdAt).getFullYear()}</p>
            </div>
          </div>
        </div>

        {/* Info Helper Card */}
        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl space-y-3 text-slate-300">
          <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <ShieldAlert className="h-4.5 w-4.5 text-indigo-400" />
            Security & Compliance
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            PropSpace is committed to Cameroonian land law transparency. Make sure your profile details are accurate when representative hosting. Every payment logged here represents a validated lease or sale settlement via Stripe.
          </p>
          <button
            id="btn-logout"
            onClick={onLogout}
            className="w-full text-center py-3 border border-red-950 text-red-400 bg-red-950/20 hover:bg-red-900/20 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Logout session
          </button>
        </div>

      </div>
    </div>
  );
}
