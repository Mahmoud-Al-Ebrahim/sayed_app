import { providerFetch, ProviderError } from './base.client.js';
import { msg } from '../constants/messages.js';
import { resolveProviderMessage } from '../utils/resolveMessage.js';

const baseUrl = 'https://api.alshahen-store.com';
const apiToken = process.env.SHEHABI_API_TOKEN;

export class ShehabiClient {
  constructor(){}

  headers() {
    return {
      'api-token': apiToken,
      Accept: 'application/json',
    };
  }

  async getProfile() {
    const data = await providerFetch(`${baseUrl}/client/api/profile`, {
      headers: this.headers(),
    });

    if (data.error) {
      throw new ProviderError(resolveProviderMessage(data.message, msg.SHEHABI_BALANCE_FAILED), { raw: data });
    }

    return {
      balance: parseFloat(data.balance),
      balanceUSD: parseFloat(data.balance),
      name: data.name,
      raw: data,
    };
  }

  async getProducts() {
    return providerFetch(`${baseUrl}/client/api/products`, {
      headers: this.headers(),
    });
  }

  async createOrder({ productId, quantity, params = {}, orderUuid }) {
    const query = new URLSearchParams({
      qty: String(quantity),
      order_uuid: orderUuid,
      ...params,
    });

    const data = await providerFetch(
      `${baseUrl}/client/api/newOrder/${productId}/params?${query}`,
      { headers: this.headers() }
    );

    
    if (data.status !== 'OK' || !data.data) {
      throw new ProviderError(resolveProviderMessage(data.message, msg.SHEHABI_ORDER_FAILED), { raw: data });
    }

    return {
      orderId: data.data.order_id,
      status: data.data.status,
      actualCostUSD: parseFloat(data.data.price),
      replay: data.data.replay_api,
      raw: data,
    };
  }

  async checkOrders({ orderIds = [], useUuid = false }) {
    const ids = orderIds.join(',');
    const uuidParam = useUuid ? '&uuid=1' : '';
    const data = await providerFetch(
      `${baseUrl}/client/api/check?orders=[${ids}]${uuidParam}`,
      { headers: this.headers() }
    );

        if (data.status !== 'OK') {
      throw new ProviderError(msg.SHEHABI_CHECK_FAILED, { raw: data });
    }
        return (data.data || []).map((order) => ({
      orderId: order.order_id,
      status: order.status,
      priceUSD: parseFloat(order.price),
      productName: order.product_name,
      quantity: order.quantity,
      customerInput: order.data,
      replay: order.replay_api,
      createdAt: order.created_at,
      raw: order,
    }));
  }
}
