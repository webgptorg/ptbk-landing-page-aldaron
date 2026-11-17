/** Public presentation only; no server configuration or authentication lives here. */
export const AVATAR_PUBLIC_PRICE_CZK=1000;
export const AVATAR_PUBLIC_TERMS_VERSION='2026-11-17-v1';
export const AVATAR_PUBLIC_TERMS_PATH='/avatar/legal/terms/2026-11-17-v1';
export const AVATAR_PUBLIC_PRIVACY_PATH='/avatar/legal/privacy/2026-11-17-v1';
export type AvatarAvailability={enabled:boolean;authEnabled:boolean;authMethod:'otp'|'magic-link';billingEnabled:boolean;isTest:boolean;slovakiaEnabled?:boolean;telegramEnabled?:boolean;limits:{free:number;light:number;full:number}};
export type AvatarAccountState={
 principal:{id:string;email:string}|null;
 access:{plan:'free'|'light'|'full';limit:number;used:number;periodStart:string;periodEnd:string;subscription:{id:string;status:string;cancelAtPeriodEnd:boolean;paidThrough:string|null}|null}|null;
 availability:AvatarAvailability;
};
export type AvatarHistoryItem={id:string;title:string;channel:string;language:string;updated_at:string};
