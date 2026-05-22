from fastapi import FastAPI, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pipeline import run_analytics_pipeline

# Initialize the enterprise server application node
app = FastAPI(
    title=" Forest Fire AI Risk Analytics Node",
    description="Production-grade API infrastructure parsing climate matrices and pre-rendering telemetry visuals."
)

# CRITICAL SECURITY RULE: Enable Cross-Origin Resource Sharing (CORS)
# This allows your decoupled React frontend server to securely request resources from this Python backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows communication across development ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    """Simple status route to confirm the backend node is live."""
    return {"status": "online", "engine": "FastAPI", "database_target": "Docker local-mongo"}

@app.get("/api/fire-telemetry")
def get_telemetry_records():
    """
    Triggers the Pandas/NumPy pipeline.
    Returns the latest 24 rows of processed time-series data records as clean JSON objects.
    """
    records, _ = run_analytics_pipeline()
    if not records:
        raise HTTPException(status_code=500, detail="Data compilation engine returned null arrays.")
    
    # Return only the most recent 24 hourly readings (1 day snapshot) to prevent browser bloat
    return {"status": "success", "count": 24, "metrics": records[-24:]}

@app.get("/api/risk-chart")
def get_analytics_chart():
    """
    Triggers the visualization pipeline.
    Streams the compiled Matplotlib/Seaborn chart directly across the network as raw image binary.
    """
    _, chart_bytes = run_analytics_pipeline()
    if not chart_bytes:
        raise HTTPException(status_code=500, detail="Visualization buffer stream generation failed.")
    
    # Send the raw byte stream directly over the network port with an image content type
    return Response(content=chart_bytes, media_type="image/png")

if __name__ == "__main__":
    import uvicorn
    # Launch uvicorn webserver, listening locally on port 8000
    uvicorn.run("main.py:app" if __name__ == "__main__" else app, host="0.0.0.0", port=8000, reload=True)
