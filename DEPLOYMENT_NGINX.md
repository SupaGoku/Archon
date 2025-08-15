# Archon Nginx Deployment Guide

## Current State Analysis

After investigating the codebase, I've found that **Archon can be deployed with nginx and custom domains with minimal code changes**. The application already has most of the necessary configuration options in place.

## Deployment Architecture

```
Internet
    ↓
Nginx Reverse Proxy (Port 80/443)
    ├── archon.your-domain.com → archon-ui (Port 3737)
    ├── api.archon.your-domain.com → archon-server (Port 8181)
    ├── mcp.archon.your-domain.com → archon-mcp (Port 8051)
    └── agents.archon.your-domain.com → archon-agents (Port 8052)
```

## Step 1: Server Deployment

### 1.1 Deploy with Docker Compose

On your server (YOUR_SERVER_IP), create a production `.env` file:

```bash
# Production .env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key-here

# Domain Configuration - Set your actual domain here
DOMAIN_BASE=your-domain.com
DOMAIN_UI=archon.your-domain.com
DOMAIN_API=api.archon.your-domain.com
DOMAIN_MCP=mcp.archon.your-domain.com
DOMAIN_AGENTS=agents.archon.your-domain.com

# Service Configuration for Production
HOST=${DOMAIN_UI}
ARCHON_SERVER_PORT=8181
ARCHON_MCP_PORT=8051
ARCHON_AGENTS_PORT=8052
ARCHON_UI_PORT=3737

# API URL for Frontend (automatically constructed)
VITE_API_URL=https://${DOMAIN_API}

# CORS Configuration (automatically constructed)
ALLOWED_ORIGINS=https://${DOMAIN_UI},https://${DOMAIN_API},https://${DOMAIN_MCP},https://${DOMAIN_AGENTS}

# Optional
LOG_LEVEL=INFO
OPENAI_API_KEY=your-openai-key
```

### 1.2 Update docker-compose.yml for Production

Create a `docker-compose.prod.yml`:

```yaml
services:
  archon-server:
    extends:
      file: docker-compose.yml
      service: archon-server
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
      - ALLOWED_ORIGINS=https://archon.your-domain.com,https://api.archon.your-domain.com
      - CORS_ALLOW_CREDENTIALS=true
      - SERVICE_DISCOVERY_MODE=docker_compose
      - LOG_LEVEL=${LOG_LEVEL:-INFO}
      - ARCHON_SERVER_PORT=${ARCHON_SERVER_PORT:-8181}
      - ARCHON_MCP_PORT=${ARCHON_MCP_PORT:-8051}
      - ARCHON_AGENTS_PORT=${ARCHON_AGENTS_PORT:-8052}
    networks:
      - archon-network

  archon-mcp:
    extends:
      file: docker-compose.yml
      service: archon-mcp
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
      - API_SERVICE_URL=http://archon-server:${ARCHON_SERVER_PORT:-8181}
      - AGENTS_SERVICE_URL=http://archon-agents:${ARCHON_AGENTS_PORT:-8052}
      - ARCHON_MCP_PORT=${ARCHON_MCP_PORT:-8051}
    networks:
      - archon-network

  archon-agents:
    extends:
      file: docker-compose.yml
      service: archon-agents
    networks:
      - archon-network

  frontend:
    extends:
      file: docker-compose.yml
      service: frontend
    environment:
      - VITE_API_URL=${VITE_API_URL}
      - NODE_ENV=production
    networks:
      - archon-network

networks:
  archon-network:
    driver: bridge
```

### 1.3 Start Services

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Step 2: Nginx Configuration

### 2.1 Install Nginx

```bash
ssh root@YOUR_SERVER_IP
apt-get update
apt-get install -y nginx certbot python3-certbot-nginx
```

### 2.2 Create Nginx Configuration

You have two options for the nginx configuration:

#### Option A: Manual Configuration
Create `/etc/nginx/sites-available/archon` and replace all instances of `your-domain.com` with your actual domain:

```nginx
# Upstream definitions
upstream archon_ui {
    server localhost:3737;
}

upstream archon_api {
    server localhost:8181;
}

upstream archon_mcp {
    server localhost:8051;
}

upstream archon_agents {
    server localhost:8052;
}

# Main UI Server
server {
    listen 80;
    server_name archon.your-domain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name archon.your-domain.com;

    # SSL certificates (will be added by certbot)
    # ssl_certificate /etc/letsencrypt/live/archon.your-domain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/archon.your-domain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to UI container
    location / {
        proxy_pass http://archon_ui;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support for UI
    location /socket.io/ {
        proxy_pass http://archon_ui;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# API Server
server {
    listen 80;
    server_name api.archon.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.archon.your-domain.com;

    # SSL certificates (will be added by certbot)
    # ssl_certificate /etc/letsencrypt/live/api.archon.your-domain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/api.archon.your-domain.com/privkey.pem;

    # CORS headers
    add_header 'Access-Control-Allow-Origin' 'https://archon.your-domain.com' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Origin, Content-Type, Accept, Authorization' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;

    # Handle preflight requests
    if ($request_method = 'OPTIONS') {
        return 204;
    }

    location / {
        proxy_pass http://archon_api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Increase timeouts for long-running operations
        proxy_connect_timeout 600s;
        proxy_send_timeout 600s;
        proxy_read_timeout 600s;
    }

    # WebSocket support for Socket.IO
    location /socket.io/ {
        proxy_pass http://archon_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# MCP Server
server {
    listen 80;
    server_name mcp.archon.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mcp.archon.your-domain.com;

    # SSL certificates (will be added by certbot)
    # ssl_certificate /etc/letsencrypt/live/mcp.archon.your-domain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/mcp.archon.your-domain.com/privkey.pem;

    location / {
        proxy_pass http://archon_mcp;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # SSE support for MCP
        proxy_set_header Connection '';
        proxy_buffering off;
        proxy_cache off;
        chunked_transfer_encoding off;
    }
}

# Agents Server
server {
    listen 80;
    server_name agents.archon.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name agents.archon.your-domain.com;

    # SSL certificates (will be added by certbot)
    # ssl_certificate /etc/letsencrypt/live/agents.archon.your-domain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/agents.archon.your-domain.com/privkey.pem;

    location / {
        proxy_pass http://archon_agents;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # SSE support for streaming
        proxy_set_header Connection '';
        proxy_buffering off;
        proxy_cache off;
    }
}
```

