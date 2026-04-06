import { useState } from "react";
import Srcc from "./srcc.jsx";
import SentimentTab from "./SentimentTab.jsx";
import FEC from "./fec.jsx";

export default function MainTabs() {

  const [activeTab, setActiveTab] = useState("fec");

  const tabBtn = (isActive) =>
    `px-6 py-3 rounded-full text-sm font-semibold transition ${
      isActive
        ? "bg-[#F0B90B] text-black"
        : "bg-transparent text-gray-400 border border-[#2B3139] hover:text-white"
    }`;


  const renderTabContent = () => {
    switch (activeTab) {
      case "srcc":
        return <Srcc />;
      case "fec":
        return <FEC />;
      case "sentiment":
      default:
        return <SentimentTab />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">

      <div className="max-w-6xl mx-auto mb-6 flex justify-center gap-4">
        
        <button
          className={tabBtn(activeTab === "srcc")}
          onClick={() => setActiveTab("srcc")}
        >
          IPO Evaluator
        </button>

        <button
          className={tabBtn(activeTab === "sentiment")}
          onClick={() => setActiveTab("sentiment")}
        >
          Sentiment Analysis
        </button>

        <button
          className={tabBtn(activeTab === "fec")}
          onClick={() => setActiveTab("fec")}
        >
          Deep Analysis
        </button>
        
      </div>


      {renderTabContent()}
      
    </div>
  );
}