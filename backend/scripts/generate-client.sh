#!/bin/bash

# Script to generate Go client and types from OpenAPI spec
# This script uses Docker to bypass local Go installation issues

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$BACKEND_DIR")"

echo "Generating Go client and types from OpenAPI spec..."

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed or not in PATH"
    echo "Please install Docker or fix your Go installation"
    exit 1
fi

# Create output directory
mkdir -p "$BACKEND_DIR/internal/api"

echo "  - Generating types..."
docker run --rm \
  -v "$PROJECT_ROOT/api:/api:ro" \
  -v "$BACKEND_DIR:/backend" \
  -w /backend \
  golang:1.23-alpine \
  sh -c "apk add --no-cache git && \
         go install github.com/oapi-codegen/oapi-codegen/v2/cmd/oapi-codegen@latest && \
         oapi-codegen -config .oapi-codegen-types.yaml -o internal/api/types.gen.go /api/openapi-bundled.yaml"

echo "  - Generating client..."
docker run --rm \
  -v "$PROJECT_ROOT/api:/api:ro" \
  -v "$BACKEND_DIR:/backend" \
  -w /backend \
  golang:1.23-alpine \
  sh -c "apk add --no-cache git && \
         go install github.com/oapi-codegen/oapi-codegen/v2/cmd/oapi-codegen@latest && \
         oapi-codegen -config .oapi-codegen-client.yaml -o internal/api/client.gen.go /api/openapi-bundled.yaml"

echo "  - Generating server interfaces..."
docker run --rm \
  -v "$PROJECT_ROOT/api:/api:ro" \
  -v "$BACKEND_DIR:/backend" \
  -w /backend \
  golang:1.23-alpine \
  sh -c "apk add --no-cache git && \
         go install github.com/oapi-codegen/oapi-codegen/v2/cmd/oapi-codegen@latest && \
         oapi-codegen -config .oapi-codegen-server.yaml -o internal/api/server.gen.go /api/openapi-bundled.yaml"

echo "✓ Go client and types generated in internal/api/"

