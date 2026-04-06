from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.schemas import PredictRequest
from app.services.scorer import predict as scorer_predict
from app.predict_performance import ModelService
from typing import Dict

app = FastAPI(title="IPO Scorer API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model_service = ModelService()

class PredictionInput(BaseModel):
    features: Dict[str, float]

@app.get("/")
def root():
    return {"message": "IPO Scorer backend is running"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/features")
def get_features():
    return {"features": model_service.get_features()}

@app.post("/deep_analysis")
def deep_analysis(input_data: PredictionInput):
    return model_service.predict(input_data.features)

@app.post("/predict")
def predict_ipo(request: PredictRequest):
    try:
        result = scorer_predict(request.model_dump())
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
