import { useState } from "react";
const API_BASE = import.meta.env.VITE_API_BASE;
const WS_BASE = import.meta.env.VITE_WS_BASE;

export default function FEC() {
  const [form, setForm] = useState({
    issue_size: "",
    offer_price: "",
    qib: "",
    hni: "",
    rii: "",
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const inputFields = [
    { name: "issue_size", placeholder: "Issue Size (Cr)" },
    { name: "offer_price", placeholder: "Offer Price" },
    { name: "qib", placeholder: "QIB" },
    { name: "hni", placeholder: "HNI" },
    { name: "rii", placeholder: "RII" },
  ];

  const getResponse = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    const featuresData = {
      "Issue_Size(crores)": Number(form.issue_size),
      "Offer Price": Number(form.offer_price),
      QIB: Number(form.qib),
      HNI: Number(form.hni),
      RII: Number(form.rii),
    };

    const payload = { features: featuresData };

    try {
      const res = await fetch("http://localhost:8000/deep/deep_analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Something went wrong");
      }

      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `
    mt-1 w-full bg-[#0B0E11]/90 text-[#EAECEF]
    px-4 py-3 rounded-2xl border border-[#2B3139]
    hover:border-[#444C56] focus:border-[#F0B90B] outline-none
  `;

  const btnClass = `
    mt-5 py-2 rounded-2xl font-medium text-black w-full
    bg-[#F0B90B] hover:bg-[#ffd24d] transition
  `;

  const cardClass = `
    w-full relative bg-[#111417]/65 backdrop-blur-2xl 
    rounded-3xl p-6 border border-white/10 overflow-hidden
  `;

  const labelMap = { 0: "Below Average", 1: "Average", 2: "Above Average" };
  const labelColor = {
    "Below Average": "text-red-400",
    Average: "text-yellow-400",
    "Above Average": "text-green-400",
  };

  return (
    <div className="w-full min-h-screen bg-black flex items-center justify-center p-4">
      <div className={`${cardClass} max-w-6xl w-full`}>
        <div className="absolute inset-0 rounded-3xl pointer-events-none bg-gradient-to-b from-white/5 via-transparent to-transparent"></div>
        <div className="absolute inset-0 rounded-3xl pointer-events-none bg-gradient-to-b from-[#F0B90B]/12 via-transparent to-transparent"></div>

        <h2 className="text-[#EAECEF] mb-6 text-center md:text-left">
          Deep dive
        </h2>

        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start justify-center">
          {/* INPUT SECTION */}
          <div className="w-full max-w-sm md:w-[320px]">
            <div className="p-4 md:p-6 flex flex-col gap-4">
              {inputFields.map((field) => (
                <input
                  key={field.name}
                  name={field.name}
                  placeholder={field.placeholder}
                  value={form[field.name]}
                  onChange={(e) =>
                    setForm({ ...form, [field.name]: e.target.value })
                  }
                  className={inputClass}
                />
              ))}
              <button type="button" onClick={getResponse} className={btnClass}>
                {loading ? "Analyzing..." : "Get IPO Score"}
              </button>
            </div>
          </div>

          {/* RESULT SECTION */}
          {result && (
            <div className="w-full max-w-sm md:w-[320px] p-4 md:p-6 flex flex-col gap-4">
              <h3 className="text-[#EAECEF] text-lg font-semibold">Result</h3>

              <div className="bg-[#0B0E11] rounded-2xl p-4 border border-[#2B3139]">
                <p className="text-[#848E9C] text-sm">Prediction</p>
                <p
                  className={`text-2xl font-bold mt-1 ${labelColor[result.label]}`}
                >
                  {result.label}
                </p>
              </div>

              <div className="bg-[#0B0E11] rounded-2xl p-4 border border-[#2B3139]">
                <p className="text-[#848E9C] text-sm mb-3">Probabilities</p>
                {Object.entries(result.probabilities).map(([key, value]) => (
                  <div key={key} className="mb-2">
                    <div className="flex justify-between text-sm text-[#EAECEF] mb-1">
                      <span>{key}</span>
                      <span>{(value * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-[#2B3139] rounded-full h-2">
                      <div
                        className="bg-[#F0B90B] h-2 rounded-full"
                        style={{ width: `${value * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="w-full max-w-sm md:w-[320px] p-4">
              <p className="text-red-400">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
