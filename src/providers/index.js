import { PROVIDER_TYPES } from '../constants/index.js';
import { msg } from '../constants/messages.js';
import { decrypt } from '../utils/crypto.js';
import { TempoClient } from './tempo.client.js';
import { ShehabiClient } from './shehabi.client.js';
import { ProviderError } from './base.client.js';

export function getProviderApiToken(providerDoc) {
  if (!providerDoc.credentials) {
    throw new ProviderError(msg.PROVIDER_NO_TOKEN(providerDoc.name));
  }
  return decrypt(providerDoc.credentials);
}

export function createProviderClient(providerDoc) {
  const apiToken = getProviderApiToken(providerDoc);
  const baseUrl = providerDoc.websiteUrl || undefined;

  switch (providerDoc.providerType) {
    case PROVIDER_TYPES.TEMPO:
      return new TempoClient({ apiToken, baseUrl });
    case PROVIDER_TYPES.SHEHABI:
      return new ShehabiClient({ apiToken, baseUrl });
    default:
      throw new ProviderError(msg.PROVIDER_UNSUPPORTED_TYPE(providerDoc.providerType));
  }
}

export { ProviderError } from './base.client.js';
