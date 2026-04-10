import { useState, useEffect, useRef, useCallback } from "react";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  ScatterController,
} from "chart.js";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  ScatterController
);

const API_BASE = "http://127.0.0.1:8000";
const WS_URL = "ws://127.0.0.1:8000/sentiment/ws/v_t_stream";

const fmt = (v, d = 4) => {
  const num = parseFloat(v);
  if (Number.isNaN(num)) return "--";
  return `${num >= 0 ? "+" : ""}${num.toFixed(d)}`;
};

const pct = (v) => {
  const num = parseFloat(v);
  if (Number.isNaN(num)) return "--";
  return `${(num * 100).toFixed(1)}%`;
};

function StatCard({ label, value, color }) {
  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-lg p-4 text-center">
      <div className="text-xl font-bold mb-1" style={{ color }}>
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-widest text-[#555]">
        {label}
      </div>
    </div>
  );
}

function InputScreen({ onStart }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/sentiment/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ipo_name: name.trim() }),
      });

      if (!res.ok) {
        throw new Error("Server error");
      }

      onStart(name.trim());
    } catch (e) {
      console.error(e);
      setError("Could not connect to sentiment server. Is it running on port 8001?");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-transparent">
      <div className="bg-[#0f0f0f] border border-[#222] rounded-2xl p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-[#F0B90B] text-2xl font-bold tracking-widest mb-1">
            IPO SENTIMENT ENGINE
          </div>
        </div>
        <div className="mb-2 text-[#555] text-xs uppercase tracking-widest">
          IPO / Company Name
        </div>

        <input
          className="w-full bg-[#080808] border border-[#333] rounded-lg px-4 py-3 text-[#eee] text-sm outline-none focus:border-[#ffeb3b] transition-colors mb-4"
          placeholder="e.g. Meesho, Shadowfax, APL Apollo..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />

        {error && <div className="text-[#ff5252] text-xs mb-4">{error}</div>}

        <button
          onClick={handleSubmit}
          disabled={loading || !name.trim()}
          className="w-full py-3 rounded-lg font-bold text-sm tracking-widest uppercase transition-all"
          style={{
            background: loading || !name.trim() ? "#1a1a1a" : "#ffeb3b",
            color: loading || !name.trim() ? "#333" : "#080808",
            cursor: loading || !name.trim() ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "STARTING ENGINE..." : "ANALYZE SENTIMENT"}
        </button>

        <div className="mt-6 text-[#2a2a2a] text-[10px] text-center leading-relaxed">
          Powered by FinBERT · Google News RSS · India VIX
        </div>
      </div>
    </div>
  );
}

