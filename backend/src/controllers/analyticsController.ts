import { Request, Response } from 'express';
import Sale from '../models/Sales';
import Product from '../models/Product';

interface CategorySale {
  totalQuantity: number;
  totalSales: number;
  products: {
    productID: number;
    productName: string;
    quantitySold: number;
    totalSales: number;
  }[];
}

const getStartDate = (period: string): Date => {
  const endDate = new Date();
  let startDate: Date;

  switch (period) {
    case '7':
      startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '30':
      startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '180':
      startDate = new Date();
      startDate.setDate(endDate.getDate() - 180);
      break;
    case '365':
      startDate = new Date();
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    default:
      throw new Error('Invalid period specified');
  }

  startDate.setHours(0, 0, 0, 0);
  return startDate;
};

export const getTotalSales = async (req: Request, res: Response) => {
  try {
    const { period } = req.query;
    console.log('period:', period);

    if (!period) {
      return res.status(400).json({ error: 'Period is required' });
    }

    const startDate = getStartDate(period as string);
    const endDate = new Date();

    const sales = await Sale.find({
      date: { $gte: startDate, $lte: endDate },
    });

    const totalSales = sales.length;

    res.json({ totalSales });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};

export const getCategorySales = async (req: Request, res: Response) => {
  try {
    const { period } = req.query;
    if (!period) {
      return res.status(400).json({ error: 'Period is required' });
    }

    const startDate = getStartDate(period as string);
    const endDate = new Date();

    const aggregatedSales = await Sale.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$productID",
          totalQuantity: { $sum: "$quantity" },
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ]);

    const categorySales: Record<string, CategorySale> = {};

    for (const sale of aggregatedSales) {
      const product = await Product.findOne({ productID: sale._id });

      if (product) {
        const category = product.category;
        const totalSales = sale.totalAmount;

        if (!categorySales[category]) {
          categorySales[category] = {
            totalQuantity: 0,
            totalSales: 0,
            products: [],
          };
        }

        categorySales[category].totalQuantity += sale.totalQuantity;
        categorySales[category].totalSales += totalSales;
        categorySales[category].products.push({
          productID: sale._id,
          productName: product.productName,
          quantitySold: sale.totalQuantity,
          totalSales,
        });
      }
    }

    const totalSalesAmount = Object.values(categorySales).reduce(
      (total, category) => total + category.totalSales,
      0
    );

    const categoryBreakdown = Object.keys(categorySales).map((category) => {
      const categoryData = categorySales[category];
      const percentage = (categoryData.totalSales / totalSalesAmount) * 100;

      return {
        category,
        totalQuantity: categoryData.totalQuantity,
        totalSales: categoryData.totalSales,
        percentage,
      };
    });

    res.json({ categorySales: categoryBreakdown });
  } catch (error) {
    console.error('Error fetching category sales:', error);
    res.status(500).json({ error: 'An error occurred while fetching category sales data.' });
  }
};

export const getTrendingProducts = async (req: Request, res: Response) => {
  try {
    const { period } = req.query;
    if (!period) {
      return res.status(400).json({ error: 'Period is required' });
    }

    const startDate = getStartDate(period as string);
    const endDate = new Date();

    const aggregatedSales = await Sale.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$productID",
          totalSales: { $sum: "$totalAmount" },
          totalQuantity: { $sum: "$quantity" },
        },
      },
      {
        $sort: { totalQuantity: -1 },
      },
      {
        $limit: 3,
      },
    ]);

    const trendingProducts = await Promise.all(
      aggregatedSales.map(async (sale) => {
        const product = await Product.findOne({ productID: sale._id });

        return {
          productID: sale._id,
          productName: product?.productName || 'Unknown Product',
          totalSales: sale.totalSales,
          totalQuantity: sale.totalQuantity,
        };
      })
    );

    res.json({ trendingProducts });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};

export const getProductsSales = async (req: Request, res: Response) => {
  try {
    const { period } = req.query;
    if (!period) {
      return res.status(400).json({ error: 'Period is required' });
    }

    const startDate = getStartDate(period as string);
    const endDate = new Date();

    const aggregatedSales = await Sale.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$productID",
          totalQuantity: { $sum: "$quantity" },
          mostRecentSaleDate: { $max: "$date" },
        },
      },
    ]);

    const productsWithSales = await Promise.all(
      aggregatedSales.map(async (sale) => {
        const product = await Product.findOne({ productID: sale._id });
        const totalSales = product ? sale.totalQuantity * product.price : 0;

        const formattedDate = sale.mostRecentSaleDate ? sale.mostRecentSaleDate.toISOString() : 'Unknown Date';

        return {
          productID: sale._id,
          productName: product?.productName || 'Unknown Product',
          category: product?.category || 'Unknown Category',
          price: product?.price || 0,
          totalQuantity: sale.totalQuantity,
          totalSales: totalSales,
          mostRecentSaleDate: formattedDate,
        };
      })
    );

    res.json({ products: productsWithSales });
  } catch (error) {
    console.error('Error fetching products with sales:', error);
    res.status(500).json({ error: 'Failed to fetch products with sales' });
  }
};