#### Option B: Template with Environment Variables
If you want to use environment variables in your nginx configuration, create a template file `/etc/nginx/sites-available/archon.template`:

```bash
# First, export your domain variables
export DOMAIN_UI=archon.your-domain.com
export DOMAIN_API=api.archon.your-domain.com
export DOMAIN_MCP=mcp.archon.your-domain.com
export DOMAIN_AGENTS=agents.archon.your-domain.com

# Then use envsubst to generate the config
envsubst '$DOMAIN_UI $DOMAIN_API $DOMAIN_MCP $DOMAIN_AGENTS' < /etc/nginx/sites-available/archon.template > /etc/nginx/sites-available/archon
```

The template would use `${DOMAIN_UI}`, `${DOMAIN_API}`, etc. instead of hardcoded domains.

### 2.3 Enable Configuration

```bash
ln -s /etc/nginx/sites-available/archon /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 2.4 Setup SSL with Let's Encrypt

```bash
certbot --nginx -d archon.your-domain.com -d api.archon.your-domain.com -d mcp.archon.your-domain.com -d agents.archon.your-domain.com
```

## Step 3: Required Code Changes

### 3.1 Update CORS Configuration (MINIMAL CHANGE)

The backend already allows all origins (`*`) in development. For production, we need to make CORS configurable:

**File: `python/src/server/main.py`**

```python
# Line 177-184, update CORS middleware to use environment variable
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # Use environment variable
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3.2 Frontend API URL Configuration (ALREADY SUPPORTED)

The frontend already supports `VITE_API_URL` environment variable! No changes needed.

The `archon-ui-main/src/config/api.ts` file already checks for `VITE_API_URL`:

```javascript
// Line 11-13
if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
}
```

## Step 4: DNS Configuration

Add these DNS records to your domain:

**Note:** Replace `your-domain.com` with your actual domain and `YOUR_SERVER_IP` with your server's IP address.

```
A    archon.your-domain.com         YOUR_SERVER_IP
A    api.archon.your-domain.com      YOUR_SERVER_IP
A    mcp.archon.your-domain.com      YOUR_SERVER_IP
A    agents.archon.your-domain.com    YOUR_SERVER_IP
```

## Step 5: MCP Client Configuration

For AI coding assistants to connect to the deployed MCP server:

```json
{
  "mcpServers": {
    "archon": {
      "command": "curl",
      "args": [
        "-N",
        "-H", "Accept: text/event-stream",
        "https://mcp.archon.your-domain.com/sse"
      ]
    }
  }
}
```

## Summary of Changes Needed

### Minimal Code Changes Required:

1. **CORS Configuration** (1 line change in `python/src/server/main.py`):
   - Make CORS origins configurable via environment variable

### No Changes Needed (Already Supported):

1. **Frontend API URL**: Already uses `VITE_API_URL` environment variable
2. **Service Ports**: Already configurable via environment variables
3. **Host Configuration**: Already supports `HOST` environment variable
4. **WebSocket Support**: Already configured for Socket.IO
5. **Domain Configuration**: Now fully configurable via environment variables:
   - `DOMAIN_BASE`: Base domain
   - `DOMAIN_UI`: UI subdomain
   - `DOMAIN_API`: API subdomain
   - `DOMAIN_MCP`: MCP subdomain
   - `DOMAIN_AGENTS`: Agents subdomain

### Deployment Steps:

1. ✅ Set up nginx configuration (provided above)
2. ✅ Configure DNS records
3. ✅ Set environment variables in production `.env`
4. ✅ Deploy with docker-compose
5. ✅ Setup SSL certificates with certbot

## Testing the Deployment

After deployment, test each service:

```bash
# Test UI (replace with your domain)
curl https://archon.your-domain.com

# Test API (replace with your domain)
curl https://api.archon.your-domain.com/health

# Test MCP (replace with your domain)
curl https://mcp.archon.your-domain.com/health

# Test Agents (replace with your domain)
curl https://agents.archon.your-domain.com/health
```

## Monitoring and Logs

Monitor the services:

```bash
# Docker logs
docker-compose logs -f

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Service health checks
curl http://localhost:8181/health
curl http://localhost:8051/health
curl http://localhost:8052/health
```

## Conclusion

Archon is **almost ready for nginx deployment** out of the box! The only required change is making CORS origins configurable (1 line change). Everything else is already supported through environment variables and existing configuration options.

The deployment is straightforward:
1. Configure nginx as reverse proxy
2. Set the `VITE_API_URL` environment variable for the frontend
3. Make CORS configurable (minimal code change)
4. Deploy with docker-compose

This architecture provides:
- Clean domain separation for each service
- SSL/TLS encryption for all traffic
- Proper WebSocket and SSE support
- Scalability and maintainability