import { User } from '../models/User.js';
import { ExchangeRate } from '../models/ExchangeRate.js';
import { ExternalProvider } from '../models/ExternalProvider.js';
import { ROLES, AUTH_PROVIDERS, PROVIDER_TYPES, PROVIDER_DEFAULT_CURRENCY } from '../constants/index.js';
import { env } from '../config/env.js';
import { encrypt } from '../utils/crypto.js';

async function seedProvider({ name, providerType, apiToken, websiteUrl }) {
  if (!apiToken) return;
  const exists = await ExternalProvider.exists({ providerType });
  if (exists) return;
try{
  await ExternalProvider.create({
    name,
    providerType,
    websiteUrl,
    balanceCurrency: PROVIDER_DEFAULT_CURRENCY[providerType],
    credentials: encrypt(apiToken),
    notes: 'Bootstrapped from environment variables',
  });
}catch(e){
console.log(`error: ${e}`);
}
  console.log(`Bootstrap provider created: ${name}`);
}

export async function seedAdminAndDefaults() {
  const adminExists = await User.exists({ role: ROLES.ADMIN });
  if (!adminExists) {
    const { email, password, name , integerId} = env.bootstrapAdmin;
    if (!email || !password) {
      console.warn('No ADMIN_EMAIL / ADMIN_PASSWORD set — skipping admin bootstrap');
    } else {
      const admin = new User({
        email: email.toLowerCase().trim(),
        name,
        role: ROLES.ADMIN,
        integerId: integerId,
        authProviders: [AUTH_PROVIDERS.LOCAL],
      });

      await admin.setPassword(password);
      await admin.save();
      console.log(`Bootstrap admin created: ${admin.email}`);
    }
  }

  const rateExists = await ExchangeRate.exists({ isActive: true });
  if (!rateExists) {
    const admin = await User.findOne({ role: ROLES.ADMIN });
    if (admin) {
      await ExchangeRate.create({
        rate: 14000,
        isActive: true,
        setBy: admin._id,
        note: 'Default bootstrap rate — update in admin panel',
      });
    }
  }

  await seedProvider({
    name: 'Tempo',
    providerType: PROVIDER_TYPES.TEMPO,
    apiToken: env.providers.tempo.apiToken,
    websiteUrl: env.providers.tempo.baseUrl,
  });

  await seedProvider({
    name: 'Shehabi',
    providerType: PROVIDER_TYPES.SHEHABI,
    apiToken: env.providers.shehabi.apiToken,
    websiteUrl: env.providers.shehabi.baseUrl,
  });
}
