import { Schema, model, Document } from 'mongoose';

interface IProduct extends Document {
  productID: number;
  productName: string;
  category: string;
  price: number;
}

const productSchema = new Schema<IProduct>({
  productID: { type: Number, required: true },
  productName: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
});

const Product = model<IProduct>('Product', productSchema);
export default Product;
