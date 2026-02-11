FROM python:3.11-slim
# Set environment variables to prevent Python from writing .pyc files and to ensure that output is not buffered, which is important for logging in Docker containers.
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1
# Set the working directory in the container to /app, where the application code will be copied and executed.
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ffmpeg \
        libsndfile1 \
    # Clean up the apt cache to reduce the image size.(For optimization purposes)
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
# Copy the entire application code from the current directory on the host machine to the /app directory in the container.
COPY . .

EXPOSE 8080

CMD ["python", "app.py"]
