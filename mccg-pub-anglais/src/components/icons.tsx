import React from "react";

type P = { size?: number; color?: string; stroke?: number; style?: React.CSSProperties };
const S: React.FC<P & { children: React.ReactNode }> = ({ size = 64, color = "currentColor", stroke = 2.2, style, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>{children}</svg>
);

export const IBriefcase: React.FC<P> = (p) => <S {...p}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" /></S>;
export const ITrend: React.FC<P> = (p) => <S {...p}><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></S>;
export const ICap: React.FC<P> = (p) => <S {...p}><path d="M2 9l10-5 10 5-10 5z" /><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5M22 9v6" /></S>;
export const IPlane: React.FC<P> = (p) => <S {...p}><path d="M10.5 13.5L3 11l1.5-1.5 8 1 4-4.5c1-1 2.5-1.5 3.2-.8.7.7.2 2.2-.8 3.2l-4.5 4 1 8L14 21l-2.5-7.5" /><path d="M7 17l-2 2" /></S>;
export const IPin: React.FC<P> = (p) => <S {...p}><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.6" /></S>;
export const IMonitor: React.FC<P> = (p) => <S {...p}><rect x="2" y="4" width="20" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></S>;
export const ICheck: React.FC<P> = (p) => <S {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></S>;
export const ITarget: React.FC<P> = (p) => <S {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" /></S>;
export const IDoc: React.FC<P> = (p) => <S {...p}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6M8 13h8M8 17h5" /></S>;
export const IMic: React.FC<P> = (p) => <S {...p}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></S>;
export const IUser: React.FC<P> = (p) => <S {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></S>;
export const IBuilding: React.FC<P> = (p) => <S {...p}><rect x="4" y="3" width="16" height="18" rx="1.5" /><path d="M9 7h.01M15 7h.01M9 11h.01M15 11h.01M9 15h.01M15 15h.01M10 21v-3h4v3" /></S>;
export const IRocket: React.FC<P> = (p) => <S {...p}><path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2" /><path d="M9 15l-3-3c1-4 4.5-8.5 12-9-.5 7.5-5 11-9 12z" /><circle cx="14.5" cy="9.5" r="1.6" /></S>;
export const IPhone: React.FC<P> = (p) => <S {...p}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" /></S>;
/** Bulle de discussion avec combiné (pictogramme générique « messagerie / WhatsApp »). */
export const IChatPhone: React.FC<P> = ({ size = 64, color = "currentColor", style }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" style={style}>
    <path d="M16 3.2C9 3.2 3.3 8.8 3.3 15.8c0 2.4.7 4.7 1.9 6.6L3.2 28.8l6.6-2c1.8 1 3.9 1.6 6.2 1.6 7 0 12.7-5.7 12.7-12.6S23 3.2 16 3.2z" fill="none" stroke={color} strokeWidth={2.4} strokeLinejoin="round" />
    <path d="M11.6 9.6c.4 0 .7 0 1 .7l1.2 2.8c.1.3.1.6-.1.9l-.8 1c-.2.3-.2.5 0 .8.9 1.6 2.3 3 4 3.9.3.2.6.1.8-.1l1-1.2c.2-.3.5-.3.8-.2l2.7 1.3c.3.2.6.3.6.6 0 1.4-1 2.8-2.6 3-2 .2-4.4-.8-6.6-2.8-2.4-2.2-3.8-4.6-3.9-6.6 0-1.6 1-2.8 1.9-3.1z" fill={color} />
  </svg>
);
