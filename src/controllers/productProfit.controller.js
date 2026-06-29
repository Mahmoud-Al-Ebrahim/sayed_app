import * as productProfitService from '../services/productProfit.service.js';

export async function setProductProfit(req, res, next) {
  try {
    const profit = await productProfitService.setProductProfit({
      providerId: req.body.providerId,
      productId: req.body.productId,
      badgeId: req.body.badgeId,
      sellPriceUSD: req.body.sellPriceUSD,
      sellPriceSYP: req.body.sellPriceSYP,
    });
    res.status(201).json({ success: true, data: { profit } });
  } catch (err) {
    next(err);
  }
}

export async function listProductProfits(req, res, next) {
  try {
    const profits = await productProfitService.listProductProfits({
      providerId: req.query.providerId,
      badgeId: req.query.badgeId,
      productId: req.query.productId,
    });
    res.json({ success: true, data: { profits } });
  } catch (err) {
    next(err);
  }
}

export async function deleteProductProfit(req, res, next) {
  try {
    const profit = await productProfitService.deleteProductProfit({
      providerId: req.body.providerId,
      productId: req.body.productId,
      badgeId: req.body.badgeId,
    });
    res.json({ success: true, data: { profit } });
  } catch (err) {
    next(err);
  }
}

export async function batchSetProductProfits(req, res, next) {
  try {
    const results = await productProfitService.batchSetProductProfits(req.body.profits);
    res.json({ success: true, data: { results } });
  } catch (err) {
    next(err);
  }
}
