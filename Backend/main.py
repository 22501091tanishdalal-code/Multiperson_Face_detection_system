# =========================
# MAIN BACKEND (FASTAPI)
# =========================

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import cv2

# 🔥 IMPORT YOUR MODEL FUNCTION
from recognize_insightface import recognize_image

# =========================
# FASTAPI INIT
# =========================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # dev ke liye OK
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# FIREBASE INIT
# =========================
import firebase_admin
from firebase_admin import credentials, firestore

if not firebase_admin._apps:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()

# =========================
# GET ATTENDANCE LOGS
# =========================
@app.get("/attendance-logs")
def get_attendance_logs():
    docs = (
        db.collection("attendance")
        .order_by("created_at", direction=firestore.Query.DESCENDING)
        .limit(20)
        .stream()
    )

    logs = []
    for d in docs:
        data = d.to_dict()
        logs.append({
            "name": data.get("name"),
            "status": data.get("status"),
            "time": data.get("time"),
            "date": data.get("date"),
            "confidence": data.get("confidence"),
        })

    return {"logs": logs}

# =========================
# FACE RECOGNITION API
# =========================
@app.post("/recognize")
async def recognize(file: UploadFile = File(...)):
    try:
        contents = await file.read()

        # convert to numpy image
        np_arr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        # 🔥 CALL YOUR MODEL
        results = recognize_image(img)

        return {
            "success": True,
            "faces": results
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

# =========================
# ROOT (OPTIONAL TEST)
# =========================
@app.get("/")
def home():
    return {"message": "Backend is running 🚀"}
