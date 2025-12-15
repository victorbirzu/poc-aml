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

**IMPORTANT:** This application requires API webhook URLs to be configured. Create a `.env` file in the project root with the following variables:

```bash
# Required API Webhook URLs for AML processing nodes
API_WEBHOOK_URL_1=your_api_webhook_url_for_node_1_here
API_WEBHOOK_URL_2=your_api_webhook_url_for_node_2_here
API_WEBHOOK_URL_3=your_api_webhook_url_for_node_3_here
API_WEBHOOK_URL_4=your_api_webhook_url_for_node_4_here

# Alternative: You can use NEXT_PUBLIC_ prefixed versions for client-side access
# NEXT_PUBLIC_API_WEBHOOK_URL_1=your_api_webhook_url_for_node_1_here
# NEXT_PUBLIC_API_WEBHOOK_URL_2=your_api_webhook_url_for_node_2_here
# NEXT_PUBLIC_API_WEBHOOK_URL_3=your_api_webhook_url_for_node_3_here
# NEXT_PUBLIC_API_WEBHOOK_URL_4=your_api_webhook_url_for_node_4_here
```

The `docker-compose.yml` file is configured to automatically load environment variables from `.env`.

**Without these environment variables, you will see errors like:**

- "API webhook URL for node 3 is not configured"
- "API webhook URL for node 4 is not configured"
- "An error occurred in the Server Components render"

**For docker run (without docker-compose):**

```bash
docker run -p 9000:9000 \
  -e API_WEBHOOK_URL_1=your_url_1 \
  -e API_WEBHOOK_URL_2=your_url_2 \
  -e API_WEBHOOK_URL_3=your_url_3 \
  -e API_WEBHOOK_URL_4=your_url_4 \
  --name poc-aml-container poc-aml-app
```

### Production Considerations

- The Dockerfile uses a multi-stage build for optimal image size
- The application runs in production mode with Node.js 20
- Health checks are configured in docker-compose.yml
- The container runs as a non-root user for security