function Dashboard({ ipoName, onReset }) {
  const ticker = ipoName.toUpperCase().replace(/ /g, "_") + "_IPO";

  const [status, setStatus] = useState("CONNECTING");
  const [regime, setRegime] = useState({ text: "SYNCING...", color: "#888" });
  const [stats, setStats] = useState({
    velocity: "--",
    conf: "--",
    pos: "--",
    neg: "--",
    velColor: "#ffeb3b",
  });
  const [bias, setBias] = useState({ pos: 50, neg: 50 });
  const [headline, setHeadline] = useState("Waiting for first signal...");

  const mainChartRef = useRef(null);
  const convChartRef = useRef(null);
  const mainCanvasRef = useRef(null);
  const convCanvasRef = useRef(null);
  const vHistoryRef = useRef([]);
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);

  useEffect(() => {
    if (!mainCanvasRef.current || !convCanvasRef.current) return;

    const mainCtx = mainCanvasRef.current.getContext("2d");
    const convCtx = convCanvasRef.current.getContext("2d");

    mainChartRef.current = new Chart(mainCtx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "SMA Trend",
            data: [],
            borderColor: "#ffeb3b",
            borderWidth: 3,
            pointRadius: 0,
            tension: 0.4,
          },
          {
            label: "Raw Velocity",
            data: [],
            borderColor: "rgba(0,229,255,0.35)",
            borderWidth: 1,
            pointRadius: 3,
            tension: 0.2,
          },
          {
            label: "Bull Threshold",
            data: [],
            borderColor: "rgba(0,230,118,0.25)",
            borderDash: [8, 5],
            borderWidth: 1,
            pointRadius: 0,
          },
          {
            label: "Bear Threshold",
            data: [],
            borderColor: "rgba(255,82,82,0.25)",
            borderDash: [8, 5],
            borderWidth: 1,
            pointRadius: 0,
          },
        ],
      },
      options: {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: { color: "#444", maxTicksLimit: 8 },
            grid: { color: "#151515" },
          },
          y: {
            min: -3,
            max: 3,
            ticks: { color: "#444" },
            grid: { color: "#1a1a1a" },
          },
        },
        plugins: {
          legend: {
            labels: { color: "#555", boxWidth: 12 },
          },
        },
      },
    });

    convChartRef.current = new Chart(convCtx, {
      type: "scatter",
      data: {
        datasets: [
          {
            label: "Signals",
            data: [],
            backgroundColor: (ctx) => {
              const v = ctx.raw ? ctx.raw.x : 0;
              return v > 0.04
                ? "rgba(0,230,118,0.7)"
                : v < -0.04
                ? "rgba(255,82,82,0.7)"
                : "rgba(255,235,59,0.5)";
            },
            pointRadius: 6,
          },
        ],
      },
      options: {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            min: -3,
            max: 3,
            title: {
              display: true,
              text: "Velocity",
              color: "#555",
            },
            ticks: { color: "#444" },
            grid: { color: "#151515" },
          },
          y: {
            min: 0.3,
            max: 1.0,
            title: {
              display: true,
              text: "Confidence",
              color: "#555",
            },
            ticks: { color: "#444" },
            grid: { color: "#151515" },
          },
        },
        plugins: {
          legend: { display: false },
        },
      },
    });

    return () => {
      mainChartRef.current?.destroy();
      convChartRef.current?.destroy();
      mainChartRef.current = null;
      convChartRef.current = null;
    };
  }, []);

  const connect = useCallback(() => {
    const ws = new WebSocket(WS_URL);
    socketRef.current = ws;

    ws.onopen = () => {
      setStatus("LIVE");
    };

    ws.onclose = () => {
      setStatus("RECONNECTING");
      reconnectTimerRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };

    ws.onmessage = (event) => {
      const d = JSON.parse(event.data);
      const time = new Date().toLocaleTimeString();

      setHeadline("▶ " + (d.headline || "No headline"));

      const v = parseFloat(d.velocity);
      const velColor = v > 0.04 ? "#00e676" : v < -0.04 ? "#ff5252" : "#ffeb3b";

      setStats({
        velocity: fmt(v),
        conf: pct(d.confidence),
        pos: pct(d.pos),
        neg: pct(d.neg),
        velColor,
      });

      const total = (d.pos || 0.5) + (d.neg || 0.5);
      setBias({
        pos: ((d.pos / total) * 100).toFixed(1),
        neg: ((d.neg / total) * 100).toFixed(1),
      });

      vHistoryRef.current.push(v);
      if (vHistoryRef.current.length > 5) {
        vHistoryRef.current.shift();
      }
      const sma =
        vHistoryRef.current.reduce((a, b) => a + b, 0) / vHistoryRef.current.length;

      if (sma > 0.04) {
        setRegime({ text: "🚀 BULLISH", color: "#00e676" });
      } else if (sma < -0.04) {
        setRegime({ text: "📉 BEARISH", color: "#ff5252" });
      } else {
        setRegime({ text: "● NEUTRAL", color: "#888" });
      }

      const mc = mainChartRef.current;
      if (mc) {
        mc.data.labels.push(time);
        mc.data.datasets[0].data.push(sma);
        mc.data.datasets[1].data.push(v);
        mc.data.datasets[2].data.push(0.04);
        mc.data.datasets[3].data.push(-0.04);

        if (mc.data.labels.length > 30) {
          mc.data.labels.shift();
          mc.data.datasets.forEach((s) => s.data.shift());
        }

        mc.update("none");
      }

      const cc = convChartRef.current;
      if (cc) {
        cc.data.datasets[0].data.push({ x: v, y: d.confidence });
        if (cc.data.datasets[0].data.length > 20) {
          cc.data.datasets[0].data.shift();
        }
        cc.update("none");
      }
    };
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      socketRef.current?.close();
    };
  }, [connect]);

  const handleStop = async () => {
    try {
      await fetch(`${API_BASE}/sentiment/stop`, { method: "POST" });
    } catch (e) {
      console.error(e);
    }

    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }
    socketRef.current?.close();
    onReset();
  };

  const statusColor =
    status === "LIVE" ? "#00e676" : status === "RECONNECTING" ? "#ff5252" : "#555";

  return (
    <div className="min-h-screen bg-[#080808] text-[#eee] p-5">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="lg:col-span-2 bg-[#121212] border border-[#1e1e1e] rounded-lg px-5 py-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b-2 border-b-[#ffeb3b]">
          <div>
            <span className="text-[#ffeb3b] font-bold text-lg tracking-widest">
              IPO SENTIMENT ENGINE
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <span className="bg-[#1a1a1a] border border-[#333] px-3 py-1 rounded text-[#ffeb3b] text-sm">
              {ticker}
            </span>

            <span className="flex items-center gap-2 text-xs" style={{ color: statusColor }}>
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  status === "LIVE" ? "animate-pulse" : ""
                }`}
                style={{ background: statusColor }}
              />
              {status}
            </span>

            <div className="text-xl font-bold" style={{ color: regime.color }}>
              {regime.text}
            </div>

            <button
              onClick={handleStop}
              className="text-xs px-3 py-1 rounded border border-[#333] text-[#555] hover:text-[#ff5252] hover:border-[#ff5252] transition-colors"
            >
              ■ STOP
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <StatCard
            label="Sentiment Velocity"
            value={stats.velocity}
            color={stats.velColor || "#ffeb3b"}
          />
          <StatCard label="AI Confidence" value={stats.conf} color="#00b0ff" />
          <StatCard label="Bullish Bias" value={stats.pos} color="#00e676" />
          <StatCard label="Bearish Bias" value={stats.neg} color="#ff5252" />
        </div>

        <div className="bg-[#121212] border border-[#1e1e1e] rounded-lg p-5">
          <div className="text-[#555] text-[11px] uppercase tracking-widest mb-4">
            Sentiment Velocity — SMA Trend vs Raw Signal
          </div>
          <div className="h-[320px]">
            <canvas ref={mainCanvasRef} />
          </div>
        </div>

        <div className="bg-[#121212] border border-[#1e1e1e] rounded-lg p-5">
          <div className="text-[#555] text-[11px] uppercase tracking-widest mb-4">
            Conviction Cluster (Velocity × Confidence)
          </div>
          <div className="h-[320px]">
            <canvas ref={convCanvasRef} />
          </div>
        </div>

        <div className="lg:col-span-2 bg-[#121212] border border-[#1e1e1e] rounded-lg p-5">
          <div className="text-[#555] text-[11px] uppercase tracking-widest mb-4">
            Sentiment Tug-of-War — Direct Model Bias
          </div>

          <div className="h-4 w-full bg-[#111] rounded-full flex overflow-hidden border border-[#2a2a2a]">
            <div
              className="h-full transition-all duration-700"
              style={{
                width: `${bias.pos}%`,
                background: "linear-gradient(90deg,#00c853,#00e676)",
              }}
            />
            <div
              className="h-full transition-all duration-700"
              style={{
                width: `${bias.neg}%`,
                background: "linear-gradient(90deg,#ff5252,#d50000)",
              }}
            />
          </div>

          <div className="flex justify-between mt-2 text-[11px]">
            <span style={{ color: "#00e676" }}>BULLISH {bias.pos}%</span>
            <span style={{ color: "#ff5252" }}>{bias.neg}% BEARISH</span>
          </div>
        </div>

        <div className="lg:col-span-2 bg-[#121212] border border-[#1e1e1e] rounded-lg p-5 overflow-hidden">
          <div className="text-[#555] text-[11px] uppercase tracking-widest mb-3">
            Live Signal Feed
          </div>
          <div className="overflow-hidden whitespace-nowrap">
            <span className="inline-block animate-[marquee_20s_linear_infinite] text-[#888] text-sm">
              {headline}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}

export default function SentimentTab() {
  const [ipoName, setIpoName] = useState(null);

  return ipoName ? (
    <Dashboard ipoName={ipoName} onReset={() => setIpoName(null)} />
  ) : (
    <InputScreen onStart={setIpoName} />
  );
}