# n8n Integration Setup

## Environment Variables

Add the following to your `.env` file:

```bash
# n8n Integration
N8N_BASE_URL=https://tauga.app.n8n.cloud
N8N_AUTH_HEADER_NAME=village_proposal_auth
N8N_AUTH_HEADER_VALUE=G5EhcKzo6BvFpv
```

## How It Works

### Invoice Analysis Workflow

1. **User uploads tax invoice** via `/upload` page
2. **Frontend sends file** to `/api/analyze-invoice`
3. **API converts file** to base64
4. **API calls n8n webhook** at `${N8N_BASE_URL}/webhook/analyze-invoice`
5. **n8n analyzes invoice** and returns detected price
6. **Frontend displays requirements** based on price

### API Request Format

The API sends the following to n8n:

```json
{
  "file": "base64_encoded_file_content",
  "fileName": "invoice.pdf",
  "fileSize": 123456,
  "mimeType": "application/pdf"
}
```

### Expected n8n Response

n8n should return:

```json
{
  "price": 150000,
  // Or alternatively:
  "detectedPrice": 150000,
  "amount": 150000
}
```

The API will look for `price`, `detectedPrice`, or `amount` fields.

## n8n Webhook Endpoint

**URL:** `https://tauga.app.n8n.cloud/webhook/analyze-invoice`

**Method:** `POST`

**Headers:**
- `Content-Type: application/json`
- `village_proposal_auth: G5EhcKzo6BvFpv`

## Development Mode

The API includes a fallback to mock data if n8n is unavailable. This allows development to continue even if the n8n service is down.

To disable the fallback in production, remove the try-catch around the n8n call in `/app/api/analyze-invoice/route.ts`.

## Testing

Test the integration:

```bash
curl -X POST http://localhost:3000/api/analyze-invoice \
  -F "invoice=@/path/to/test-invoice.pdf"
```

Expected response:
```json
{
  "price": 150000,
  "fileName": "test-invoice.pdf",
  "fileSize": 123456
}
```

## Troubleshooting

### Check Environment Variables
```bash
# In your Next.js API route, add logging:
console.log('N8N_BASE_URL:', process.env.N8N_BASE_URL);
console.log('N8N_AUTH_HEADER:', process.env.N8N_AUTH_HEADER);
```

### Common Issues

1. **404 from n8n** - Check webhook URL is correct
2. **401 Unauthorized** - Verify auth header value
3. **CORS errors** - n8n should allow requests from your domain
4. **Timeout** - n8n workflow might be taking too long

## Security Notes

- ⚠️ **Never commit `.env` file** - It's in `.gitignore`
- ✅ Auth header is server-side only (not exposed to client)
- ✅ File validation happens before sending to n8n
- ✅ File size limited to 10MB in frontend

