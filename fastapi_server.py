"""
SignMate FastAPI Real-Time Inference Server
============================================
Loads `SignMate_stage1_best.keras` model and `signmate_labels.json`.
Accepts image frames from SignMate web client, pre-processes them to
[1, 160, 160, 1] float32 grayscale (pixel values 0-255), and outputs
the predicted class, label ('0', 'A'-'Z'), confidence, and latency.

Usage:
    pip install fastapi uvicorn tensorflow keras pillow numpy
    python fastapi_server.py
"""

import json
import os
import time

# Ensure Keras uses PyTorch backend which is installed
os.environ['KERAS_BACKEND'] = 'torch'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

from typing import Dict, Any, Optional

import numpy as np
from PIL import Image
import io
import base64

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Configuration
MODEL_PATH = os.path.join(os.path.dirname(__file__), "SignMate_stage1_best.keras")
LABELS_PATH = os.path.join(os.path.dirname(__file__), "signmate_labels.json")
INPUT_SHAPE = (160, 160)

app = FastAPI(
    title="SignMate Real-Time Sign Language Inference API",
    description="FastAPI service for SignMate_MobileNetV3Small (.keras model)",
    version="1.0.0",
)

# Enable CORS for SignMate web client
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model state
model = None
labels_dict: Dict[int, str] = {}


def load_model_and_labels():
    global model, labels_dict
    # 1. Load Labels
    if os.path.exists(LABELS_PATH):
        with open(LABELS_PATH, "r", encoding="utf-8") as f:
            raw_labels = json.load(f)
            labels_dict = {int(k): v for k, v in raw_labels.items()}
        print(f"[SignMate] Loaded {len(labels_dict)} classes from {LABELS_PATH}")
    else:
        # Fallback default A-Z
        labels_dict = {0: "0"}
        for i in range(1, 27):
            labels_dict[i] = chr(64 + i)
        print(f"[SignMate] Warning: {LABELS_PATH} not found. Using default 27 classes.")

    # 2. Load Keras Model
    if os.path.exists(MODEL_PATH):
        try:
            import keras
            print(f"[SignMate] Loading model from {MODEL_PATH} via Keras...")
            model = keras.models.load_model(MODEL_PATH)
            print("[SignMate] Model loaded successfully!")
        except Exception as e:
            print(f"[SignMate] Could not load model via keras: {e}")
            try:
                import tensorflow as tf
                print("[SignMate] Retrying with tf.keras...")
                model = tf.keras.models.load_model(MODEL_PATH)
                print("[SignMate] Model loaded successfully via tf.keras!")
            except Exception as e2:
                print(f"[SignMate] Error loading Keras model: {e2}")
                model = None
    else:
        print(f"[SignMate] Warning: Model file {MODEL_PATH} does not exist.")


@app.on_event("startup")
def startup_event():
    load_model_and_labels()


class PredictBase64Request(BaseModel):
    image_base64: str
    metadata: Optional[Dict[str, Any]] = None


def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """
    Transforms arbitrary image into [1, 160, 160, 1] float32 grayscale, pixel values 0-255.
    """
    img = Image.open(io.BytesIO(image_bytes))
    # Convert to grayscale
    img_gray = img.convert("L")
    # Resize to 160x160
    img_resized = img_gray.resize(INPUT_SHAPE, Image.Resampling.BILINEAR)
    # Convert to array [160, 160] with range 0..255 float32
    arr = np.array(img_resized, dtype=np.float32)
    # Expand dims to [1, 160, 160, 1]
    tensor = np.expand_dims(arr, axis=(0, -1))
    return tensor


@app.get("/")
def root():
    return {
        "status": "online",
        "service": "SignMate Inference Server",
        "model_file": "SignMate_stage1_best.keras",
        "is_model_loaded": model is not None,
        "input_shape": [1, 160, 160, 1],
        "classes_count": len(labels_dict),
    }


@app.get("/api/v1/labels")
def get_labels():
    return {
        "classes": labels_dict,
        "count": len(labels_dict),
    }


