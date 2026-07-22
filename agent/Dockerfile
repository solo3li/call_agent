FROM golang:1.22-alpine AS builder

# Install build dependencies for Opus
RUN apk add --no-cache gcc musl-dev opus-dev opusfile-dev pkgconf

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./
RUN CGO_ENABLED=1 GOOS=linux go build -o cpaas-agent .

# ── Runtime Stage ──────────────────────────────────────────────────────
FROM alpine:3.19

# Opus runtime library
RUN apk add --no-cache opus ca-certificates wget

WORKDIR /app
COPY --from=builder /app/cpaas-agent .

EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
    CMD wget -q -O - http://localhost:8080/health || exit 1

CMD ["./cpaas-agent"]
