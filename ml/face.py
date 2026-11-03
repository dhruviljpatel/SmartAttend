import os
import io
import base64
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv
from PIL import Image

import dlib
import numpy as np
import face_recognition_models
from sklearn.svm import SVC
import requests

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Load environment variables from .env
load_dotenv()

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5000")
RESEMBLANCE_THRESHOLD = float(os.getenv("RESEMBLANCE_THRESHOLD", "0.6"))

# ==========================================
# ML Pipeline (Original Logic Preserved)
# ==========================================

# Cache models in memory to avoid reading heavy dlib weights on every request
_CACHED_MODELS = None

def load_dlib_models():
    global _CACHED_MODELS
    if _CACHED_MODELS is None:
        detector = dlib.get_frontal_face_detector()
        sp = dlib.shape_predictor(
            face_recognition_models.pose_predictor_model_location()
        )
        facerec = dlib.face_recognition_model_v1(
            face_recognition_models.face_recognition_model_location()
        )
        _CACHED_MODELS = (detector, sp, facerec)
    return _CACHED_MODELS


def get_face_embeddings(image_np):
    detector, sp, facerec = load_dlib_models()
    faces = detector(image_np, 1)

    embeddings = []

    for face in faces:
        shape = sp(image_np, face)
        face_descriptor = facerec.compute_face_descriptor(image_np, shape, 1)  # 128 embeddings
        embeddings.append(np.array(face_descriptor))

    return embeddings