@app.post("/api/v1/predict")
async def predict_frame(file: UploadFile = File(...)):
    start_time = time.time()
    try:
        content = await file.read()
        tensor = preprocess_image(content)

        if model is not None:
            preds = model.predict(tensor, verbose=0)
            pred_class = int(np.argmax(preds[0]))
            confidence = float(np.max(preds[0]))
            label = labels_dict.get(pred_class, str(pred_class))
            # Class 0 / "0" is background/neutral: do not return any letter
            if label == "0" or pred_class == 0:
                label = ""
                confidence = 0.0
        else:
            pred_class = 0
            confidence = 0.0
            label = ""

        latency_ms = (time.time() - start_time) * 1000.0

        return {
            "predicted_class": pred_class,
            "label": label,
            "confidence": round(confidence, 4),
            "inference_time_ms": round(latency_ms, 2),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/predict/base64")
def predict_base64(req: PredictBase64Request):
    start_time = time.time()
    try:
        raw_b64 = req.image_base64
        if "," in raw_b64:
            raw_b64 = raw_b64.split(",")[1]

        image_bytes = base64.b64decode(raw_b64)
        tensor = preprocess_image(image_bytes)

        if model is not None:
            preds = model.predict(tensor, verbose=0)
            pred_class = int(np.argmax(preds[0]))
            confidence = float(np.max(preds[0]))
            label = labels_dict.get(pred_class, str(pred_class))
            # Class 0 / "0" is background/neutral: do not return any letter
            if label == "0" or pred_class == 0:
                label = ""
                confidence = 0.0
        else:
            pred_class = 0
            confidence = 0.0
            label = ""

        latency_ms = (time.time() - start_time) * 1000.0

        return {
            "predicted_class": pred_class,
            "label": label,
            "confidence": round(confidence, 4),
            "inference_time_ms": round(latency_ms, 2),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------
# Live WebRTC Signaling Hub (Guaranteed Cross-Device P2P Coordination)
# ---------------------------------------------------------------------
webrtc_rooms: Dict[str, list] = {}


class WebRTCSignalRequest(BaseModel):
    sender_id: str
    signal_type: str  # 'offer' | 'answer' | 'candidate' | 'leave'
    payload: Dict[str, Any]


@app.post("/api/v1/webrtc/{room_id}/signal")
def post_webrtc_signal(room_id: str, msg: WebRTCSignalRequest):
    room_key = room_id.strip().upper()
    if room_key not in webrtc_rooms:
        webrtc_rooms[room_key] = []

    now = time.time()
    # Prune expired messages older than 3 minutes
    webrtc_rooms[room_key] = [m for m in webrtc_rooms[room_key] if now - m.get("timestamp", 0) < 180]

    signal_entry = {
        "id": str(time.time_ns()),
        "sender_id": msg.sender_id,
        "signal_type": msg.signal_type,
        "payload": msg.payload,
        "timestamp": now,
    }
    webrtc_rooms[room_key].append(signal_entry)
    return {"status": "received", "id": signal_entry["id"]}


@app.get("/api/v1/webrtc/{room_id}/signals")
def get_webrtc_signals(room_id: str, sender_id: str, since: float = 0.0):
    room_key = room_id.strip().upper()
    signals = webrtc_rooms.get(room_key, [])
    filtered = [
        m for m in signals
        if m["sender_id"] != sender_id and m.get("timestamp", 0) > since
    ]
    return {
        "signals": filtered,
        "server_time": time.time(),
        "active_messages": len(signals),
    }


@app.delete("/api/v1/webrtc/{room_id}")
def reset_webrtc_room(room_id: str):
    room_key = room_id.strip().upper()
    if room_key in webrtc_rooms:
        del webrtc_rooms[room_key]
    return {"status": "room_reset", "room_id": room_key}



if __name__ == "__main__":
    import uvicorn
    print("[SignMate] Starting FastAPI server on http://localhost:8000...")
    uvicorn.run("fastapi_server:app", host="0.0.0.0", port=8000, reload=True)
