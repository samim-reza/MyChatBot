FROM node:20-alpine AS portfolio-build

WORKDIR /build
COPY portfolio/package.json portfolio/bun.lock* portfolio/package-lock.json* ./
RUN npm ci --no-audit --no-fund --ignore-scripts

COPY portfolio/ ./
ENV NEXT_PUBLIC_URL=https://samimreza.me
RUN npm run build

FROM python:3.10-slim

WORKDIR /app

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY . .
COPY --from=portfolio-build /build/out ./portfolio/out

RUN test -f portfolio/out/index.html || \
    (echo "Missing portfolio/out/index.html. Portfolio build failed." && exit 1)

RUN mkdir -p data/chroma_db

EXPOSE 8000

ENV PYTHONUNBUFFERED=1
ENV PORT=8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import os, urllib.request; port = os.environ.get('PORT', '8000'); urllib.request.urlopen('http://localhost:' + port + '/api/debug/config', timeout=5)"

CMD ["python", "app.py"]
