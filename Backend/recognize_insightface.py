import cv2
import pickle
import numpy as np
from datetime import datetime, timedelta
import os
import firebase_admin
from firebase_admin import credentials, firestore


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SERVICE_KEY = os.path.join(BASE_DIR, "security_key.json")
STATUS_FILE = os.path.join(os.path.dirname(__file__), "status.txt")

def write_status(msg: str):
    with open(STATUS_FILE, "a") as f:
        f.write(msg + "\n")




#def write_status(message: str):
#    try:
#        with open(STATUS_FILE, "w") as f:
#            f.write(message)
#    except Exception as e:
#        print("❌ Status write error:", e)

def update_status(message):
    with open(STATUS_FILE, "w") as f:
        f.write(message)


# ======================================================
# PATH SETUP
# ======================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
EMB_PATH = os.path.join(BASE_DIR, "insight_embeddings.pkl")
if not firebase_admin._apps:
    cred = credentials.Certificate(SERVICE_KEY)
    firebase_admin.initialize_app(cred)

firestore_db = firestore.client()
# ======================================================
# FIREBASE
# ======================================================
import firebase_admin
from firebase_admin import credentials, firestore

# ======================================================
# INSIGHTFACE
# ======================================================
from insightface.app import FaceAnalysis

# ======================================================
# CONFIG
# ======================================================
THRESHOLD = 0.45                  # ArcFace cosine similarity
ATTENDANCE_COOLDOWN_MINUTES = 60  # 1 hour cooldown

# ======================================================
# GLOBAL STATS (TERMINAL ONLY)
# ======================================================
total_faces = 0
recognized_faces = 0

# ======================================================
# FIREBASE INIT (SAFE)
# ======================================================
import firebase_admin
from firebase_admin import credentials, firestore

if not firebase_admin._apps:
   cred = credentials.Certificate(SERVICE_KEY)
   firebase_admin.initialize_app(cred)

firestore_db = firestore.client()

# ======================================================
# LOAD EMBEDDINGS
# ======================================================
with open(EMB_PATH, "rb") as f:
    emb_db = pickle.load(f)

db_embeddings = []
db_labels = []

for person_name, embs in emb_db.items():
    for emb in embs:
        db_embeddings.append(emb)
        db_labels.append(person_name)

db_embeddings = np.vstack(db_embeddings)

# ======================================================
# INSIGHTFACE MODEL
# ======================================================
app = FaceAnalysis(
    name="buffalo_l",
    providers=["CPUExecutionProvider"]
)
# app.prepare(ctx_id=0, det_size=(640, 640))
app.prepare(ctx_id=-1, det_size=(320, 320))

# ======================================================
# ATTENDANCE FUNCTION
# ======================================================
def mark_attendance(label, confidence):
    try:
        name, roll_no = label.rsplit(" ", 1)
        now = datetime.utcnow()

        records = (
            firestore_db.collection("attendance")
            .where("student_id", "==", roll_no)
            .stream()
        )

        for record in records:
            last_time = record.to_dict().get("created_at")
            if last_time:
                last_time = last_time.replace(tzinfo=None)
                if now - last_time < timedelta(minutes=ATTENDANCE_COOLDOWN_MINUTES):
                    msg = f"Cooldown active for {name}"
                    print(msg)
                    write_status(msg)
                    return


        firestore_db.collection("attendance").add({
            "student_id": roll_no,
            "name": name,
            "status": "Present",
            "confidence": float(confidence),
            "marked_by": "face_recognition",
            "date": now.date().isoformat(),
            "time": now.strftime("%H:%M:%S"),
            "created_at": firestore.SERVER_TIMESTAMP
        })

        msg = f"Attendance marked for {name} ({confidence:.2f})"
        print(msg)
        write_status(msg)


    except Exception as e:
        print("❌ Attendance error:", e)

# ======================================================
# CAMERA RECOGNITION (STANDALONE)
# ======================================================
def run_camera_recognition():
    global total_faces, recognized_faces

    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("❌ Camera could not be opened")
        return

    print("🎥 Camera started (press Q to quit)")

    while True:
        ret, frame = cap.read()
        if not ret:
            print("❌ Failed to read frame")
            break

        faces = app.get(frame)

        for face in faces:
            total_faces += 1

            emb = face.embedding
            emb = emb / np.linalg.norm(emb)

            sims = np.dot(db_embeddings, emb)
            best_idx = np.argmax(sims)
            best_score = sims[best_idx]

            if best_score > THRESHOLD:
                label = db_labels[best_idx]
                recognized_faces += 1
                mark_attendance(label, best_score)
                color = (0, 255, 0)
            else:
                label = "Unknown"
                color = (0, 0, 255)

            x1, y1, x2, y2 = map(int, face.bbox)
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            cv2.putText(
                frame,
                f"{label} ({best_score:.2f})",
                (x1, y1 - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                color,
                2
            )

        cv2.imshow("Attendify - InsightFace", frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            print("🛑 Q pressed — exiting")
            break

    cap.release()
    cv2.destroyAllWindows()

    # FINAL STATS
    print("\n========== FINAL RECOGNITION STATS ==========")
    if total_faces > 0:
        accuracy = (recognized_faces / total_faces) * 100
    else:
        accuracy = 0.0

    if best_score > THRESHOLD:
        status_text = f"Face matched: {label} ({best_score:.2f})"
    else:
        status_text = "Face not recognized"

    print(status_text)
    write_status(status_text)

    print("============================================\n")

# ======================================================
# ENTRY POINT (REQUIRED FOR OPENCV GUI ON macOS)
# ======================================================
if __name__ == "__main__":
    run_camera_recognition()
    
# ---------

def recognize_image(img):

    global total_faces
    global recognized_faces

    faces = app.get(img)

    results = []

    # No face detected

    if len(faces) == 0:

        update_status("No face detected")

        return [{
            "name": "No Face",
            "confidence": 0,
            "status": "no_face"
        }]

    for face in faces:

        total_faces += 1

        emb = face.embedding
        emb = emb / np.linalg.norm(emb)

        sims = np.dot(db_embeddings, emb)

        best_idx = np.argmax(sims)

        best_score = float(sims[best_idx])

        print("Best score:", best_score)

        # Face matched

        if best_score > THRESHOLD:

            label = db_labels[best_idx]

            recognized_faces += 1

            try:

                mark_attendance(label, best_score)

                status_text = (
                    f"✅ Attendance marked for "
                    f"{label} ({best_score:.2f})"
                )

                update_status(status_text)

                status = "recognized"

            except Exception as e:

                error_text = f"❌ Attendance error: {str(e)}"

                print(error_text)

                update_status(error_text)

                status = "error"

        # Unknown face

        else:

            label = "Unknown"

            status = "unknown"

            status_text = (
                f"❌ Face not recognized "
                f"({best_score:.2f})"
            )

            update_status(status_text)

        results.append({

            "name": label,

            "confidence": round(best_score, 2),

            "status": status,

            "bbox": face.bbox.tolist()

        })

    return results