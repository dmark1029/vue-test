<template>
  <div>
    <h3>Best Selling Products</h3>

    <div v-if="chartData.labels.length === 0">
      <p>No Best Selling Products</p>
    </div>
    <BarChart v-else :data="chartData" />

  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed, watch } from 'vue';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import axios from 'axios';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

export default defineComponent({
  components: { BarChart: Bar },
  props: {
    period: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const trendingProducts = ref<{
      productID: number;
      productName: string;
      totalSales: number;
      totalQuantity: number;
    }[]>([]);

    const fetchTrendingProducts = async (period: string) => {
      try {
        const response = await axios.get(`http://localhost:5000/analytics/trending_products?period=${period}`);
        trendingProducts.value = response.data.trendingProducts; 
      } catch (error) {
        console.error('Error fetching trending products:', error);
      }
    };

    watch(() => props.period, (newPeriod) => {
      fetchTrendingProducts(newPeriod);
    });

    const chartData = computed(() => {
      const labels = trendingProducts.value.map((product) => product.productName);
      const data = trendingProducts.value.map((product) => product.totalQuantity);

      return {
        labels,
        datasets: [
          {
            label: 'Quantity Sold',
            data,
            backgroundColor: '#36A2EB',
          },
        ],
      };
    });

    onMounted(() => {
      fetchTrendingProducts(props.period);
    });

    return {
      chartData,
      trendingProducts,
    };
  },
});
</script>
