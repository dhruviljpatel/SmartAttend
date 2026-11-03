FROM python:3.10-slim

WORKDIR /app

# Install minimal runtime libraries (no heavy compilers needed with precompiled wheels)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libopenblas0 \
    liblapack3 \
    libx11-6 \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Safety limit: restrict CMake/GCC parallel jobs to 1 thread to avoid memory spikes
ENV CMAKE_BUILD_PARALLEL_LEVEL=1

COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip "setuptools<70.0.0" wheel && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "uvicorn face:app --host 0.0.0.0 --port ${PORT}"]
