import { API_BASE_URL, apiClient } from './client.ts';
import type { Me } from '../types/auth.ts';

export const authApi = {
  me: () => apiClient.get<Me>('/auth/me'),
  logout: () => apiClient.post<void>('/auth/logout', {}),

  // Full-page navigation, not fetch — the API redirects to Discord and,
  // after the handshake, back to returnUrl on the frontend.
  loginUrl: (returnUrl: string) => `${API_BASE_URL}/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`,

  // Development only (the API doesn't even map it elsewhere): same login
  // rules as Discord, without a Discord app. See Program.cs.
  devLoginUrl: (discordId: string, handle: string, returnUrl: string) =>
    `${API_BASE_URL}/auth/dev-login?discordId=${encodeURIComponent(discordId)}&handle=${encodeURIComponent(handle)}&returnUrl=${encodeURIComponent(returnUrl)}`,
};
