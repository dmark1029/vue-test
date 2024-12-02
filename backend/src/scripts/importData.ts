import mongoose from 'mongoose';
import fs from 'fs';
import csvParser from 'csv-parser';
import Product from '../models/Product';
import Sale from '../models/Sales';
import dotenv from 'dotenv';
import unzipper from 'unzipper';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';

export const importData = async (zipFilePath: string) => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const extractedFiles = await unzipZipFile(zipFilePath);

    const productsData = await readCSV(extractedFiles.products);
    const salesData = await readCSV(extractedFiles.sales);
    
    const products = productsData.map((item) => ({
      productID: parseInt(item.ProductID),
      productName: item.ProductName,
      category: item.Category,
      price: parseFloat(item.Price),
    }));

    const sales = salesData.map((item) => ({
      saleID: parseInt(item.SaleID),
      productID: parseInt(item.ProductID),
      quantity: parseInt(item.Quantity),
      date: new Date(item.Date),
      totalAmount: parseFloat(item.TotalAmount),
    }));

    await insertOrUpdateProducts(products);

    await insertOrUpdateSales(sales);

    console.log('Data import completed!');
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
  }
};

const readCSV = (filePath: string) => {
  return new Promise<any[]>((resolve, reject) => {
    const data: any[] = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => data.push(row))
      .on('end', () => resolve(data))
      .on('error', (err) => reject(err));
  });
};

const unzipZipFile = (zipFilePath: string) => {
  return new Promise<{ products: string; sales: string }>((resolve, reject) => {
    const extractedFiles: { products: string; sales: string } = {
      products: '',
      sales: '',
    };

    const tempDir = './temp';
    fs.mkdirSync(tempDir, { recursive: true });

    fs.createReadStream(zipFilePath)
      .pipe(unzipper.Extract({ path: tempDir }))
      .on('close', () => {
        extractedFiles.products = `${tempDir}/products.csv`;
        extractedFiles.sales = `${tempDir}/sales.csv`;

        resolve(extractedFiles);
      })
      .on('error', (err) => reject(err));
  });
};
const insertOrUpdateProducts = async (products: any[]) => {
  for (const product of products) {
    try {
      const existingProduct = await Product.findOne({ productID: product.productID });

      if (existingProduct) {
        let updated = false;

        if (existingProduct.productName !== product.productName) {
          existingProduct.productName = product.productName;
          updated = true;
        }
        if (existingProduct.category !== product.category) {
          existingProduct.category = product.category;
          updated = true;
        }
        if (parseFloat(existingProduct.price.toFixed(2)) !== parseFloat(product.price.toFixed(2))) {
          existingProduct.price = product.price;
          updated = true;
        }

        if (updated) {
          await existingProduct.save();
          console.log(`Product updated: ${product.productName}`);
        } else {
        }
      } else {
        await Product.create(product);
        console.log(`Product inserted: ${product.productName}`);
      }
    } catch (error) {
      console.error(`Error processing product ${product.productName}:`, error);
    }
  }
};

const insertOrUpdateSales = async (sales: any[]) => {
  for (const sale of sales) {
    try {
      const existingSale = await Sale.findOne({ saleID: sale.saleID });

      if (existingSale) {
        let updated = false;

        if (existingSale.quantity !== sale.quantity) {
          existingSale.quantity = sale.quantity;
          updated = true;
        }
        if (parseFloat(existingSale.totalAmount.toFixed(2)) !== parseFloat(sale.totalAmount.toFixed(2))) {
          existingSale.totalAmount = sale.totalAmount;
          updated = true;
        }
        if (existingSale.date.getTime() !== sale.date.getTime()) {
          existingSale.date = sale.date;
          updated = true;
        }
        if (existingSale.productID !== sale.productID) {
          existingSale.productID = sale.productID;
          updated = true;
        }

        if (updated) {
          await existingSale.save();
        } else {
        }
      } else {
        await Sale.create(sale);
        console.log(`Sale inserted: ${sale.saleID}`);
      }
    } catch (error) {
      console.error(`Error processing sale ${sale.saleID}:`, error);
    }
  }
};
