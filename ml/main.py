"""
Entrypoint for the SmartAttend ML Service.
You can run this directly with:
    python main.py
Or with uvicorn:
    uvicorn main:app --reload --port 8000
"""
import os
import uvicorn
from face import app

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    print(f"Starting SmartAttend ML FastAPI server on http://{host}:{port}")
    uvicorn.run("face:app", host=host, port=port, reload=True)

