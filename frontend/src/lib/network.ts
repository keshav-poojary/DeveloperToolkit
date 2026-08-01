export const NETWORK_API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/network`
  : 'https://api.developertoolkit.online/api/network';

export const normalizeHostname = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return '';

  let host = trimmed;
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed)) {
    try {
      host = new URL(trimmed).hostname;
    } catch {
      host = trimmed;
    }
  } else if (trimmed.includes('/')) {
    host = trimmed.split('/')[0];
  }

  return host.replace(/:\d+$/, '').replace(/\/*$/, '').toLowerCase();
};

export const normalizeUrl = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const hasScheme = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed);
  const normalized = hasScheme ? trimmed : `https://${trimmed}`;

  try {
    return new URL(normalized).href;
  } catch {
    return '';
  }
};
