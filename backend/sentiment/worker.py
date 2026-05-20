import torch, time, json, psycopg2, feedparser, yfinance as yf
from newspaper import Article
from datetime import datetime, timezone
from transformers import AutoModelForSequenceClassification, AutoTokenizer
from urllib.parse import quote
from collections import deque

# UI Libraries
from rich.console import Console
from rich.live import Live
from rich.table import Table

# --- 1. CONFIGURATION ---
DB_SETTINGS = {"dbname": "postgres", "user": "postgres", "password": "Swayam@3030", "host": "127.0.0.1", "port": "5432"}
MODEL_ID = "yiyanghkust/finbert-tone"
WINDOW_SIZE = 10  # Smoothing window (approx 2.5 mins of data)

# 2026 Specific Signals
MARKET_SIGNALS = {
    "gmp zero": -1.5, "gmp crash": -1.4, "nil gmp": -1.2,
    "lock-in pressure": -1.1, "lower circuit": -1.5,
    "listing day": 0.5, "oversubscribed": 0.3
}

# --- 2. SMOOTHING ENGINE ---
# Buffers to store the last N readings per ticker
sentiment_buffers = {
    "SHFX_IPO": deque(maxlen=WINDOW_SIZE),
    "MEESHO": deque(maxlen=WINDOW_SIZE)
}

def get_smoothed_velocity(ticker, raw_v):
    """Calculates the moving average to remove the cyclic noise."""
    buffer = sentiment_buffers[ticker]
    buffer.append(raw_v)
    return sum(buffer) / len(buffer)

print("Initializing AI Models...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, use_fast=False)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_ID)

def get_vix():
    try: return float(yf.Ticker("^INDIAVIX").history(period="1d")['Close'].iloc[-1])
    except: return 14.2

def analyze_sentiment(entries, ticker):
    if not entries: return 0.0, 0.0
    scores = []
    vix = get_vix()
    regime_mult = 1.3 if vix > 15 else 1.0
    
    for item in entries[:3]:
        text = item.title.lower()
        inputs = tokenizer(text, padding=True, truncation=True, max_length=512, return_tensors="pt")
        with torch.no_grad():
            outputs = model(**inputs)
        probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
        
        ai_score = float(probs[0][1].item() - probs[0][2].item())
        adj = sum(w for sig, w in MARKET_SIGNALS.items() if sig in text)
        scores.append(ai_score + adj)
    
    raw_v = (sum(scores) / len(scores)) * regime_mult
    # APPLY SMOOTHING HERE
    smoothed_v = get_smoothed_velocity(ticker, raw_v)
    return round(float(smoothed_v), 4), round(float(probs.max().item()), 2)

# --- 3. DASHBOARD LOGIC ---

def make_dashboard(data_list):
    table = Table(title="[bold cyan]Jan 2026 Institutional Sentiment Dashboard (Smoothed)[/bold cyan]", expand=True)
    table.add_column("Ticker", style="bold yellow", width=12)
    table.add_column("Sentiment Velocity (SMA)", justify="center", width=25)
    table.add_column("Confidence", justify="center", width=12)
    table.add_column("Latest Signal Headline", overflow="fold")

    for d in data_list:
        v = d.get('v', 0.0)
        conf = d.get('conf', 0.0)
        news = d.get('news', "Fetching...")
        ticker = d.get('ticker', "N/A")
        
        # Color logic for trend
        vel_color = "green" if v > 0.05 else "red" if v < -0.05 else "white"
        table.add_row(
            ticker, 
            f"[{vel_color}]{v:+.4f}[/{vel_color}]", 
            f"{conf:.2f}", 
            f"{news[:100]}..."
        )
    return table

# --- 4. EXECUTION ---

TARGETS = [
    {"ticker": "SHFX_IPO", "q": "Shadowfax IPO GMP news allotment"},
    {"ticker": "MEESHO", "q": "Meesho share price circuit lock-in"}
]

processed_state = {
    t['ticker']: {"ticker": t['ticker'], "v": 0.0, "conf": 0.0, "news": "Initializing stream..."} for t in TARGETS
}

try:
    with Live(make_dashboard(processed_state.values()), refresh_per_second=1) as live:
        conn = psycopg2.connect(**DB_SETTINGS)
        cur = conn.cursor()
        
        while True:
            for target in TARGETS:
                try:
                    url = f"https://news.google.com/rss/search?q={quote(target['q'])}&hl=en-IN&gl=IN&ceid=IN:en"
                    feed = feedparser.parse(url)
                    if not feed.entries: continue
                    
                    title = feed.entries[0].title
                    v, conf = analyze_sentiment(feed.entries, target['ticker'])
                    
                    cur.execute("INSERT INTO sentiment_velocity_data (ticker, velocity) VALUES (%s, %s)", (target['ticker'], v))
                    conn.commit()
                    
                    processed_state[target['ticker']].update({"v": v, "conf": conf, "news": title})
                    live.update(make_dashboard(processed_state.values()))
                    
                except Exception as e:
                    if conn: conn.rollback()
            time.sleep(15)

except KeyboardInterrupt:
    print("\n[!] Engine stopped.")
except Exception as e:
    print(f"\n[!] Fatal Error: {e}")