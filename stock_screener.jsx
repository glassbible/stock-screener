import { useState, useCallback, useRef } from "react";

const SECTORS = [
  "All Sectors",
  "Technology",
  "Healthcare",
  "Financial",
  "Consumer Discretionary",
  "Consumer Staples",
  "Energy",
  "Industrials",
  "Materials",
  "Real Estate",
  "Utilities",
  "Communication Services",
];

const MARKETS = ["US", "TW (台股)", "HK (港股)", "JP (日股)"];

const REVENUE_GROWTH_MIN = [
  { label: ">10%", value: 10 },
  { label: ">20%", value: 20 },
  { label: ">30%", value: 30 },
  { label: ">50%", value: 50 },
];

const PRICE_CHANGE_MAX = [
  { label: "<5%", value: 5 },
  { label: "<10%", value: 10 },
  { label: "<15%", value: 15 },
  { label: "<20%", value: 20 },
];

const TIMEFRAME = ["近一季 (QoQ)", "近一年 (YoY)", "近兩年"];

function parseStocksFromResponse(text) {
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    // fallback
  }
  return [];
}

function StockCard({ stock, index }) {
  const [expanded, setExpanded] = useState(false);
  const revenueColor =
    stock.revenueGrowth >= 30
      ? "#00e676"
      : stock.revenueGrowth >= 20
      ? "#76ff03"
      : "#c6ff00";
  const priceColor =
    stock.priceChange <= 5
      ? "#ff1744"
      : stock.priceChange <= 10
      ? "#ff9100"
      : "#ffc400";

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      style={{
        background: "rgba(15,25,40,0.85)",
        border: "1px solid rgba(100,180,255,0.12)",
        borderRadius: 14,
        padding: "20px 22px",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(.4,0,.2,1)",
        animationDelay: `${index * 80}ms`,
        animation: "fadeSlideUp 0.5s ease both",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.border = "1px solid rgba(100,180,255,0.35)";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,120,255,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.border = "1px solid rgba(100,180,255,0.12)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: `${Math.min(stock.revenueGrowth * 2, 100)}%`,
          height: 2,
          background: `linear-gradient(90deg, ${revenueColor}00, ${revenueColor}88)`,
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: "#e0eaff", letterSpacing: 1 }}>
              {stock.ticker}
            </span>
            {stock.sector && (
              <span style={{ fontSize: 10, padding: "2px 8px", background: "rgba(100,180,255,0.1)", borderRadius: 20, color: "#7ab8ff", textTransform: "uppercase", letterSpacing: 0.5 }}>
                {stock.sector}
              </span>
            )}
          </div>
          <div style={{ fontSize: 13, color: "#8899bb", maxWidth: 250 }}>{stock.name}</div>
        </div>
        <a
          href={stock.googleFinanceUrl || `https://www.google.com/finance/quote/${stock.ticker}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{ fontSize: 11, color: "#5599dd", textDecoration: "none", padding: "4px 10px", border: "1px solid rgba(85,153,221,0.3)", borderRadius: 6, transition: "all 0.2s" }}
        >
          Google Finance ↗
        </a>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: expanded ? 16 : 0 }}>
        <div style={{ background: "rgba(0,230,118,0.06)", borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ fontSize: 10, color: "#6b8a6b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>營收成長</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 24, fontWeight: 700, color: revenueColor }}>+{stock.revenueGrowth}%</div>
        </div>
        <div style={{ background: "rgba(255,145,0,0.06)", borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ fontSize: 10, color: "#8a7a5b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>股價漲幅</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 24, fontWeight: 700, color: priceColor }}>
            {stock.priceChange > 0 ? "+" : ""}{stock.priceChange}%
          </div>
        </div>
      </div>
      {expanded && (
        <div style={{ animation: "fadeIn 0.3s ease", borderTop: "1px solid rgba(100,180,255,0.08)", paddingTop: 14 }}>
          <div style={{ fontSize: 13, color: "#99aabb", lineHeight: 1.7 }}>
            {stock.reason || stock.analysis || "點擊 Google Finance 連結查看更多資訊"}
          </div>
          {stock.marketCap && <div style={{ marginTop: 8, fontSize: 12, color: "#667788" }}>市值: {stock.marketCap}</div>}
          {stock.price && <div style={{ fontSize: 12, color: "#667788" }}>目前股價: {stock.price}</div>}
          <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(0,120,255,0.08)", borderRadius: 8, fontSize: 12, color: "#7ab8ff", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 14 }}>💡</span>
            <span>差距比: <strong>{(stock.revenueGrowth / Math.max(stock.priceChange, 1)).toFixed(1)}x</strong> — 營收成長遠超股價反映</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StockScreener() {
  const [market, setMarket] = useState("US");
  const [sector, setSector] = useState("All Sectors");
  const [revenueMin, setRevenueMin] = useState(20);
  const [priceMax, setPriceMax] = useState(10);
  const [timeframe, setTimeframe] = useState("近一年 (YoY)");
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [progress, setProgress] = useState("");
  const [sortBy, setSortBy] = useState("gap");

  const runScreener = useCallback(async () => {
    setLoading(true);
    setError(null);
    setStocks([]);
    setProgress("正在搜尋市場資料...");

    const marketLabel =
      market === "TW (台股)" ? "Taiwan Stock Exchange (TWSE)"
      : market === "HK (港股)" ? "Hong Kong Stock Exchange (HKEX)"
      : market === "JP (日股)" ? "Tokyo Stock Exchange (TSE)"
      : "US stock market (NYSE, NASDAQ)";

    const sectorFilter = sector === "All Sectors" ? "" : `in the ${sector} sector`;

    const prompt = `You are a financial research analyst. Find stocks on the ${marketLabel} ${sectorFilter} that meet ALL these criteria:

1. Revenue growth (${timeframe}) of at least ${revenueMin}%
2. Stock price change over the same period of less than ${priceMax}%

Find 8-12 real stocks. Return ONLY a valid JSON array. No text before or after.
Each object must have:
- "ticker": string (e.g. "AAPL:NASDAQ" for US)
- "name": string
- "revenueGrowth": number (percentage)
- "priceChange": number (percentage, can be negative)
- "sector": string
- "reason": string (1-2 sentences in Traditional Chinese)
- "marketCap": string
- "price": string
- "googleFinanceUrl": string

Return ONLY the JSON array.`;

    try {
      setProgress("AI 正在分析中...");
      const response = await fetch("/api/screen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`API error ${response.status}: ${errBody.slice(0, 200)}`);
      }

      const data = await response.json();
      const text = data.text || "";

      setProgress("正在分析篩選結果...");
      const parsed = parseStocksFromResponse(text);

      if (parsed.length === 0) {
        setError("未找到符合條件的股票，請嘗試調整篩選條件。");
      } else {
        setStocks(parsed);
        setLastUpdated(new Date());
      }
    } catch (err) {
      setError(`篩選失敗: ${err.message}. 請稍後再試。`);
    } finally {
      setLoading(false);
      setProgress("");
    }
  }, [market, sector, revenueMin, priceMax, timeframe]);

  const sortedStocks = [...stocks].sort((a, b) => {
    if (sortBy === "gap") return b.revenueGrowth / Math.max(b.priceChange, 1) - a.revenueGrowth / Math.max(a.priceChange, 1);
    if (sortBy === "revenue") return b.revenueGrowth - a.revenueGrowth;
    if (sortBy === "price") return a.priceChange - b.priceChange;
    return 0;
  });

  const selectStyle = {
    width: "100%",
    background: "rgba(20,35,60,0.8)",
    border: "1px solid rgba(100,180,255,0.15)",
    borderRadius: 8,
    padding: "10px 12px",
    color: "#c8d8f0",
    fontSize: 14,
    outline: "none",
    cursor: "pointer",
    appearance: "auto",
  };

  const labelStyle = {
    display: "block",
    fontSize: 11,
    color: "#5a7799",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 6,
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(170deg, #060d18 0%, #0a1628 40%, #0d1f35 100%)", color: "#c8d8f0", fontFamily: "'Noto Sans TC', 'SF Pro Display', -apple-system, sans-serif", position: "relative", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Noto+Sans+TC:wght@300;400;500;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        select, button { font-family: 'Noto Sans TC', sans-serif; }
        select option { background: #0a1628; color: #c8d8f0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: rgba(100,180,255,0.2); border-radius: 3px; }
      `}</style>

      <div style={{ position: "fixed", top: -200, right: -200, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,80,200,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px" }}>
        {/* Header */}
        <div style={{ marginBottom: 36, animation: "fadeSlideUp 0.6s ease both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #0066ff, #00ccaa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📊</div>
            <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, background: "linear-gradient(135deg, #e0eaff, #7ab8ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: -0.5 }}>
              價值落差篩選器
            </h1>
          </div>
          <p style={{ fontSize: 14, color: "#5a7799", margin: 0, lineHeight: 1.6 }}>
            找出營收成長強勁、但股價尚未反映的潛力標的 — 每週更新
          </p>
        </div>

        {/* Filters */}
        <div style={{ background: "rgba(12,22,40,0.8)", border: "1px solid rgba(100,180,255,0.1)", borderRadius: 16, padding: "24px", marginBottom: 28, animation: "fadeSlideUp 0.6s ease 0.1s both" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 20 }}>
            <div><label style={labelStyle}>市場</label><select value={market} onChange={(e) => setMarket(e.target.value)} style={selectStyle}>{MARKETS.map((m) => <option key={m} value={m}>{m}</option>)}</select></div>
            <div><label style={labelStyle}>產業</label><select value={sector} onChange={(e) => setSector(e.target.value)} style={selectStyle}>{SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
            <div><label style={labelStyle}>最低營收成長</label><select value={revenueMin} onChange={(e) => setRevenueMin(Number(e.target.value))} style={selectStyle}>{REVENUE_GROWTH_MIN.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}</select></div>
            <div><label style={labelStyle}>最高股價漲幅</label><select value={priceMax} onChange={(e) => setPriceMax(Number(e.target.value))} style={selectStyle}>{PRICE_CHANGE_MAX.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}</select></div>
            <div><label style={labelStyle}>時間範圍</label><select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} style={selectStyle}>{TIMEFRAME.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
          </div>
          <button
            onClick={runScreener}
            disabled={loading}
            style={{ width: "100%", padding: "14px", background: loading ? "rgba(0,100,255,0.15)" : "linear-gradient(135deg, #0055dd, #0088cc)", border: "none", borderRadius: 10, color: "#fff", fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.3s", letterSpacing: 0.5 }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                {progress || "篩選中..."}
              </span>
            ) : "🔍 開始篩選"}
          </button>
        </div>

        {/* Status bar */}
        {lastUpdated && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, animation: "fadeIn 0.4s ease" }}>
            <span style={{ fontSize: 13, color: "#5a7799" }}>找到 <strong style={{ color: "#7ab8ff" }}>{stocks.length}</strong> 檔標的</span>
            <div style={{ display: "flex", gap: 6 }}>
              {[{ key: "gap", label: "差距比" }, { key: "revenue", label: "營收" }, { key: "price", label: "股價" }].map((s) => (
                <button key={s.key} onClick={() => setSortBy(s.key)} style={{ padding: "4px 12px", fontSize: 11, borderRadius: 6, border: sortBy === s.key ? "1px solid rgba(100,180,255,0.4)" : "1px solid rgba(100,180,255,0.1)", background: sortBy === s.key ? "rgba(0,100,255,0.15)" : "transparent", color: sortBy === s.key ? "#7ab8ff" : "#5a7799", cursor: "pointer" }}>{s.label}</button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: "rgba(255,23,68,0.08)", border: "1px solid rgba(255,23,68,0.2)", borderRadius: 12, padding: "16px 20px", color: "#ff6b6b", fontSize: 14, marginBottom: 20, animation: "fadeIn 0.3s ease" }}>
            ⚠️ {error}
          </div>
        )}

        {/* Stock Cards */}
        <div style={{ display: "grid", gap: 14 }}>
          {sortedStocks.map((stock, i) => <StockCard key={stock.ticker + i} stock={stock} index={i} />)}
        </div>

        {/* Empty state */}
        {!loading && stocks.length === 0 && !error && (
          <div style={{ textAlign: "center", padding: "60px 20px", animation: "fadeIn 0.5s ease" }}>
            <div style={{ fontSize: 48, marginBottom: 16, animation: "float 3s ease-in-out infinite" }}>🎯</div>
            <div style={{ fontSize: 16, color: "#5a7799", marginBottom: 8 }}>設定條件後點擊「開始篩選」</div>
            <div style={{ fontSize: 13, color: "#3a5070" }}>AI 將分析並找出營收成長強勁但股價仍被低估的標的</div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid rgba(100,180,255,0.06)", textAlign: "center", fontSize: 11, color: "#2a3a55", lineHeight: 1.8 }}>
          <div>資料透過 AI 分析取得，僅供參考，不構成投資建議</div>
          <div>建議每週一執行篩選以獲取最新資料</div>
        </div>
      </div>
    </div>
  );
}
