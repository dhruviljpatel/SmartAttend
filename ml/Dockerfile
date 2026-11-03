FROM python:3.10-slim

WORKDIR /app

# Install system dependencies required for cmake, dlib, and opencv/image processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    libopenblas-dev \
    liblapack-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip "setuptools<70.0.0" wheel && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "uvicorn face:app --host 0.0.0.0 --port ${PORT}"]

