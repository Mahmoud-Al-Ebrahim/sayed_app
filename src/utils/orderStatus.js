import { ORDER_STATUS } from '../constants/index.js';

const TEMPO_STATUS_MAP = {
  accept: ORDER_STATUS.COMPLETED,
  wait: ORDER_STATUS.PROCESSING,
  reject: ORDER_STATUS.FAILED,
};

const SHEHABI_STATUS_MAP = {
  completed: ORDER_STATUS.COMPLETED,
  success: ORDER_STATUS.COMPLETED,
  accept: ORDER_STATUS.COMPLETED,
  pending: ORDER_STATUS.PROCESSING,
  processing: ORDER_STATUS.PROCESSING,
  wait: ORDER_STATUS.PROCESSING,
  rejected: ORDER_STATUS.FAILED,
  reject: ORDER_STATUS.FAILED,
  failed: ORDER_STATUS.FAILED,
  cancelled: ORDER_STATUS.CANCELLED,
};

export function mapProviderStatus(providerType, status) {
  const normalized = String(status || '').toLowerCase();
  const map = providerType === 'shehabi' ? SHEHABI_STATUS_MAP : TEMPO_STATUS_MAP;
  return map[normalized] || ORDER_STATUS.PROCESSING;
}
