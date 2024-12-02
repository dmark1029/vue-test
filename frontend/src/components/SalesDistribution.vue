<template>
  <div>
    <h3>Sales Distribution by Category</h3>
    <div v-if="chartData.labels.length === 0">
      <p>No sales data</p>
    </div>
    <PieChart v-else :data="chartData" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed, watch } from 'vue';
import { Pie } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale } from 'chart.js';
import axios from 'axios';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

export default defineComponent({
  components: { PieChart: Pie },
  props: {
    period: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const categorySales = ref<Array<{
      category: string;
      totalQuantity: number;
      totalSales: number;
      percentage: number;
    }>>([]);

    const fetchCategorySales = async (period: string) => {
      try {
        const response = await axios.get(`http://localhost:5000/analytics/category_sales?period=${period}`);
        categorySales.value = response.data.categorySales;
      } catch (error) {
        console.error('Error fetching category sales:', error);
      }
    };

    watch(() => props.period, (newPeriod) => {
      fetchCategorySales(newPeriod);
    });

    const chartData = computed(() => {
      const labels = categorySales.value.map(item => item.category);
      const data = categorySales.value.map(item => item.percentage);

      return {
        labels,
        datasets: [{
          data,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#FF9F40'],
        }],
      };
    });

    onMounted(() => {
      fetchCategorySales(props.period);
    });

    return {
      chartData,
    };
  },
});
</script>
