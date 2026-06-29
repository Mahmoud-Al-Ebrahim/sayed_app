import { Badge } from '../models/Badge.js';
import { msg } from '../constants/messages.js';

export async function createBadge(data) {
  const badge = await Badge.create(data);
  return badge;
}

export async function listBadges({ activeOnly = false } = {}) {
  const filter = activeOnly ? { isActive: true } : {};
  const badges = await Badge.find(filter).sort({ level: 1 });
  return badges;
}

export async function getBadgeById(badgeId) {
  const badge = await Badge.findById(badgeId);
  if (!badge) throw new Error(msg.BADGE_NOT_FOUND);
  return badge;
}

export async function updateBadge(badgeId, data) {
  const badge = await Badge.findByIdAndUpdate(
    badgeId,
    { $set: data },
    { new: true, runValidators: true }
  );
  if (!badge) throw new Error(msg.BADGE_NOT_FOUND);
  return badge;
}

export async function deleteBadge(badgeId) {
  const badge = await Badge.findById(badgeId);
  if (!badge) throw new Error(msg.BADGE_NOT_FOUND);
  
  // Soft delete - set isActive to false
  badge.isActive = false;
  await badge.save();
  return badge;
}

export async function getBadgeByName(name) {
  return Badge.findOne({ name });
}

export async function ensureDefaultBadges() {
  // Ensure bronze badge exists as default
  const bronze = await Badge.findOne({ name: 'bronze' });
  if (!bronze) {
    await Badge.create({
      name: 'bronze',
      displayName: 'Bronze',
      description: 'Default badge level',
      level: 0,
      isActive: true,
      icon: 'bronze',
      color: '#CD7F32',
    });
  }
}
