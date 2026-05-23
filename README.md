# 🌲 South India Forest Fire Warning Matrix 🛰️

An enterprise-grade, distributed geospatial telemetry dashboard engineered to monitor environmental risk variables across 5 core wildlife sanctuaries and national parks in Southern India in real-time. 

This system acts as an operational situational control room, replacing abstract statistical data with an interactive real-world map, smoothly animated live charts, and plain-English threat diagnostics.

---

## 🗺️ Distributed System Architecture

The ecosystem relies on a decoupled, asynchronous microservice framework designed for low latency, zero memory leaks, and structural reliability:

```text
                  ┌────────────────────────┐
                  │   stream_worker.py     │  (IoT Node Simulator)
                  └────────────────────────┘
                               │
                               │ Writes JSON Batches (Every 3s)
                               ▼
                  ┌────────────────────────┐
                  │    MongoDB Container   │  (Time-Series Data Lake)
                  └────────────────────────┘
                               ▲
                               │ Reads Raw Streams
                               │
                  ┌────────────────────────┐
                  │    FastAPI (main.py)   │  (Gateway / Inference Node)
                  └────────────────────────┘
                               │
                               │ Exposes JSON REST Endpoints
                               │ Streams RAM-Buffered Matplotlib/Seaborn
                               ▼
                  ┌────────────────────────┐
                  │     React Frontend     │  (Leaflet GIS / Recharts Canvas)
                  └────────────────────────
```

The Ingestion Worker (stream_worker.py): A standalone background process mimicking real-world IoT cellular forestry nodes. It continuously generates localized weather parameters specific to each park's micro-climate profile (including circadian day/night temperature cycles and randomized precipitation triggers) and writes payloads directly into MongoDB every 3 seconds.

The Database Data Lake (MongoDB): A containerized database hosting time-series geospatial collections, completely independent of the web application layer.

The Gateway REST API Engine (main.py): Built with FastAPI. It performs database reads, sanitizes input variables via Pandas to handle data-type anomalies, and executes the rule-based prediction vectors. Additionally, it handles analytical rendering tasks directly inside an in-memory RAM buffer (io.BytesIO) to protect the server's hard drive from repetitive high-frequency writes.

The Client Control Deck (React): A single-page dashboard utilizing react-leaflet to project actual GPS points on an interactive OpenStreetMap layer and recharts to render smooth, real-time sliding timeline graphs.

## ⛰️ Tracked Real-Earth Coordinates
The system tracks 5 high-risk wildlife reserves with precise physical geospatial points:

Mudumalai National Park (Tamil Nadu) ── 11.5622° N, 76.5345° E

Bandipur Tiger Reserve (Karnataka) ── 11.6640° N, 76.6291° E

Anamalai Tiger Reserve (Tamil Nadu) ── 10.3950° N, 76.9647° E

Wayanad Wildlife Sanctuary (Kerala) ── 11.6923° N, 76.2422° E

Silent Valley National Park (Kerala) ── 11.1300° N, 76.4300° E

## 🧠 The Mathematical Inference Engine
Instead of using an opaque, heavy machine learning model that introduces system latency, risk indices are predicted dynamically using a deterministic, rule-based piecewise vector matrix tracking weather extremities:
``` text 
                      ┌──────────────────────────┐
                      │ Raw Telemetry Ingestion  │ (T, H, W, R)
                      └────────────┬─────────────┘
                                   │
                                   ▼
                   🌲 Are Conditions Extreme? 🌲
                     (T >= 38°C  &  H <= 20%)
                     /                        \
                   YES                        NO
                   /                            \
                  ▼                              ▼
     ┌────────────────────────┐     🌧️ Is Active Rain Falling? 🌧️
     │ Extreme Danger Vector  │               (Rain > 0mm)
     │ (T * 1.5) + (W * 0.5)  │               /          \
     └────────────────────────┘             YES          NO
                                            /              \
                                           ▼                ▼
                             ┌───────────────────┐  ┌───────────────────┐
                             │ Rain Suppression  │  │ Baseline Ambient  │
                             │    (T * 0.2)      │  │    (T * 0.6)      │
                             └───────────────────┘  └───────────────────┘
                                           │                  │
                                           └────────┬─────────┘
                                                    │
                                                    ▼
                                      ┌──────────────────────────┐
                                      │ Rolling Window Average   │ (3-Packet Smoothing)
                                      └────────────┬─────────────┘
                                                   │
                                                   ▼
                                      ┌──────────────────────────┐
                                      │ Hard Boundary Clipping   │ (Integer 0 to 100)
                                      └──────────────────────────┘
```

Extreme Danger Window: Spikes weights if temperatures exceed 38°C alongside humidity drops beneath 20%, heavily prioritizing temperature and wind speed multipliers.

Rain Suppression: Instantly slashes hazard risk coefficients down to a minimal fraction if active precipitation inputs are registered, introducing realistic natural fuel dampening effects.

Rolling Smoothing: Applies a 3-packet moving window average to simulate natural landscape drying latency rather than changing values instantly based on temporary ambient spikes.

Boundary Clipping: Uses NumPy constraints to enforce a standard operator threat scale from 0 (Absolute Safety) to 100 (Maximum Wildfire Threat).



## 🚀 Local Installation & Deployment Guide
To deploy this multi-tier architecture locally, split your terminal workspace or utilize a multiplexer like tmux:
1. Initialize Database Container
``` text 
bash
docker run -d -p 27017:27017 --name local-mongo mongo:latest
```
2. Launch Backend Analytics Cluster
``` text 
bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

3. Start the live IoT sensor simulator worker
``` text 
bash
python3 stream_worker.py
3. Start Web Gateway Server
In a separate terminal pane, start the FastAPI web gateway router:
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
4. Launch Frontend Client UI
Compile dependencies and launch the localized Node server environment:
``` text 
bash
cd frontend
npm install
npm start
Open your browser to http://localhost:3000 to interact with the system console canvas.
```
## 📜 Licensing & Project Scope
This project is shared under the official open-source MIT License. Built as a comprehensive systems engineering project demonstrating robust data extraction, cleaning pipelines, web socket rendering optimization, and geospatial dashboard tracking architectures.
---
