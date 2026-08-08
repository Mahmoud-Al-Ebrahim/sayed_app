export const ROLES = {
  ADMIN: 'admin',
  CLIENT: 'client',
};

export const AUTH_PROVIDERS = {
  LOCAL: 'local',
  GOOGLE: 'google',
};

export const CURRENCIES = {
  SYP: 'SYP',
  USD: 'USD',
};

export const TRANSACTION_TYPES = {
  /** Client or admin spends balance on a service order */
  SERVICE_ORDER: 'service_order',
  /** Refund to client after a failed/cancelled order */
  ORDER_REFUND: 'order_refund',
  /** Manual balance correction by admin */
  BALANCE_ADJUSTMENT: 'balance_adjustment',
  /** External provider account debited (cost in USD) */
  EXTERNAL_PROVIDER_DEBIT: 'external_provider_debit',
  /** External provider account credited */
  EXTERNAL_PROVIDER_CREDIT: 'external_provider_credit',
  /** Admin deposits to client balance */
  CLIENT_DEPOSIT: 'client_deposit',
  /** Admin withdraws from client balance */
  CLIENT_WITHDRAW: 'client_withdraw',
};

export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

export const BALANCE_REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  WAIT: 'wait',
};

export const PROVIDER_TYPES = {
  TEMPO: 'tempo',
  SHEHABI: 'shehabi',
};

export const PRICING_TYPES = {
  FIXED: 'fixed',
  PER_UNIT: 'per_unit',
};

export const PROVIDER_DEFAULT_CURRENCY = {
  tempo: CURRENCIES.USD,
  shehabi: CURRENCIES.SYP,
};
