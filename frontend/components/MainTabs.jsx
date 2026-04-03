<<<<<<< HEAD
import { useState } from "react";
import Srcc from "./srcc.jsx";
import SentimentTab from "./SentimentTab.jsx";

export default function MainTabs() {
  const [activeTab, setActiveTab] = useState("evaluator");

  const tabBtn = (isActive) =>
    `px-6 py-3 rounded-full text-sm font-semibold transition ${
      isActive
        ? "bg-[#F0B90B] text-black"
        : "bg-transparent text-gray-400 border border-[#2B3139] hover:text-white"
    }`;

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <div className="max-w-6xl mx-auto mb-6 flex justify-center gap-4">
        <button
          className={tabBtn(activeTab === "evaluator")}
          onClick={() => setActiveTab("evaluator")}
        >
          IPO Evaluator
        </button>

        <button
          className={tabBtn(activeTab === "sentiment")}
          onClick={() => setActiveTab("sentiment")}
        >
          Sentiment Analysis
        </button>
      </div>

      {activeTab === "evaluator" ? <Srcc /> : <SentimentTab />}
    </div>
  );
=======
import { useState } from "react";
import Srcc from "./srcc.jsx";
import SentimentTab from "./SentimentTab.jsx";

export default function MainTabs() {
  const [activeTab, setActiveTab] = useState("evaluator");

  const tabBtn = (isActive) =>
    `px-6 py-3 rounded-full text-sm font-semibold transition ${
      isActive
        ? "bg-[#F0B90B] text-black"
        : "bg-transparent text-gray-400 border border-[#2B3139] hover:text-white"
    }`;

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <div className="max-w-6xl mx-auto mb-6 flex justify-center gap-4">
        <button
          className={tabBtn(activeTab === "evaluator")}
          onClick={() => setActiveTab("evaluator")}
        >
          IPO Evaluator
        </button>

        <button
          className={tabBtn(activeTab === "sentiment")}
          onClick={() => setActiveTab("sentiment")}
        >
          Sentiment Analysis
        </button>
      </div>

      {activeTab === "evaluator" ? <Srcc /> : <SentimentTab />}
    </div>
  );
>>>>>>> 2a5a45c (backend fixed)
}   