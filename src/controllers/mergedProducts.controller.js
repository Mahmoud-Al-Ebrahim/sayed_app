import { getMergedProducts, clearProductsCache } from '../services/mergedProducts.service.js';
import { triggerManualStatusCheck } from '../services/orderStatusCheck.service.js';

export async function listMergedProducts(req, res, next) {
  try {
    const includeProfits = req.query.includeProfits === 'true';
    const products = await getMergedProducts({ includeProfits });
    res.json({ success: true, data: { products } });
  } catch (err) {
    next(err);
  }
}

export async function refreshProductsCache(req, res, next) {
  try {
    clearProductsCache();
    const includeProfits = req.query.includeProfits === 'true';
    const products = await getMergedProducts({ includeProfits });
    res.json({ 
      success: true, 
      data: { products },
      message: 'Products cache refreshed successfully' 
    });
  } catch (err) {
    next(err);
  }
}

export async function triggerOrderStatusCheck(req, res, next) {
  try {
    await triggerManualStatusCheck();
    res.json({ 
      success: true, 
      message: 'Order status check triggered successfully' 
    });
  } catch (err) {
    next(err);
  }
}
