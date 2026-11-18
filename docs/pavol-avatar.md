# Pavol's full personal avatar

The direct addresses are `https://pavolhejny.cz/avatar` and `https://pavolhejny.com/avatar`.
With PAVOL_AVATAR_ENABLED disabled they require no login. The account-based paid pilot is documented in [pavol-avatar-commerce.md](pavol-avatar-commerce.md). These addresses remain intentionally unlisted: no homepage, menu, footer, feed or sitemap links.
Page metadata and middleware send noindex/noarchive, private no-store and no-referrer. Analytics and
cookie controls are suppressed as on unlisted Messages pages. Knowing the URL is sufficient access;
this is not a confidential channel or an authentication mechanism.

The page uses the existing `FloatingAgentChat` session/composer in `page` mode. Floating placements keep
their source, endpoints and local histories. New chat, persisted browser drafts and history, retry IDs, Markdown, attachment
picker/drop/pasted images and Download/Copy exports all use the existing Messages implementation.
The existing limits remain four images/PDFs/UTF-8 text files of up to 4 MiB per question. Model context
is bounded separately from the full visible/exported history.

## Conversation UX

The 18 November layout uses one personal-site header labelled `Pavol Hejný AI` and a borderless chat.
`PavolPageChromeProvider` scopes application identity/footer links to this page. Stateful account actions,
navigation and chat tools are portalled into its header outlets by `PavolChromeSlot`; the components retain
their original state and handlers. Ordinary personal pages outside the provider keep their original chrome.
Sign-in/out belongs in the header; History, Subscription, Connections, New chat and exports live in its menu.
Verified access opens Chat directly. Switching sections keeps the mounted chat and its draft; selecting
another conversation or starting a new one retains the existing confirmation rules.
Avatar terms, privacy and AI Web s.r.o. appear once in the site footer. Remove the duplicated intro,
subtitle, usage banner, privacy paragraph and inline upload instructions. The initial seeded assistant
introduction is hidden in this placement, including restored sessions, without changing recorded history,
exports or model context. File limits remain enforced with errors when an invalid file is supplied.
The latest-message button appears only after a real conversation exists, never over the empty-state suggestions.

The page fits the current viewport below the personal-site header. Its transcript owns scrolling while
the composer remains available, including on narrow screens. Message bodies have a bounded reading width;
code and tables scroll inside their message. The same shared component provides per-message copy with
actual clipboard feedback, expanding/growing drafts, file-drop feedback and
an explicit retry after failed requests. Suggested opening questions only fill the draft; they never send
or call a model until the reader submits. Page-mode New chat confirms before clearing the current local
draft/history; it does not delete private administrative records.

Automatic scrolling follows the latest message only while the reader is near the bottom. Reading older
messages keeps the position and offers a Latest message button. Pending replies have a readable status
and a Stop waiting action. Stopping aborts the client wait, preserves the draft/files and uncertain request
identity, and does not claim that an external generation was certainly undone. Non-JSON proxy errors also
retain that identity for deduplicated retry. Desktop Enter submits, Shift+Enter adds a line; touch-screen
Enter keeps its normal newline behavior, with an explicit send button.

The previous 12,000-character reply cap rejected valid long interview answers after generation. Migration
`2026-11-1601-long-public-chat-replies.sql` widens only the stored reply check to 48,000 characters. The
server and model-window validator share that bound. Questions remain at 4,000 characters and model input
at 16,000; display, exports and administrative history retain the complete reply. An oversized recent answer
contributes a clearly marked beginning/end excerpt to the model window rather than dropping all its context.
The migration changes no existing record, source, agent, authorization or grant.

## Agent and administration

`SITE_AGENT_EMBEDS['pavol-avatar']` selects the dedicated managed agent
`cad89f1a-21bf-47f0-a93e-72bc33f5fe3f`, named **Pavol Hejný · plný avatar**. Edit its Book or disable it
in `/admin/agents`. The same row serves both languages; each has separate conversation history buttons.
The public endpoint never accepts an arbitrary agent UUID. Existing deletion protection also covers this agent.

Migration `2026-11-1600-pavol-full-avatar.sql` seeds a detailed public conversational edition derived from
the owner-requested personal avatar of 16 November 2026. It preserves his voice, reasoning, public career,
documented positions, synthetic examples and public reference links. It excludes private source URLs,
personal/family facts, internal commercial arrangements, infrastructure and client records. Text instructions
alone cannot protect information given to a public model; the private original is not deployed or sent to it.
The seed fits the existing 50,000-character editor/validation limit and compiles with the actual site runtime.

The database Book is the runtime authority, not a bundled fallback. `ON CONFLICT DO NOTHING` preserves
subsequent admin edits and disabled state. No existing agent is updated. The original uniquely named
`Pavol Hejný` and its lightweight homepage endpoints remain unchanged. The full avatar uses the existing
server-side OpenAI configuration and adapter, without new keys, accounts, tools or live account access.
The current site compiler does not inline prose `KNOWLEDGE` blocks. This placement therefore explicitly
passes its complete current database Book as quoted model context in addition to the compiled instructions.
It does not execute knowledge URLs or tools, and it never returns the Book to the browser. Other placements
keep their previous context behavior. A provider-payload test checks that the public career and views reach
the actual Responses request, rather than merely existing in storage.

## History and files

The ordinary private tables retain history under `site-pavol-avatar-cs` and `site-pavol-avatar-en`, separate
from Messages, `pavol-cs/en`, and comparison advisers. File uploads, question persistence, model inputs,
durable links and administration reuse the existing handlers. Host/language checks bind Czech chat/files
to `pavolhejny.cz` and English chat/files to `pavolhejny.com`, including www aliases. Same-origin requests,
file-byte validation, bounded bodies, rate limits and source/conversation ownership checks remain enforced.
The product privacy notice explains that the author can later read conversations and attachments. Anonymous database roles
cannot enumerate histories or file records. Preview hosts and local development follow the embed registry's
existing preview policy; public primary and podcast domains cannot use this avatar.

## Validation

Tests exercise the actual Book compiler, migration replay/edit preservation, old-agent preservation,
separate histories, private database grants, page metadata/indexing, chat/upload/file host checks,
inline attachment submission, refresh restoration, locale separation and new-chat isolation. Existing
Messages, adviser and middleware regression tests cover the retained floating behavior.

## Live voice

The page uses the shared [realtime voice conversation](chat-voice.md), including the exact Pavol Hejný 2026 voice, one text/voice history, microphone controls and conservative interruption metadata. It does not create a second avatar or change the Book context.
