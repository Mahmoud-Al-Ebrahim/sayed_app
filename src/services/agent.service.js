import validator from 'validator';
import { User } from '../models/User.js';
import { ROLES, AUTH_PROVIDERS } from '../constants/index.js';
import { msg } from '../constants/messages.js';
import { adjustUserBalance } from './ledger.service.js';
import { TRANSACTION_TYPES } from '../constants/index.js';

export async function listAgents({ page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;
  const [agents, total] = await Promise.all([
    User.find({ role: ROLES.AGENT }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments({ role: ROLES.AGENT }),
  ]);
  return { agents, total, page, limit };
}

export async function createAgent({ email, name, password }) {
  if (!validator.isEmail(email)) throw new Error(msg.EMAIL_REQUIRED);
  if (!name?.trim()) throw new Error(msg.NAME_REQUIRED);
  if (!password || password.length < 8) throw new Error(msg.PASSWORD_MIN);

  const exists = await User.findByEmail(email);
  if (exists) throw new Error(msg.EMAIL_EXISTS);

  const agent = new User({
    email: email.toLowerCase().trim(),
    name: name.trim(),
    role: ROLES.AGENT,
    authProviders: [AUTH_PROVIDERS.LOCAL],
  });
  await agent.setPassword(password);
  await agent.save();
  return agent;
}

export async function updateAgent(agentId, { name, isActive }) {
  const agent = await User.findOne({ _id: agentId, role: ROLES.AGENT });
  if (!agent) throw new Error(msg.AGENT_NOT_FOUND);
  if (name != null) agent.name = name.trim();
  if (isActive != null) agent.isActive = isActive;
  await agent.save();
  return agent;
}

export async function depositToAgent({ agentId, amount, adminId, note, idempotencyKey }) {
  const agent = await User.findOne({ _id: agentId, role: ROLES.AGENT, isActive: true });
  if (!agent) throw new Error(msg.AGENT_NOT_FOUND_OR_INACTIVE);

  return adjustUserBalance({
    userId: agent._id,
    amount,
    type: TRANSACTION_TYPES.AGENT_DEPOSIT,
    performedBy: adminId,
    counterparty: adminId,
    description: note || 'إيداع من الإدارة',
    idempotencyKey,
  });
}

export async function withdrawFromAgent({ agentId, amount, adminId, note, idempotencyKey }) {
  const agent = await User.findOne({ _id: agentId, role: ROLES.AGENT, isActive: true });
  if (!agent) throw new Error(msg.AGENT_NOT_FOUND_OR_INACTIVE);

  return adjustUserBalance({
    userId: agent._id,
    amount,
    type: TRANSACTION_TYPES.AGENT_WITHDRAW,
    performedBy: adminId,
    counterparty: adminId,
    description: note || 'سحب من الإدارة',
    idempotencyKey,
  });
}
