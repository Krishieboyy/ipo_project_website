from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncpg
import asyncio
import json

app = FastAPI()

# This allows your browser to talk to the server without security blocks
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DB SETTINGS ---
DB_CONFIG = {
    "user": "postgres",
    "password": "Swayam@3030", # Ensure this matches your worker.py
    "database": "postgres",
    "host": "127.0.0.1"
}

@app.websocket("/ws/v_t_stream")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("SUCCESS: Browser connected to WebSocket!")
    
    # Connect to PostgreSQL
    conn = await asyncpg.connect(**DB_CONFIG)
    
    # This sends data to the browser whenever the DB triggers
    def callback(connection, pid, channel, payload):
        print(f"DB Signal Received: {payload}")
        asyncio.create_task(websocket.send_text(payload))

    await conn.add_listener('alpha_channel', callback)
    
    try:
        while True:
            await asyncio.sleep(1) # Keep the connection alive
    except WebSocketDisconnect:
        print("Browser disconnected.")
    finally:
        await conn.remove_listener('alpha_channel', callback)
        await conn.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)