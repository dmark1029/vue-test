<template>
  <div>
    <SalesBarChart :products="products" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted } from 'vue';
import axios from 'axios';
import SalesBarChart from '@/components/SalesBarChart.vue';

interface Product {
  productID: number;
  productName: string;
  totalQuantity: number;
}

export default defineComponent({
  components: { SalesBarChart },
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

    onMounted(() => {
      fetchProducts(props.period);
    });

    watch(() => props.period, (newPeriod) => {
      fetchProducts(newPeriod);
    });

    return {
      products,
    };
  },
});
</script>
