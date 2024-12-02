<template>
  <div class="total-sales-container-body">
    <h2>Total Sales</h2>
    <p class="sales-amount">${{ totalSales }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    salesData: {
      type: Number,
      required: true,
    },
  },
  computed: {
    totalSales(): string {
      return this.salesData.toFixed(2);
    },
  },
});
</script>

<style scoped>
.total-sales-container-body {
  background-color: #fff;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  max-width: 300px;
  margin: auto;
}

.total-sales-container-body h2 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 10px;
}

.sales-amount {
  font-size: 2rem;
  color: #4caf50;
  font-weight: bold;
  margin: 0;
}
</style>
