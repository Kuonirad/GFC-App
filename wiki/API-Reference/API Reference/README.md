# API Reference

Welcome to the GFC-App API Reference. This guide provides detailed information about the GFC-App API, allowing developers to integrate GFC-App functionality into their own applications or extend the capabilities of GFC-App.

## Table of Contents

1. [Authentication](#authentication)
2. [Endpoints](#endpoints)
3. [Request/Response Examples](#requestresponse-examples)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [SDK](#sdk)
7. [Interactive API Explorer](#interactive-api-explorer)
8. [Video Tutorial](#video-tutorial)

## Authentication

GFC-App API uses API keys for authentication. To obtain an API key:

1. Log in to your GFC-App account
2. Navigate to Settings > API
3. Click "Generate New API Key"

Include your API key in the header of each request:

```
Authorization: Bearer YOUR_API_KEY
```

## Endpoints

### Image Upload

```
POST /api/v1/images
```

Upload a flux image for processing.

### Animation Generation

```
POST /api/v1/animations
```

Generate an animation from an uploaded image.

### Animation Retrieval

```
GET /api/v1/animations/{animation_id}
```

Retrieve a generated animation.

### Custom Algorithm Upload

```
POST /api/v1/algorithms
```

Upload a custom animation algorithm.

## Request/Response Examples

### Upload Image

Request:
```http
POST /api/v1/images HTTP/1.1
Host: api.gfcapp.com
Authorization: Bearer YOUR_API_KEY
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="image"; filename="flux_image.jpg"
Content-Type: image/jpeg

(binary data)
------WebKitFormBoundary7MA4YWxkTrZu0gW--
```

Response:
```json
{
  "image_id": "img_123456",
  "status": "uploaded",
  "created_at": "2023-05-01T12:00:00Z"
}
```

### Generate Animation

Request:
```http
POST /api/v1/animations HTTP/1.1
Host: api.gfcapp.com
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "image_id": "img_123456",
  "style": "ripple",
  "parameters": {
    "speed": 1.5,
    "intensity": 0.8
  }
}
```

Response:
```json
{
  "animation_id": "anim_789012",
  "status": "processing",
  "created_at": "2023-05-01T12:05:00Z"
}
```

## Error Handling

The API uses standard HTTP status codes. In case of an error, the response body will contain more details:

```json
{
  "error": {
    "code": "invalid_parameter",
    "message": "The 'speed' parameter must be between 0 and 2."
  }
}
```

## Rate Limiting

The API is rate-limited to 100 requests per minute per API key. The response headers include rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1620000000
```

## SDK

We provide SDKs for popular programming languages to simplify API integration:

- [Python SDK](https://github.com/GFC-App/python-sdk)
- [JavaScript SDK](https://github.com/GFC-App/js-sdk)
- [Ruby SDK](https://github.com/GFC-App/ruby-sdk)

## Interactive API Explorer

Try out the GFC-App API using our interactive API explorer:

<p>Interactive API explorer coming soon! Stay tuned for updates.</p>

## Video Tutorial

Watch our video tutorial on how to use the GFC-App API:

<p>Video tutorial coming soon! Stay tuned for updates.</p>

For any issues or questions related to the API, please check our [Troubleshooting](../Troubleshooting/README.md) guide or contact our developer support team.
