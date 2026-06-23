import { PROVIDER_TYPES } from '../constants/index.js';
import { msg } from '../constants/messages.js';
import { decrypt } from '../utils/crypto.js';
import { TempoClient } from './tempo.client.js';
import { ShehabiClient } from './shehabi.client.js';
import { ProviderError } from './base.client.js';


export function createProviderClient(providerDoc) {
  const baseUrl = providerDoc.websiteUrl || undefined;

  switch (providerDoc.providerType) {
    case PROVIDER_TYPES.TEMPO:
      return new TempoClient();
    case PROVIDER_TYPES.SHEHABI:
      return new ShehabiClient();
    default:
      throw new ProviderError(msg.PROVIDER_UNSUPPORTED_TYPE(providerDoc.providerType));
  }
}

export { ProviderError } from './base.client.js';