def get_all_students(backend_url: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Fetches the list of students with their face embeddings from the Express backend API.
    """
    url = f"{(backend_url or BACKEND_URL).rstrip('/')}/api/students"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        if isinstance(data, list):
            return data
        elif isinstance(data, dict) and "students" in data:
            return data["students"]
        return []
    except Exception as e:
        print(f"[ML Service] Error fetching students from backend ({url}): {e}")
        return []


def get_trained_model():
    X = []
    y = []

    student_db = get_all_students()

    if not student_db:
        return None

    for student in student_db:
        embedding = student.get('face_embedding') or student.get('faceEmbedding')
        student_id = student.get('student_id') or student.get('id')
        if embedding and student_id is not None:
            X.append(np.array(embedding))
            y.append(student_id)

    if len(X) == 0:
        return 0

    clf = SVC(kernel="linear", probability=True, class_weight="balanced")

    try:
        clf.fit(X, y)
    except ValueError:
        pass

    return {'clf': clf, 'X': X, 'y': y}


def trained_classifier():
    model_data = get_trained_model()
    return bool(model_data)


def predict_attendance(class_image_np):
    embeddings = get_face_embeddings(class_image_np)

    detected_students = {}

    model_data = get_trained_model()

    if not model_data:
        return detected_students, [], len(embeddings)

    clf = model_data['clf']
    X_train = model_data['X']
    y_train = model_data['y']

    all_students = sorted(list(set(y_train)))

    for embedding in embeddings:
        if len(all_students) >= 2:
            predicted_id = int(clf.predict([embedding])[0])
        else:
            predicted_id = int(all_students[0])

        student_embedding = X_train[y_train.index(predicted_id)]

        best_match_score = np.linalg.norm(student_embedding - embedding)

        resemblance_threshold = RESEMBLANCE_THRESHOLD

        if best_match_score <= resemblance_threshold:
            detected_students[predicted_id] = True

    return detected_students, all_students, len(embeddings)


# ==========================================
# Direct Embedding Matching (1-to-N Student Verification)
# ==========================================

def verify_or_find_student(image_np: np.ndarray, threshold: Optional[float] = None) -> Dict[str, Any]:
    """
    Direct 1-to-N Euclidean embedding distance matching for student login/auth:
    1. Extracts 128-d face embedding from query image.
    2. Returns NO_FACE or MULTIPLE_FACES if frame is not ideal.
    3. Compares with all registered students in the database.
    4. If minimum Euclidean distance <= threshold (0.6) -> student exists!
    5. If minimum Euclidean distance > threshold -> new student!
    """
    if threshold is None:
        threshold = RESEMBLANCE_THRESHOLD

    embeddings = get_face_embeddings(image_np)

    if len(embeddings) == 0:
        return {
            "status": "NO_FACE",
            "exists": False,
            "message": "No face detected in the image. Please center your face and ensure good lighting.",
            "faces_detected": 0,
            "face_embedding": None
        }

    if len(embeddings) > 1:
        return {
            "status": "MULTIPLE_FACES",
            "exists": False,
            "message": "Multiple faces detected. Please make sure only you are in the camera frame.",
            "faces_detected": len(embeddings),
            "face_embedding": None
        }

    query_embedding = embeddings[0]
    student_db = get_all_students()

    best_match = None
    min_distance = float('inf')

    for student in student_db:
        emb = student.get('face_embedding') or student.get('faceEmbedding')
        if emb:
            try:
                emb_np = np.array(emb, dtype=np.float64)
                dist = float(np.linalg.norm(emb_np - query_embedding))
                if dist < min_distance:
                    min_distance = dist
                    best_match = student
            except Exception as e:
                print(f"[ML Service] Error computing distance: {e}")

    if best_match is not None and min_distance <= threshold:
        student_id = best_match.get("id") or best_match.get("student_id")
        return {
            "status": "MATCH_FOUND",
            "exists": True,
            "student": {
                "id": student_id,
                "student_id": student_id,
                "name": best_match.get("name"),
            },
            "distance": round(min_distance, 4),
            "threshold": threshold,
            "face_embedding": query_embedding.tolist(),
            "message": f"Student verified: {best_match.get('name')}"
        }
    else:
        return {
            "status": "NO_MATCH",
            "exists": False,
            "student": None,
            "distance": round(min_distance, 4) if min_distance != float('inf') else None,
            "threshold": threshold,
            "face_embedding": query_embedding.tolist(),
            "message": "Student not recognized. Ready for registration."
        }


# ==========================================
# Helpers for Image Processing
# ==========================================

def bytes_to_image_np(image_bytes: bytes) -> np.ndarray:
    """Converts raw image bytes (JPEG, PNG, etc.) to an RGB NumPy array."""
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    return np.array(image)


def base64_to_image_np(base64_str: str) -> np.ndarray:
    """Converts a base64 encoded image string to an RGB NumPy array."""
    if "," in base64_str:
        base64_str = base64_str.split(",", 1)[1]
    image_bytes = base64.b64decode(base64_str)
    return bytes_to_image_np(image_bytes)


# ==========================================
# FastAPI Application & Endpoints
# ==========================================

app = FastAPI(
    title="SmartAttend Face Recognition API",
    description="FastAPI service for facial embedding extraction and attendance prediction",
    version="1.0.0",
)

# CORS Middleware (allows requests from frontend and backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Base64ImageRequest(BaseModel):
    image_base64: str


@app.get("/")
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "SmartAttend ML Pipeline",
        "backend_url": BACKEND_URL,
        "resemblance_threshold": RESEMBLANCE_THRESHOLD,
    }


@app.get("/train-status")
def check_train_status():
    """Checks whether the classifier has enough student embeddings to train."""
    is_trained = trained_classifier()
    return {
        "trained": is_trained,
        "message": "Model is trained and ready" if is_trained else "Insufficient student embeddings or backend unreachable",
    }


@app.post("/verify-face")
async def verify_face_endpoint(file: Optional[UploadFile] = File(None)):
    """
    Verifies if a single face matches an existing student in the database.
    Used for 1-to-N student face login / authentication.
    """
    if file is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An image file is required.",
        )

    try:
        image_bytes = await file.read()
        image_np = bytes_to_image_np(image_bytes)
        return verify_or_find_student(image_np)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error verifying face: {str(e)}",
        )


@app.post("/verify-face/base64")
def verify_face_base64_endpoint(payload: Base64ImageRequest):
    """
    Verifies if a single face matches an existing student in the database via base64.
    Used for 1-to-N student face login / authentication from webcams.
    """
    try:
        image_np = base64_to_image_np(payload.image_base64)
        return verify_or_find_student(image_np)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error verifying face: {str(e)}",
        )


@app.post("/extract-embeddings")
async def extract_embeddings_endpoint(file: Optional[UploadFile] = File(None)):
    """
    Extracts 128-dimensional face embedding(s) from an uploaded student photo.
    Used during student registration/enrollment to save into the database.
    """
    if file is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An image file is required.",
        )

    try:
        image_bytes = await file.read()
        image_np = bytes_to_image_np(image_bytes)
        embeddings = get_face_embeddings(image_np)

        return {
            "success": True,
            "faces_detected": len(embeddings),
            "embeddings": [emb.tolist() for emb in embeddings],
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error extracting embeddings: {str(e)}",
        )


@app.post("/extract-embeddings/base64")
def extract_embeddings_base64_endpoint(payload: Base64ImageRequest):
    """
    Extracts 128-dimensional face embedding(s) from a base64 encoded image string.
    """
    try:
        image_np = base64_to_image_np(payload.image_base64)
        embeddings = get_face_embeddings(image_np)

        return {
            "success": True,
            "faces_detected": len(embeddings),
            "embeddings": [emb.tolist() for emb in embeddings],
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error extracting embeddings: {str(e)}",
        )


@app.post("/predict-attendance")
async def predict_attendance_endpoint(file: Optional[UploadFile] = File(None)):
    """
    Takes a classroom image (file upload), detects all faces, matches them against
    the enrolled students in the database, and returns detected student IDs.
    """
    if file is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An image file is required.",
        )

    try:
        image_bytes = await file.read()
        image_np = bytes_to_image_np(image_bytes)

        detected_students, all_students, face_count = predict_attendance(image_np)
        detected_student_ids = [int(sid) for sid in detected_students.keys()]

        return {
            "success": True,
            "detected_student_ids": detected_student_ids,
            "detected_students_map": detected_students,
            "all_student_ids": all_students,
            "total_faces_detected": face_count,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error predicting attendance: {str(e)}",
        )


@app.post("/predict-attendance/base64")
def predict_attendance_base64_endpoint(payload: Base64ImageRequest):
    """
    Takes a classroom image (base64 string), detects all faces, matches them against
    the enrolled students in the database, and returns detected student IDs.
    """
    try:
        image_np = base64_to_image_np(payload.image_base64)
        detected_students, all_students, face_count = predict_attendance(image_np)
        detected_student_ids = [int(sid) for sid in detected_students.keys()]

        return {
            "success": True,
            "detected_student_ids": detected_student_ids,
            "detected_students_map": detected_students,
            "all_student_ids": all_students,
            "total_faces_detected": face_count,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error predicting attendance: {str(e)}",
        )


# ==========================================
# Run Server Directly
# ==========================================
if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    print(f"Starting SmartAttend ML FastAPI server on http://{host}:{port}")
    uvicorn.run("face:app", host=host, port=port, reload=True)
