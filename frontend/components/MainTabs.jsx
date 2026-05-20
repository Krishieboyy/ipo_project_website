import { useState } from "react";
import Srcc from "./srcc.jsx";
import SentimentTab from "./SentimentTab.jsx";
import FEC from "./fec.jsx";
import Sectorwise from "./sectorwise.jsx"
const API_BASE = import.meta.env.VITE_API_BASE;
const WS_BASE = import.meta.env.VITE_WS_BASE;

export default function MainTabs() {
  // Main tabs component for switching between different analysis views
  const [activeTab, setActiveTab] = useState("srcc");

  const tabBtn = (isActive) =>
    `px-5 py-2 text-sm font-medium transition-all duration-100 border ${
      isActive
        ? "bg-[#F0B90B] text-black border-[#F0B90B]"
        : "bg-transparent text-[#555] border-[#222] hover:text-[#F0B90B] hover:border-[#F0B90B44]"
    }`;

  const renderTabContent = () => {
    switch (activeTab) {
      case "srcc":
        return <Srcc />;
      case "fec":
        return <FEC />;
      case "sectorwise":
        return <Sectorwise />;
      case "sentiment":
      default:
        return <SentimentTab />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white px-4 py-8">

      {/* site header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/web-logo.png" alt="IPOVision" className="h-8 w-8" />
            <span className="text-2xl font-bold tracking-tight text-white">IPOVision</span>
          </div>
          <span className="text-[10px] text-[#2a2a2a] tracking-widest">v0.1.0</span>
        </div>
        <div className="mt-3 h-px bg-[#161616]" />
      </div>

      {/* tabs */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-wrap gap-2">
        <button className={tabBtn(activeTab === "srcc")} onClick={() => setActiveTab("srcc")}>
          &gt; IPO_Evaluator
        </button>
        <button className={tabBtn(activeTab === "sentiment")} onClick={() => setActiveTab("sentiment")}>
          &gt; Sentiment
        </button>
        <button className={tabBtn(activeTab === "fec")} onClick={() => setActiveTab("fec")}>
          &gt; Deep_Analysis
        </button>
        <button className={tabBtn(activeTab === "sectorwise")} onClick={() => setActiveTab("sectorwise")}>
          &gt; Sectorwise
        </button>
      </div>

      {renderTabContent()}

    </div>
  );
}