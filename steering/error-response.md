---
inclusion: fileMatch
fileMatchPattern: "internal/handler/**/*.go,internal/models/**/response*.go,internal/models/**/error*.go"
---

# NEO Standard Error Response

All API error responses MUST follow the NEO Standard Response format defined in `#[[file:.kiro/my_requirement/implement_api_from_spec/api_spec.md]]`.

## Go Structs

Place shared response types in `internal/models/response.go` (package `models`).

```go
// SuccessResponse is the NEO standard envelope for successful responses.
type SuccessResponse struct {
    Status    string      `json:"status"`
    ServiceID string      `json:"service_id"`
    Message   string      `json:"message"`
    Data      interface{} `json:"data"`
}

// ErrorResponse is the NEO standard envelope for error responses.
type ErrorResponse struct {
    Type      string        `json:"type"`
    Status    string        `json:"status"`
    ServiceID string        `json:"service_id"`
    Message   string        `json:"message"`
    Errors    []ErrorDetail `json:"errors"`
}

// ErrorDetail describes a single error within the errors array.
type ErrorDetail struct {
    Code    string `json:"code"`
    Message string `json:"message"`
    Field   string `json:"field,omitempty"`
}
```

## Error Type Mapping

Use these exact string constants. Do not invent new types.

| HTTP Status | `type` constant          | `message` (fixed string)                                                    |
|-------------|--------------------------|-----------------------------------------------------------------------------|
| 400         | `ValidationError`        | `One or more validation errors has occurred.`                               |
| 401         | `AuthenticationError`    | `Authentication required. Please provide a valid access token.`             |
| 403         | `AccessDeniedError`      | `Access to this resource is denied.`                                        |
| 404         | `ResourceNotFoundError`  | `The requested resource could not be located.`                              |
| 422         | `BusinessRuleError`      | `The request could not be processed due to a business rule violation.`      |
| 500         | `InternalServerError`    | `An unexpected error has occurred.`                                         |

## Error Code Reference

| Code                     | Used with            | Description                              |
|--------------------------|----------------------|------------------------------------------|
| `missing_required_field` | `ValidationError`    | A required field is missing              |
| `invalid_value`          | `ValidationError`    | Field value does not match allowed format |
| `invalid_token`          | `AuthenticationError`| Token is not valid or expired            |
| `missing_token`          | `AuthenticationError`| Token is not provided                    |
| `expired_token`          | `AuthenticationError`| Token has expired                        |
| `forbidden`              | `AccessDeniedError`  | Insufficient permissions                 |
| `missing_resource`       | `ResourceNotFoundError` | Resource not found                    |
| `business_rule_violation`| `BusinessRuleError`  | Business rule violated                   |

## Handler Rules

1. `service_id` is always `"email-service"` — sourced from `handler.Handler.ServiceID`.
2. The top-level `status` field is always the literal string `"Error"`.
3. The `message` field is the fixed string from the table above — never dynamic.
4. The `errors` array contains one or more `ErrorDetail` items with specific context.
5. The `field` key in `ErrorDetail` is only present for validation errors — omit it otherwise (`omitempty`).
6. On the error path, call `c.JSON(httpStatus, errorResponse)` then `return`. Do not also call `c.Error()`.

## Success Response Rules

1. The top-level `status` field is always the literal string `"Success"`.
2. The `message` field follows the pattern: `"[Action Name] has been processed successfully"`.
3. The `data` field contains the domain-specific response payload.

## Helper Pattern

Create helper functions in `internal/handler/` or `internal/models/` to build responses consistently:

```go
func NewValidationError(serviceID string, details []ErrorDetail) ErrorResponse {
    return ErrorResponse{
        Type:      "ValidationError",
        Status:    "Error",
        ServiceID: serviceID,
        Message:   "One or more validation errors has occurred.",
        Errors:    details,
    }
}
```

Follow the same pattern for `NewAuthenticationError`, `NewResourceNotFoundError`, `NewBusinessRuleError`, and `NewInternalServerError`.

## Validation Error Examples

Missing required field:
```go
ErrorDetail{Code: "missing_required_field", Message: "this field is required", Field: "to"}
```

Invalid field format:
```go
ErrorDetail{Code: "invalid_value", Message: "this field format is invalid", Field: "order"}
```

Batch array size constraint:
```go
ErrorDetail{Code: "invalid_value", Message: "emails array must contain between 1 and 100 items", Field: "emails"}
```

## Business Rule Error Examples

Duplicate name:
```go
ErrorDetail{Code: "business_rule_violation", Message: "Template name already exists."}
```

Already published:
```go
ErrorDetail{Code: "business_rule_violation", Message: "Template is already published."}
```

Already draft:
```go
ErrorDetail{Code: "business_rule_violation", Message: "Template is already in draft status."}
```

Undefined template variable:
```go
ErrorDetail{Code: "business_rule_violation", Message: "Template body contains undefined variable key: {{order_count}}"}
```

Invalid status transition (webhook):
```go
ErrorDetail{Code: "business_rule_violation", Message: "Email status can only be updated from PENDING."}
```
