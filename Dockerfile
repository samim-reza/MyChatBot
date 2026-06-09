FROM node:20-alpine AS portfolio-build

WORKDIR /app/samim-reza

COPY samim-reza/package*.json ./
RUN npm ci

COPY samim-reza/ ./
RUN npm run build


FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY . .
COPY --from=portfolio-build /app/samim-reza/build ./samim-reza/build

RUN mkdir -p data/chroma_db

EXPOSE 8000

ENV PYTHONUNBUFFERED=1
ENV PORT=8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import os, urllib.request; port = os.environ.get('PORT', '8000'); urllib.request.urlopen('http://localhost:' + port + '/api/debug/config', timeout=5)"

CMD ["python", "app.py"]
