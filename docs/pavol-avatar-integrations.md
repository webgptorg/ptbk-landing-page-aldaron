# Pavol Avatar connections

The website, MCP and Telegram call the same owner-scoped `askAvatar` service. They share paid access and monthly usage. MCP and Telegram require current Full access; cancellation, expiry or loss of Full applies on subsequent calls. The one-person licence is contractual: this implementation adds no device, IP or seat enforcement.

## Credentials and identity

An email-authenticated member creates connector tokens at `POST /api/pavol-avatar/tokens`. A token is returned once. Only its SHA-256 hash is stored in private `pavol_avatar_tokens`; list responses never expose hashes or secrets. Each token has a label and can be individually revoked with `DELETE` and its UUID. Expired members can still list/revoke their tokens. Creating a token requires Full. Tokens never enter URLs, downloadable skills, legal documents, shared project configuration, or logs.

The token resolves to an avatar principal, not a Stripe Customer or a Promptbook identity cookie. Product entitlement is checked independently at every MCP request and again at tool invocation. Browser management mutations require a matching Origin. Machine MCP requests use their bearer credential; unrelated browser Origins are refused. The personal-domain/preview host guard remains active.

The public, credential-free `GET /api/pavol-avatar/skill` returns the latest generated SKILL.md instruction file. Its name/description explain when to consult the live expert. It contains no copy of private expertise. Updating the server's managed Book updates subsequent consultations without replacing an installed skill. Already downloaded instructions do not automatically update in every client.

## MCP

Endpoint: `https://pavolhejny.cz/api/pavol-avatar/mcp` (the equivalent English host is supported).
Authentication: `Authorization: Bearer <personal connector token>`.

The pinned official SDK `@modelcontextprotocol/server@2.4.0` serves modern revision 2026-07-28 and stateless legacy traffic. `createMcpHandler` handles negotiation, validation and framing. No in-memory protocol session is used as identity or entitlement. The exposed `consult_pavol` tool accepts `question`, optional `conversationId`, `requestId` and `language`. Preserve the returned conversationId for follow-ups. Preserve a caller-generated requestId UUID when retrying the same logical consultation so usage is not consumed twice. Responses are AI-avatar advice, never claims of human review or external work.

### Codex

Set `PAVOL_AVATAR_TOKEN` privately in the environment where Codex runs, then:

```bash
codex mcp add pavol-avatar --url https://pavolhejny.cz/api/pavol-avatar/mcp --bearer-token-env-var PAVOL_AVATAR_TOKEN
```

Set `tool_timeout_sec = 120` in its MCP config if consultations exceed the default 60-second tool timeout. Install the skill as `~/.agents/skills/pavol-avatar/SKILL.md`, or the repository-local equivalent.

### Claude Code

Store this credential-free project configuration in `.mcp.json`; provide the actual token through the local environment:

```json
{
  "mcpServers": {
    "pavol-avatar": {
      "type": "http",
      "url": "https://pavolhejny.cz/api/pavol-avatar/mcp",
      "headers": { "Authorization": "Bearer ${PAVOL_AVATAR_TOKEN}" }
    }
  }
}
```

Install the skill as `~/.claude/skills/pavol-avatar/SKILL.md`, or the repository-local equivalent.

### OpenCode V2

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "servers": {
      "pavol-avatar": {
        "type": "remote",
        "url": "https://pavolhejny.cz/api/pavol-avatar/mcp",
        "oauth": false,
        "headers": { "Authorization": "Bearer {env:PAVOL_AVATAR_TOKEN}" }
      }
    }
  }
}
```

V2 uses `mcp.servers`, `disabled` rather than `enabled`, and `{env:NAME}` substitution. Install the skill as `~/.config/opencode/skills/pavol-avatar/SKILL.md`; OpenCode also reads `~/.agents/skills`.

These are local-client setup instructions. Hosted ChatGPT web plugin support and a complete OAuth authorization server are separate additions, not claimed by this bearer-based release.

## Telegram

Configure a bot dedicated to this avatar. Do not reuse a bot serving another product. Required server-only values:

| Variable | Purpose |
|---|---|
| `PAVOL_AVATAR_TELEGRAM_BOT_TOKEN` | Telegram Bot API token |
| `PAVOL_AVATAR_TELEGRAM_WEBHOOK_SECRET` | Random 32-256 characters from A-Z, a-z, 0-9, underscore or hyphen |
| `PAVOL_AVATAR_TELEGRAM_BOT_USERNAME` | Bot username, without @ |

Telegram remains visibly unavailable until all three values are configured. Register the HTTPS endpoint `/api/pavol-avatar/telegram/webhook` with Telegram's `setWebhook`, passing `secret_token` and `allowed_updates: ["message"]`. Use production environment values privately; never paste a bot token into a tracked file or command output. Registration is an explicit operator action; deployment does not register, change or delete a webhook.

A Full member requests a ten-minute, one-use link via `POST /api/pavol-avatar/telegram/link`. The server returns `https://t.me/<bot>?start=<random-code>`. Only the code hash is stored, and creating another link for the same account invalidates earlier ones. Opening the link and pressing Start atomically consumes the code and binds the private Telegram user ID to the verified avatar principal. No email address entered in Telegram can establish identity. `/disconnect` or authenticated `DELETE /api/pavol-avatar/telegram/link` removes the binding without cancelling the subscription.

Only a private chat whose chat ID matches the sender's user ID is accepted. Groups, channels, bot senders and unrelated update types are acknowledged without running a model or sending a reply. The secret header is checked before parsing update content. Telegram currently accepts text; attachment/audio messages direct the member to the web.

Webhook processing uses private persistent update IDs and claims. Retries reuse a stored response and resume from the last confirmed sent chunk. Model calls use stable update-derived request IDs, and each member's Telegram conversation is separate. Long replies are split under Telegram's message limit, preserve Unicode, and are sent as plain text to avoid Markdown injection. Stored reply delivery is at-least-once: an unavoidable crash between Telegram accepting a chunk and recording that acceptance can repeat that chunk; the implementation does not claim exactly-once external delivery.

Before activation, test on an isolated bot: wrong secret, private linking, expired/replayed link, unlinked user, inactive Full, group message, repeated update ID, delivery failure/retry, long Unicode response and disconnect. Automated tests mock Telegram network calls; they never send real messages.

## Validation and primary documentation

Focused tests exercise the actual SDK's legacy initialization/list/call and modern discovery, authorization rejection, tool input limits, rechecked Full access, credential-free installation guidance, one-use linking and durable deduplication in PostgreSQL-compatible PGlite. They do not establish a real end-to-end session in every client or production Telegram delivery.

- https://ts.sdk.modelcontextprotocol.io/v2/migration/support-2026-07-28
- https://modelcontextprotocol.io/specification/latest/basic/versioning
- https://developers.openai.com/codex/mcp
- https://developers.openai.com/codex/skills
- https://code.claude.com/docs/en/mcp
- https://code.claude.com/docs/en/skills
- https://opencode.ai/docs/mcp-servers
- https://opencode.ai/docs/skills
- https://core.telegram.org/bots/api#setwebhook
