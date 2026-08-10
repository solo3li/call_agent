FROM python:3.12-slim

# Install system dependencies needed for PyAudio or related packages if necessary
# Although livekit-agents usually bundles what it needs, some plugins might need build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Run the agent in worker mode
CMD ["python", "agent.py", "start"]
