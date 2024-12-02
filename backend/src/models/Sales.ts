import { Schema, model, Document } from 'mongoose';

interface ISale extends Document {
  saleID: number;
  productID: number;
  quantity: number;
  date: Date;
  totalAmount: number;
}

const saleSchema = new Schema<ISale>({
  saleID: { type: Number, required: true },
  productID: { type: Number, required: true },
  quantity: { type: Number, required: true },
  date: { type: Date, required: true },
  totalAmount: { type: Number, required: true },
});

const Sale = model<ISale>('Sale', saleSchema);
export default Sale;
