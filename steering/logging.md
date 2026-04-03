---
inclusion: fileMatch
fileMatchPattern: "internal/handler/**/*.go,internal/actor/**/*.go,internal/mapper/**/*.go,internal/sessionmanager/**/*.go,internal/event/**/*.go,cmd/main.go"
---

# Structured Logging with zap

This project uses `go.uber.org/zap` with a global logger pattern. The logger is initialized from config in `cmd/main.go` and installed via `zap.ReplaceGlobals()`. All layers access it via `zap.L()`.

## How to Add Logging to a New Layer or Method

1. Import `"go.uber.org/zap"` in the file.
2. At the top of each method, create a named logger:
   ```go
   logger := zap.L().Named("domain.layer")
   ```
3. Add log statements at key points (see Log Points below).
4. Do NOT add the logger as a struct field or constructor parameter.

## Naming Convention

The logger name follows `"{domain}.{layer}"` format:

| Domain | Layer | Logger Name |
|--------|-------|-------------|
| emailsend | handler | `emailsend.handler` |
| emailsend | actor | `emailsend.actor` |
| emailsend | mapper | `emailsend.mapper` |
| emailsend | sessionmanager | `emailsend.sessionmanager` |
| emailsend | event | `emailsend.event` |
| emailtemplate | handler | `emailtemplate.handler` |
| emailtemplate | actor | `emailtemplate.actor` |
| emailtemplate | mapper | `emailtemplate.mapper` |
| webhook | handler | `webhook.handler` |
| webhook | actor | `webhook.actor` |

For a new domain `foo` with a handler layer, use `zap.L().Named("foo.handler")`.

## Log Points per Layer

### Handler Layer
```go
func (h *FooHandler) DoSomething(c *gin.Context) {
    logger := zap.L().Named("foo.handler")
    logger.Debug("request received", zap.String("method", c.Request.Method), zap.String("path", c.Request.URL.Path))

    // On binding error:
    logger.Debug("request binding failed", zap.Error(err))

    // On actor error:
    logger.Error("actor error", zap.Error(err))

    // On success:
    logger.Debug("request completed", zap.Int("status", http.StatusOK))
}
```

### Actor Layer
```go
func (a *fooActor) DoSomething(ctx context.Context, id string) (*Result, error) {
    logger := zap.L().Named("foo.actor")
    logger.Debug("DoSomething called", zap.String("record_id", id))

    // On repo failure:
    logger.Error("repository operation failed", zap.String("operation", "Create"), zap.Error(err))

    // On event publish failure:
    logger.Error("event publish failed", zap.String("event_type", "SomeEvent"), zap.Error(err))

    // On success:
    logger.Debug("DoSomething completed", zap.String("record_id", id))
}
```

### Session Manager Layer
```go
func (sm *sessionManager) GetSession(ctx context.Context, sessionID string) (*SessionData, error) {
    logger := zap.L().Named("foo.sessionmanager")
    logger.Debug("GetSession called", zap.String("session_id", sessionID))

    // On cache error:
    logger.Error("cache operation failed", zap.String("session_id", sessionID), zap.Error(err))

    // On success:
    logger.Debug("GetSession completed", zap.String("session_id", sessionID))
}
```

### Event Handler Layer
```go
func (h *kafkaEventHandler) PublishEvent(ctx context.Context, payload *Message) error {
    logger := zap.L().Named("foo.event")
    logger.Debug("publishing event")

    // On serialization error:
    logger.Error("event serialization failed", zap.Error(err))

    // On Kafka write error:
    logger.Error("kafka write failed", zap.String("topic", h.writer.Topic), zap.Error(err))

    // On success:
    logger.Debug("event published")
}
```

### Mapper Layer
```go
func (m *mapper) ToRecord(req *Request) *Record {
    logger := zap.L().Named("foo.mapper")
    logger.Debug("ToRecord called")

    id := uuid.New().String()
    logger.Debug("generated record ID", zap.String("record_id", id))
    // ...
}
```

## Structured Field Standards

Use these consistent field names across all layers:

| Field Name | Type | Usage |
|-----------|------|-------|
| `record_id` | `zap.String` | Email record identifier |
| `template_id` | `zap.String` | Email template identifier |
| `session_id` | `zap.String` | Session identifier |
| `method` | `zap.String` | HTTP method |
| `path` | `zap.String` | HTTP request path |
| `status` | `zap.Int` | HTTP response status code |
| `operation` | `zap.String` | Repository/cache operation name |
| `event_type` | `zap.String` | Event type being published |
| `topic` | `zap.String` | Kafka topic name |
| `error` | `zap.Error` | Error value |
| `ttl` | `zap.Duration` | Cache TTL |
| `batch_size` | `zap.Int` | Number of items in a batch |
| `accepted` | `zap.Int` | Accepted count in batch result |
| `failed` | `zap.Int` | Failed count in batch result |

## Log Levels

- `Debug` — routine operations: request received, method entry, method completion, ID generation
- `Error` — failures: repo errors, cache errors, event publish errors, serialization errors
- `Warn` — degraded but recoverable: unsupported config values with fallback
- `Info` — significant lifecycle events: server start, shutdown (used in `cmd/main.go` only)

## Testing with Global Logger

Use `zaptest/observer` to capture and assert log entries in tests:

```go
core, recorded := observer.New(zap.DebugLevel)
zap.ReplaceGlobals(zap.New(core))
defer zap.ReplaceGlobals(zap.NewNop()) // cleanup

// ... invoke code under test ...

assert.Equal(t, 1, recorded.FilterMessage("request received").Len())
```

## Rules

- Never pass `*zap.Logger` as a constructor parameter — use `zap.L().Named(...)` inline
- Never add a logger struct field to any layer type
- Always use `zap.Error(err)` for error fields (not `zap.String("error", err.Error())`)
- Always clean up in tests with `defer zap.ReplaceGlobals(zap.NewNop())`
- Logger config is in `config.LoggerConfig` — level, encoding, output_paths
