export function createAvatarSetup(origin: string) {
    const url = new URL('/api/pavol-avatar/mcp', origin).href;
    return {
        url,
        codex: `codex mcp add pavol-avatar --url ${url} --bearer-token-env-var PAVOL_AVATAR_TOKEN`,
        claude: JSON.stringify({ mcpServers: { 'pavol-avatar': {
            type: 'http', url, headers: { Authorization: 'Bearer ${PAVOL_AVATAR_TOKEN}' },
        } } }, null, 2),
        opencode: JSON.stringify({ '$schema': 'https://opencode.ai/config.json', mcp: { servers: { 'pavol-avatar': {
            type: 'remote', url, oauth: false, headers: { Authorization: 'Bearer {env:PAVOL_AVATAR_TOKEN}' },
        } } } }, null, 2),
    };
}
export function createAvatarSkill(origin: string): string {
    return `---
name: pavol-avatar
description: Consult Pavol Hejny's continuously maintained AI expertise for AI tool selection, agent design, specifications, and review of agent work, especially in Czech business contexts. Requires Pavol Avatar MCP and active Full access.
---

# Pavol's AI avatar

Connect the Pavol Avatar MCP server at ${new URL('/api/pavol-avatar/mcp', origin).href}.
Create a personal, revocable connector token in ${new URL('/avatar', origin).href}
and store it as PAVOL_AVATAR_TOKEN in your local environment, never in this file or a committed configuration.

Use the connected tool named consult_pavol (your client may prefix its name).
Include the user's question, relevant goals, constraints, and concise context.
Do not send unrelated files or secrets. Ask for a missing goal when it affects the recommendation.

The live service maintains Pavol's expertise and checks subscription and shared usage.
This file is connection guidance, not a downloaded copy of that knowledge.
If the connection is absent or access is refused, explain how to connect or restore access.
Never pretend a consultation took place. Present its output as AI-avatar advice;
do not claim Pavol personally reviewed it or that it performed external actions.

For follow-up questions reuse the returned conversationId. When retrying the same
logical request, preserve the requestId UUID to avoid charging a repeated request twice.

## Install

- Codex: ~/.agents/skills/pavol-avatar/SKILL.md
- Claude Code: ~/.claude/skills/pavol-avatar/SKILL.md
- OpenCode: ~/.config/opencode/skills/pavol-avatar/SKILL.md
- Project-local alternatives: .agents/skills, .claude/skills, .opencode/skills.

Configure MCP separately using the client-specific instructions on the avatar page.
Downloaded instructions are versioned; they do not automatically update in every client.
The consulted expert knowledge remains live on the server.
`;
}
