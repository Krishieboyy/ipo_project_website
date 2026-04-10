import { useState } from "react";

const SECTORS = [
  "Banking & Nbfc",
  "Fmcg",
  "Industrial & Engineering",
  "Infrastructure",
  "It & Technology",
  "Pharma & Healthcare",
];

const INPUT_FIELDS = [
  { name: "issue_size", label: "Issue Size", placeholder: "0.00", unit: "₹ Cr" },
  { name: "offer_price", label: "Offer Price", placeholder: "0.00", unit: "₹" },
  { name: "qib", label: "QIB Subscription", placeholder: "0.00", unit: "×" },
  { name: "hni", label: "HNI Subscription", placeholder: "0.00", unit: "×" },
  { name: "rii", label: "RII Subscription", placeholder: "0.00", unit: "×" },
  { name: "total_subscription", label: "Total Sub.", placeholder: "0.00", unit: "×" },
];

export default function IPOPredictor() {
  const [sector, setSector] = useState("");
  const [form, setForm] = useState({
    issue_size: "",
    offer_price: "",
    qib: "",
    hni: "",
    rii: "",
    total_subscription: "",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!sector) {
      setError("Please select a sector to continue.");
      return;
    }
    const missing = INPUT_FIELDS.filter((f) => form[f.name] === "");
    if (missing.length > 0) {
      setError(`Missing fields: ${missing.map((f) => f.label).join(", ")}`);
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);

    const payload = {
      sector,
      features: {
        "Issue_Size(crores)": Number(form.issue_size),
        "QIB": Number(form.qib),
        "HNI": Number(form.hni),
        "RII": Number(form.rii),
        "Total Subscription": Number(form.total_subscription),
        "Offer Price": Number(form.offer_price),
      },
    };

    try {
      const res = await fetch("http://localhost:8001/predict_ipo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Prediction engine failed to respond.");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050608] text-[#EAECEF] p-4 md:p-8 font-sans selection:bg-[#F0B90B] selection:text-black relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#F0B90B]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-[#F0B90B]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* LEFT COLUMN: Inputs & Sectors (Span 8) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
            <p>Sector wise predictions</p>

          {/* Sector Selection Bento Box */}
          <div className="bg-[#0B0E11]/80 backdrop-blur-xl rounded-3xl p-8 border border-white/5 shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-xs text-[#848E9C]">1</span>
              Market Sector
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {SECTORS.map((s) => {
                const isActive = sector === s;
                return (
                  <button
                    key={s}
                    onClick={() => setSector(s)}
                    className={`relative group px-4 py-4 rounded-2xl text-sm font-medium transition-all duration-300 text-left overflow-hidden border
                      ${isActive 
                        ? "border-[#F0B90B] bg-[#F0B90B]/10 text-white shadow-[0_0_15px_rgba(240,185,11,0.15)]" 
                        : "border-[#2B3139] bg-[#11141A] text-[#848E9C] hover:border-[#444C56] hover:text-white"
                      }`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-[#F0B90B]/0 via-[#F0B90B]/5 to-[#F0B90B]/0 translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]" />
                    )}
                    <div className="flex items-center justify-between relative z-10">
                      <span>{s}</span>
                      {isActive && (
                         <svg className="w-4 h-4 text-[#F0B90B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                         </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Metrics Bento Box */}
          <div className="bg-[#0B0E11]/80 backdrop-blur-xl rounded-3xl p-8 border border-white/5 shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-xs text-[#848E9C]">2</span>
              Offering Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {INPUT_FIELDS.map((field) => (
                <div key={field.name} className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[#848E9C] uppercase tracking-wide ml-1">
                    {field.label}
                  </label>
                  <div className="relative group">
                    <input
                      name={field.name}
                      type="number"
                      placeholder={field.placeholder}
                      value={form[field.name]}
                      onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                      className="w-full bg-[#11141A] text-white px-4 py-3.5 rounded-2xl border border-[#2B3139] 
                        group-hover:border-[#444C56] focus:border-[#F0B90B] focus:bg-[#151920] outline-none transition-all duration-300"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#444C56] text-sm font-medium pointer-events-none group-focus-within:text-[#F0B90B] transition-colors">
                      {field.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}