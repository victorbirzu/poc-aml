# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Docker Deployment

### Prerequisites

- Docker installed on your system
- Docker Compose (optional, but recommended)

### Building and Running with Docker

#### Option 1: Using Docker Compose (Recommended)

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

The application will be available at `http://localhost:9000`

#### Option 2: Using Docker directly

```bash
# Build the Docker image
docker build -t poc-aml-app .

# Run the container
docker run -p 9000:9000 --name poc-aml-container poc-aml-app

# Run in detached mode
docker run -d -p 9000:9000 --name poc-aml-container poc-aml-app

# View logs
docker logs -f poc-aml-container

# Stop the container
docker stop poc-aml-container

# Remove the container
docker rm poc-aml-container
```

### Environment Variables

If your application requires environment variables, create a `.env` file or pass them when running:

```bash
# With docker-compose, add to docker-compose.yml:
environment:
  - NEXT_PUBLIC_API_URL=https://api.example.com

# With docker run:
docker run -p 9000:9000 -e NEXT_PUBLIC_API_URL=https://api.example.com poc-aml-app
```

### Production Considerations

- The Dockerfile uses a multi-stage build for optimal image size
- The application runs in production mode with Node.js 20
- Health checks are configured in docker-compose.yml
- The container runs as a non-root user for security
