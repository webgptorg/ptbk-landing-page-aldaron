export function getAvatarTelegramConfiguration() {
    const botToken = process.env.PAVOL_AVATAR_TELEGRAM_BOT_TOKEN?.trim() ?? '';
    const webhookSecret = process.env.PAVOL_AVATAR_TELEGRAM_WEBHOOK_SECRET?.trim() ?? '';
    const botUsername = (process.env.PAVOL_AVATAR_TELEGRAM_BOT_USERNAME?.trim() ?? '').replace(/^@/, '');
    const available = /^\d+:[A-Za-z0-9_-]{20,}$/.test(botToken) &&
        /^[A-Za-z0-9_-]{32,256}$/.test(webhookSecret) && /^[A-Za-z0-9_]{5,32}$/.test(botUsername);
    return { botToken, webhookSecret, botUsername, available };
}
