

import React, { useState } from "react";
import { X, CreditCard, Lock, ShieldCheck, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { Property, User as UserType } from "../types";

interface PaymentModalProps {
  property: Property | null;
  currentUser: UserType | null;
  onClose: () => void;
  onPaymentSuccess: (paymentRecord: any) => void;
}

export default function PaymentModal({
  property,
  currentUser,
  onClose,
  onPaymentSuccess,
}: PaymentModalProps) {
  if (!property) return null;

  const [cardHolder, setCardHolder] = useState(currentUser?.username || "");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);

  // Simple card form formatting helpers
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").substring(0, 16);
    const formatted = val.replace(/(\d{4})/g, "$1 ").trim();
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").substring(0, 4);
    if (val.length >= 2) {
      setExpiry(val.substring(0, 2) + "/" + val.substring(2));
    } else {
      setExpiry(val);
    }
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").substring(0, 3);
    setCvc(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError("Please log in to complete this transaction.");
      return;
    }
    if (cardNumber.replace(/\s/g, "").length < 16) {
      setError("Please enter a valid 16-digit card number.");
      return;
    }
    if (expiry.length < 5) {
      setError("Please enter card expiry in MM/YY format.");
      return;
    }
    if (cvc.length < 3) {
      setError("Please enter a valid 3-digit CVC/CVV.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/payments/checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("propspace_token")}`,
        },
        body: JSON.stringify({
          propertyId: property.id,
          cardHolder,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess(true);
        setReceipt(data.payment);
        setTimeout(() => {
          onPaymentSuccess(data.payment);
        }, 3000);
      } else {
        throw new Error(data.error || "Payment transaction declined.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while connecting to the payment gateway.");
    } finally {
      setLoading(false);
    }
  };

  const formattedPrice = property.price.toLocaleString("fr-FR");

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Stripe Branding Header */}
        <div className="bg-slate-950 text-white p-5 flex justify-between items-center relative border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-indigo-400" />
            <span className="font-sans font-bold tracking-tight">
              Stripe <span className="text-slate-500 font-normal">Checkout</span>
            </span>
          </div>
          <button id="payment-close-btn" onClick={onClose} className="text-slate-400 hover:text-white transition cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto w-16 h-16 bg-indigo-950/50 border border-indigo-900/50 rounded-full flex items-center justify-center text-indigo-400">
                <CheckCircle className="h-10 w-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Payment Successful!</h3>
                <p className="text-slate-400 text-sm mt-1">Receipt reference: {receipt?.id}</p>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-left max-w-sm mx-auto">
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>Property:</span>
                  <span className="font-semibold text-slate-200 truncate max-w-[180px]">{property.title}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>Paid By:</span>
                  <span className="font-semibold text-slate-200">{cardHolder}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400 border-t border-slate-800 pt-2 mt-2">
                  <span className="font-bold text-slate-300">Amount Charged:</span>
                  <span className="font-bold text-indigo-400 font-sans">{formattedPrice} FCFA</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
                <ShieldCheck className="h-4.5 w-4.5 text-indigo-400" /> Securely recorded on PropSpace Cameroon Ledger.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Order Summary */}
              <div className="bg-indigo-950/30 border border-indigo-900/40 p-4 rounded-xl mb-4">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">Order Summary</h4>
                <p className="text-sm font-semibold text-slate-100 truncate">{property.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{property.location}, Cameroon</p>
                <div className="flex justify-between items-baseline mt-3 pt-2 border-t border-slate-800">
                  <span className="text-xs font-bold text-indigo-300">Total Amount:</span>
                  <span className="text-lg font-bold text-indigo-400 font-sans">
                    {formattedPrice} FCFA {property.purpose === "rent" && <span className="text-xs text-slate-400">/mo</span>}
                  </span>
                </div>
              </div>

              {/* Input Fields */}
              {error && (
                <div className="bg-red-950/40 border border-red-900/40 text-red-400 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="h-4.5 w-4.5 text-red-500 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Cardholder Name</label>
                <input
                  id="stripe-card-holder-input"
                  type="text"
                  placeholder="e.g. Samuel Eto'o"
                  required
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Card Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-500" />
                  <input
                    id="stripe-card-number-input"
                    type="text"
                    placeholder="1234 5678 1234 5678"
                    required
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-hidden focus:border-indigo-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Expiration Date</label>
                  <input
                    id="stripe-expiry-input"
                    type="text"
                    placeholder="MM/YY"
                    required
                    value={expiry}
                    onChange={handleExpiryChange}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-indigo-500 transition-all text-center font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">CVC / CVV</label>
                  <input
                    id="stripe-cvc-input"
                    type="password"
                    placeholder="123"
                    required
                    value={cvc}
                    onChange={handleCvcChange}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-indigo-500 transition-all text-center font-mono"
                  />
                </div>
              </div>

              <div className="text-slate-500 text-[11px] flex items-center justify-center gap-1 pt-2 font-sans">
                <Lock className="h-3 w-3 text-indigo-400" /> Guaranteed end-to-end 256-bit secure Stripe encryption.
              </div>

              {/* Pay Button */}
              <button
                id="stripe-pay-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center justify-center gap-2 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer text-sm"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-slate-700 border-t-white rounded-full animate-spin"></span>
                    Authorizing Payment...
                  </span>
                ) : (
                  <>
                    <span>Pay {formattedPrice} FCFA</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
