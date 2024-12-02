<template>
  <div class="sales-by-product-container">
    <div class="flex-container">
      <div class="table-container">
        <h3>Sales by Product</h3>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Date Added</th>
                <th>Price</th>
                <th>Total Sales</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in products" :key="product.productID">
                <td>{{ product.productName }}</td>
                <td>{{ formatDate(product.mostRecentSaleDate) }}</td>
                <td>${{ product.price.toFixed(2) }}</td>
                <td>${{ product.totalSales.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="bar-chart-container">
        <h3>Sales Histogram</h3>

        <div v-if="productSalesData.labels.length === 0">
          <p>No Data</p>
        </div>
        <BarChart v-else :data="productSalesData" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed, watch } from 'vue';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import axios from 'axios';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

interface Product {
  productID: number;
  productName: string;
  category: string;
  price: number;
  totalQuantity: number;
  totalSales: number;
  mostRecentSaleDate: string;
}

export default defineComponent({
  components: { BarChart: Bar },
  props: {
    period: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const products = ref<Product[]>([]);

    const fetchProducts = async (period: string) => {
      try {
        const response = await axios.get(`http://localhost:5000/products?period=${period}`);
        products.value = response.data.products;
      } catch (error) {
        console.error('Error fetching product data:', error);
      }
    };

    watch(() => props.period, (newPeriod) => {
      fetchProducts(newPeriod);
    });

    const productSalesData = computed(() => {
      const labels = products.value.map(product => product.productName);
      const data = products.value.map(product => product.totalQuantity);

      return {
        labels,
        datasets: [{
          label: 'Quantity Sold',
          data,
          backgroundColor: '#42A5F5',
        }],
      };
    });

    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    onMounted(() => {
      fetchProducts(props.period);
    });

    return {
      products,
      productSalesData,
      formatDate,
    };
  },
});
</script>

<style scoped>
.sales-by-product-container {
  padding: 20px;
  background-color: #f9f9f9;
  font-family: Arial, sans-serif;
}

.flex-container {
  display: flex;
  gap: 20px;
  justify-content: space-between;
  margin-top: 20px;
}

.table-container {
  flex: 0 0 25%;
  min-width: 250px;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-wrapper {
  max-height: 600px;
  overflow-y: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

table th,
table td {
  padding: 12px;
  text-align: left;
}

table th {
  background-color: #42A5F5;
  color: white;
  font-weight: bold;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  position: sticky;
  top: 0;
  z-index: 1;
}

table td {
  background-color: #f9f9f9;
  border-bottom: 1px solid #ddd;
}

table tr:nth-child(even) td {
  background-color: #f1f1f1;
}

table tr:hover td {
  background-color: #f1f1f1;
}

.bar-chart-container {
  flex: 1;
  min-width: 250px;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .flex-container {
    flex-direction: column;
  }

  .table-container,
  .bar-chart-container {
    flex: unset;
    width: 100%;
  }
}
</style>
