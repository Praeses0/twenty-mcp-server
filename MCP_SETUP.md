# MCP Server Setup Guide (v1.19 Fork)

This fork is designed for **Twenty CRM v1.19.0 self-hosted** instances. It runs as a stdio MCP server, meaning it communicates directly with your MCP client (Claude Code, Claude Desktop, etc.) over standard input/output.

## Quick Setup

### 1. Clone and Build

```bash
git clone https://github.com/Praeses0/twenty-mcp-server.git ~/Projects/twenty-mcp-server
cd ~/Projects/twenty-mcp-server
npm install
npm run build
```

### 2. Get Your API Key

1. Log into your Twenty CRM instance
2. Go to **Settings > API & Webhooks**
3. Click **Generate API Key**
4. Copy the key immediately (it's only shown once)

### 3. Configure Your MCP Client

#### Claude Code (`~/.claude.json`)

Add under the `mcpServers` key:

```json
"twenty-crm": {
  "type": "stdio",
  "command": "node",
  "args": ["/absolute/path/to/twenty-mcp-server/dist/index.js"],
  "env": {
    "TWENTY_API_KEY": "your-api-key",
    "TWENTY_BASE_URL": "https://your-twenty-instance.com",
    "NODE_TLS_REJECT_UNAUTHORIZED": "0"
  }
}
```

#### Claude Desktop

Add to your config file:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "twenty-crm": {
      "command": "node",
      "args": ["/absolute/path/to/twenty-mcp-server/dist/index.js"],
      "env": {
        "TWENTY_API_KEY": "your-api-key",
        "TWENTY_BASE_URL": "https://your-twenty-instance.com"
      }
    }
  }
}
```

#### Cursor / Cline / Other MCP Clients

Same pattern — point `command` to `node` and `args` to your `dist/index.js` with the environment variables.

### 4. Restart and Verify

Restart your MCP client, then try:

```
"List all companies in my CRM"
"Show me the company schema"
"Create a custom object called Vehicle"
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TWENTY_API_KEY` | yes | Your Twenty CRM API key (JWT format) |
| `TWENTY_BASE_URL` | yes | Your Twenty instance URL, no trailing slash |
| `NODE_TLS_REJECT_UNAUTHORIZED` | no | Set to `0` for self-signed certificates |

## Self-Signed Certificates

If your Twenty instance uses a self-signed or internal CA certificate, set `NODE_TLS_REJECT_UNAUTHORIZED=0` in the env config. This disables TLS certificate verification for the MCP server process only.

## Troubleshooting

**"TWENTY_API_KEY environment variable is required"**
- Check that your `env` block in the MCP config has the correct key name and value.

**"401 Unauthorized"**
- Your API key may have expired. Generate a new one in Twenty Settings.

**"fetch failed" or connection errors**
- Verify `TWENTY_BASE_URL` is correct and reachable from your machine.
- For self-signed certs, add `NODE_TLS_REJECT_UNAUTHORIZED=0`.

**Tools not showing up**
- Make sure `dist/index.js` exists (run `npm run build`).
- Use an absolute path, not relative.
- Restart your MCP client after config changes.

## HTTP Server Mode (Advanced)

For multi-user or web integration deployments, the server can also run in HTTP mode:

```bash
TWENTY_API_KEY=your-key TWENTY_BASE_URL=https://your-instance npm start
# Server at http://localhost:3000/mcp
```

See [OAUTH.md](OAUTH.md) for OAuth 2.1 authentication setup in HTTP mode.
