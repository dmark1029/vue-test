import express from 'express';
import { getTotalSales, getTrendingProducts, getCategorySales, getProductsSales } from '../controllers/analyticsController';

const router = express.Router();

router.get('/analytics/total_sales', async (req, res) => {
  try {
    await getTotalSales(req, res);
  } catch (error) {
    console.error('Error handling /analytics/total_sales route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/analytics/trending_products', async (req, res) => {
  try {
    await getTrendingProducts(req, res);
  } catch (error) {
    console.error('Error handling /analytics/total_sales route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/analytics/category_sales', async (req, res) => {
  try {
    await getCategorySales(req, res);
  } catch (error) {
    console.error('Error handling /analytics/total_sales route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.get('/products', async (req, res) => {
  try {
    await getProductsSales(req, res);
  } catch (error) {
    console.error('Error handling /analytics/total_sales route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
