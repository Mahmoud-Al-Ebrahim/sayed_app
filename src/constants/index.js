export const ROLES = {
  ADMIN: 'admin',
  AGENT: 'agent',
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
  /** Admin credits an agent's balance */
  AGENT_DEPOSIT: 'agent_deposit',
  /** Admin debits an agent's balance */
  AGENT_WITHDRAW: 'agent_withdraw',
  /** Agent spends balance on a service order */
  SERVICE_ORDER: 'service_order',
  /** Refund to agent after a failed/cancelled order */
  ORDER_REFUND: 'order_refund',
  /** Manual balance correction by admin */
  BALANCE_ADJUSTMENT: 'balance_adjustment',
  /** External provider account debited (cost in USD) */
  EXTERNAL_PROVIDER_DEBIT: 'external_provider_debit',
  /** External provider account credited */
  EXTERNAL_PROVIDER_CREDIT: 'external_provider_credit',
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
