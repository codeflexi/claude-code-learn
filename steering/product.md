# Product: email-service

Go microservice in the Neo Core Platform that handles email delivery and template management.

Receives HTTP requests, orchestrates session management, data mapping, and publishes asynchronous events to Kafka. Kafka routes events through an Email Gateway to AWS SES for final delivery.

## Key Capabilities

- Accept email send requests via REST API (`POST /v1/email/send`, `POST /v1/email/batch-send`)
- Manage email templates with CRUD operations, publish/draft lifecycle, and locale-aware content (`GET/POST/PATCH/DELETE /v1/email-template`)
- Send emails using templates with variable injection (`POST /v1/email-template/:id/send`, `POST /v1/email-template/batch-send`)
- Receive delivery status webhooks (`POST /v1/hook`)
- Manage session state for email operations (Redis or in-memory)
- Map domain objects to DTOs for event publishing
- Publish email events to Kafka for async delivery
- Health endpoints for liveness and readiness probes (`GET /health/liveness`, `GET /health/readiness`)

## Environment Flexibility

The service runs fully in-memory with mock dependencies for local dev, and switches to Redis, PostgreSQL, and real Kafka in production. Mode switching is config-driven with no code changes.

| Mode           | Cache     | DB         | Kafka        |
|----------------|-----------|------------|--------------|
| Local dev      | in-memory | in-memory  | mock (no-op) |
| Docker Compose | Redis     | PostgreSQL | mock         |
| Production     | Redis     | PostgreSQL | real Kafka   |
