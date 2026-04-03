from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncpg
import asyncio
import threading
import worker

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_CONFIG = {
    "user": "postgres",
    "password": "Swayam@3030",
    "database": "postgres",
    "host": "127.0.0.1"
}

class IPORequest(BaseModel):
    ipo_name: str

@app.post("/start")
async def start_worker(req: IPORequest):
    global worker_thread, stop_event

    # Stop existing worker if running
    if worker.worker_thread and worker.worker_thread.is_alive():
        worker.stop_event.set()
        worker.worker_thread.join(timeout=5)

    # Start new worker
    worker.stop_event = threading.Event()
    worker.worker_thread = threading.Thread(
        target=worker.run_worker,
        args=(req.ipo_name, worker.stop_event),
        daemon=True
    )
    worker.worker_thread.start()

    return {"status": "started", "ipo": req.ipo_name}

@app.post("/stop")
async def stop_worker():
    if worker.worker_thread and worker.worker_thread.is_alive():
        worker.stop_event.set()
        return {"status": "stopped"}
    return {"status": "not running"}

@app.websocket("/ws/v_t_stream")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("SUCCESS: Browser connected to WebSocket!")

    conn = await asyncpg.connect(**DB_CONFIG)

    def callback(connection, pid, channel, payload):
        print(f"DB Signal Received: {payload}")
        asyncio.create_task(websocket.send_text(payload))

    await conn.add_listener('alpha_channel', callback)

    try:
        while True:
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        print("Browser disconnected.")
    finally:
        await conn.remove_listener('alpha_channel', callback)
        await conn.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)