import { useState } from "react";
const API_BASE = import.meta.env.VITE_API_BASE;
const WS_BASE = import.meta.env.VITE_WS_BASE;

const SECTORS = [
  "Banking & Nbfc",
  "Fmcg",
  "Industrial & Engineering",
  "Infrastructure",
  "It & Technology",
  "Pharma & Healthcare",
];

const INPUT_FIELDS = [
  {
    name: "issue_size",
    label: "Issue Size",
    placeholder: "0.00",
    unit: "₹ Cr",
  },
  { name: "offer_price", label: "Offer Price", placeholder: "0.00", unit: "₹" },
  { name: "qib", label: "QIB Subscription", placeholder: "0.00", unit: "×" },
  { name: "hni", label: "HNI Subscription", placeholder: "0.00", unit: "×" },
  { name: "rii", label: "RII Subscription", placeholder: "0.00", unit: "×" },
  {
    name: "total_subscription",
    label: "Total Sub.",
    placeholder: "0.00",
    unit: "×",
  },
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
      features: [
        Number(form.issue_size),
        Number(form.offer_price),
        Number(form.qib),
        Number(form.hni),
        Number(form.rii),
        Number(form.total_subscription),
      ],
    };

    try {
      const res = await fetch("http://localhost:8000/sector/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.detail || "Prediction engine failed to respond.");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-black flex items-center justify-center p-4">
      <div
        className="
          w-full max-w-7xl rounded-[32px] border border-white/10
          bg-gradient-to-b from-[#3a3217]/85 via-[#0b0e11]/96 to-[#050608]
          backdrop-blur-2xl px-6 py-8 md:px-10 md:py-10
          shadow-[0_0_40px_rgba(240,185,11,0.06)]
        "
      >
        <h2 className="text-[#EAECEF] text-2xl md:text-3xl mb-8">
          Sector wise predictions
        </h2>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
          <div className="bg-[#0B0E11]/80 border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-xs text-[#848E9C]">
                1
              </span>
              Market Sector
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SECTORS.map((s) => {
                const isActive = sector === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSector(s)}
                    className={`px-4 py-4 rounded-2xl text-sm font-medium text-left border transition-all duration-300
                      ${
                        isActive
                          ? "border-[#F0B90B] bg-[#F0B90B]/10 text-white shadow-[0_0_15px_rgba(240,185,11,0.14)]"
                          : "border-[#2B3139] bg-[#11141A] text-[#848E9C] hover:border-[#444C56] hover:text-white"
                      }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span>{s}</span>
                      {isActive && (
                        <svg
                          className="w-4 h-4 text-[#F0B90B] shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-[#0B0E11]/80 border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-xs text-[#848E9C]">
                2
              </span>
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
                      onChange={(e) =>
                        setForm({ ...form, [field.name]: e.target.value })
                      }
                      className="
                        w-full bg-[#11141A] text-white px-4 py-3.5 rounded-2xl
                        border border-[#2B3139] outline-none transition-all duration-300
                        group-hover:border-[#444C56] focus:border-[#F0B90B] focus:bg-[#151920]
                      "
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

        <div className="flex justify-center mt-8">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="
              min-w-[220px] px-8 py-3 rounded-2xl font-medium text-black
              bg-[#F0B90B] hover:bg-[#ffd24d] transition disabled:opacity-60
            "
          >
            {loading ? "Getting Result..." : "Get Result"}
          </button>
        </div>

        {error && (
          <div className="mt-4 text-center text-sm text-red-400">{error}</div>
        )}

        {result && (
          <div className="mt-8 bg-[#0B0E11]/80 border border-white/10 rounded-3xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-3">Result</h3>
            {result && (
              <div className="mt-8 w-full max-w-xl mx-auto bg-[#0B0E11]/80 border border-white/10 rounded-3xl p-6 text-white text-center">
                <h3 className="text-lg text-[#848E9C] mb-4">
                  Prediction Result
                </h3>

                {/* Score */}
                <div className="text-5xl font-bold text-[#F0B90B] mb-2">
                  {result.prediction.toFixed(2)}
                </div>

                <div className="text-sm text-[#848E9C] mb-6">IPO Score</div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4 text-sm text-left">
                  <div>
                    <span className="text-[#848E9C]">Sector</span>
                    <div className="text-white">{result.sector}</div>
                  </div>

                  <div>
                    <span className="text-[#848E9C]">Model</span>
                    <div className="text-white">{result.model_type}</div>
                  </div>

                  <div>
                    <span className="text-[#848E9C]">R² Score</span>
                    <div className="text-white">{result.r2}</div>
                  </div>

                  <div>
                    <span className="text-[#848E9C]">Status</span>
                    <div className="text-green-400">{result.status}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
