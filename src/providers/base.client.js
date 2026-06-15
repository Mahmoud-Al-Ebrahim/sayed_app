import { msg } from '../constants/messages.js';
import { resolveProviderMessage } from '../utils/resolveMessage.js';

export class ProviderError extends Error {
  constructor(message, { code, status, raw } = {}) {
    super(message);
    this.name = 'ProviderError';
    this.code = code;
    this.status = status;
    this.raw = raw;
  }
}

export async function providerFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...options.headers,
    },
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const upstreamMessage = typeof data === 'object' && data?.message ? data.message : null;
    throw new ProviderError(
      resolveProviderMessage(upstreamMessage, msg.PROVIDER_HTTP_ERROR(response.status)),
      { status: response.status, raw: data }
    );
  }

  return data;
}
