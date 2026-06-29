import * as badgeService from '../services/badge.service.js';

export async function createBadge(req, res, next) {
  try {
    const badge = await badgeService.createBadge(req.body);
    res.status(201).json({ success: true, data: { badge } });
  } catch (err) {
    next(err);
  }
}

export async function listBadges(req, res, next) {
  try {
    const activeOnly = req.query.activeOnly === 'true';
    const badges = await badgeService.listBadges({ activeOnly });
    res.json({ success: true, data: { badges } });
  } catch (err) {
    next(err);
  }
}

export async function getBadge(req, res, next) {
  try {
    const badge = await badgeService.getBadgeById(req.params.id);
    res.json({ success: true, data: { badge } });
  } catch (err) {
    next(err);
  }
}

export async function updateBadge(req, res, next) {
  try {
    const badge = await badgeService.updateBadge(req.params.id, req.body);
    res.json({ success: true, data: { badge } });
  } catch (err) {
    next(err);
  }
}

export async function deleteBadge(req, res, next) {
  try {
    const badge = await badgeService.deleteBadge(req.params.id);
    res.json({ success: true, data: { badge } });
  } catch (err) {
    next(err);
  }
}
