# Architecture Notes

# Overview

The system is designed as a lightweight AI inference observability platform that captures, processes, and stores metadata generated during LLM interactions.

The architecture focuses on:

- simplicity
- modularity
- extensibility
- observability
- rapid iteration

while remaining production-oriented.

---

# High-Level Architecture

```text
User Interface
    ↓
Chat API Layer
    ↓
LLM Wrapper SDK
    ↓
Provider Abstraction Layer
    ↓
LLM Provider

Inference Metadata
    ↓
Ingestion API
    ↓
PostgreSQL Database
```

---

# Components

## 1. Frontend UI

The frontend is built using Next.js App Router and TailwindCSS.

Responsibilities:

- manage conversations
- render chat interface
- maintain UI state
- support dark/light themes
- resume previous conversations

The UI communicates with backend APIs using standard HTTP requests.

---

# 2. Chat API Layer

The chat API acts as the orchestration layer between:

- frontend requests
- LLM providers
- observability pipeline

Responsibilities:

- receive user messages
- load conversation context
- invoke LLM wrapper
- persist messages
- return AI responses

---

# 3. LLM Wrapper SDK

A lightweight SDK abstraction is used to centralize inference handling.

Responsibilities:

- standardize provider interaction
- measure latency
- collect inference metadata
- normalize token usage
- send logs to ingestion endpoint

This design separates inference observability from application business logic.

---

# 4. Provider Abstraction Layer

The provider factory enables multi-provider support through a shared interface.

Current provider:

- Groq (Llama 3.3 70B)

Extensible providers:

- OpenAI
- Gemini
- Claude
- DeepSeek

Benefits:

- provider swapping without UI/backend changes
- simplified experimentation
- cleaner architecture boundaries

---

# 5. Ingestion Pipeline

The ingestion API receives observability logs from the SDK layer.

Responsibilities:

- validate payloads
- parse metadata
- normalize observability fields
- persist inference logs

Captured metadata:

- provider
- model
- latency
- token usage
- request status
- timestamps
- conversation IDs
- input/output previews

---

# 6. Database Layer

PostgreSQL is used as the primary persistence layer with Prisma ORM.

Stored entities:

- conversations
- chat messages
- inference logs

The relational model simplifies:

- querying conversations
- inference analytics
- debugging
- observability inspection

---

# Logging Strategy

Inference logging occurs immediately after LLM response generation.

The SDK captures:

- provider details
- latency metrics
- token counts
- request outcome
- partial payload previews

Logs are asynchronously forwarded to the ingestion API in near real-time.

This design keeps logging concerns decoupled from UI logic.

---

# Failure Handling Assumptions

## Current Handling

- API try/catch protection
- frontend loading states
- graceful inference failure handling
- ingestion endpoint validation

## Assumptions

- database availability
- provider API reliability
- low-to-medium traffic workloads

---

# Scaling Considerations

## Current Design

The current implementation prioritizes simplicity and development speed.

## Potential Improvements

### Event-Driven Ingestion

Move ingestion into Kafka/RabbitMQ queues for asynchronous processing.

### Distributed Logging

Use dedicated observability systems:

- ClickHouse
- OpenTelemetry
- Prometheus

### Horizontal Scaling

Separate:

- frontend
- inference workers
- ingestion service

### Streaming Responses

Add token streaming for lower perceived latency.

### PII Redaction

Introduce middleware for sensitive data masking before persistence.

### Analytics Layer

Build aggregated dashboards for:

- latency
- throughput
- provider failures
- token consumption

---

# Tradeoffs

## Monolithic Simplicity

The ingestion service is colocated within the Next.js application for operational simplicity.

Tradeoff:

- easier local development
- reduced deployment complexity
- less scalable than dedicated ingestion infrastructure

## PostgreSQL Selection

PostgreSQL was chosen over NoSQL systems because the workload benefits from:

- relational consistency
- structured querying
- analytics flexibility

## Lightweight SDK

The SDK intentionally avoids heavy tracing infrastructure to keep implementation lightweight and easy to extend.

---

# Future Improvements

- streaming token responses
- real-time observability dashboards
- provider failover routing
- distributed tracing
- Docker Compose support
- Kubernetes deployment
- authentication & multi-user support
- conversation search
- AI-generated summaries
- retention policies for observability logs
