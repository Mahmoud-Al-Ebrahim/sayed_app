import { providerFetch, ProviderError } from './base.client.js';
import { msg } from '../constants/messages.js';
import { resolveProviderMessage } from '../utils/resolveMessage.js';

const DEFAULT_BASE_URL = 'https://alshhabi.com/api/fastapi';

export class ShehabiClient {
  constructor({ apiToken = process.env.SHEHABI_API_TOKEN, baseUrl = DEFAULT_BASE_URL }) {
    if (!apiToken) throw new ProviderError(msg.SHEHABI_TOKEN_REQUIRED);
    this.apiToken = apiToken;
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  headers() {
    return {
      apiToken: this.apiToken,
      Accept: 'application/json',
    };
  }

  async getProfile() {
    const data = await providerFetch(`${this.baseUrl}/balance`, {
      headers: this.headers(),
    });

    if (data.error) {
      throw new ProviderError(resolveProviderMessage(data.message, msg.SHEHABI_BALANCE_FAILED), { raw: data });
    }

    return {
      balance: parseFloat(data.data.balance),
      balanceUSD: parseFloat(data.data.balance),
      name: data.data.name,
      raw: data,
    };
  }

  async getProducts() {
    const data = await providerFetch(`${this.baseUrl}/products`, {
      headers: this.headers(),
    });

    if (data.error) {
      throw new ProviderError(resolveProviderMessage(data.message, msg.SHEHABI_PRODUCTS_FAILED), { raw: data });
    }

    return data.data.products || [];
  }

  async createOrder({ productId, quantity, params = {}, orderUuid }) {
    const query = new URLSearchParams({
      qty: String(quantity),
      ...params,
    });
    if (orderUuid) query.set('uuid', orderUuid);

    const data = await providerFetch(
      `${this.baseUrl}/requestorder/${productId}/params?${query}`,
      { headers: this.headers() }
    );

    if (data.error && !data.data?.order_number) {
      throw new ProviderError(resolveProviderMessage(data.message, msg.SHEHABI_ORDER_FAILED), { raw: data });
    }

    return {
      orderId: data.data.order_number,
      status: data.data.status,
      actualCostUSD: parseFloat(data.data.amount),
      notes: data.data.notes,
      duplicate: Boolean(data.error && data.data?.order_number),
      raw: data,
    };
  }

  async checkOrders({ orderIds = [] }) {
    const data = await providerFetch(
      `${this.baseUrl}/checkorders?order_ids=${orderIds.join(',')}`,
      { headers: this.headers() }
    );

    if (data.error) {
      throw new ProviderError(resolveProviderMessage(data.message, msg.SHEHABI_CHECK_FAILED), { raw: data });
    }

    return (data.data.orders || []).map((order) => ({
      orderId: order.order_number,
      status: order.status,
      priceUSD: parseFloat(order.price),
      customerInput: order.gamer_data,
      createdAt: order.created_at,
      raw: order,
    }));
  }
}
