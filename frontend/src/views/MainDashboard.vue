<template>
  <div class="dashboard-container">
    <header class="header">
      <h1>Sales Dashboard</h1>
    </header>

    <div class="flex-container">
      <div class="filter-total-sales-container">
        <div class="filter-container">
          <FilterProducts @update-period="fetchSalesData" />
        </div>
        <div class="total-sales-container">
          <TotalSales :salesData="salesData" />
        </div>
      </div>
    </div>

    <div class="flex-container">
      <div class="best-selling-container">
        <BestSellingProducts :period="period" />
      </div>
      <div class="sales-distribution-container">
        <SalesDistribution :period="period" />
      </div>
    </div>

    <div class="sales-by-product-container">
      <SalesByProduct :period="period" />
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, watch, onMounted } from 'vue';
import axios from 'axios';

import TotalSales from '@/components/TotalSales';
import BestSellingProducts from '@/components/BestSellingProducts';
import SalesDistribution from '@/components/SalesDistribution';
import SalesByProduct from '@/components/SalesByProduct';
import FilterProducts from '@/components/FilterProducts';

export default defineComponent({
  components: {
    TotalSales,
    BestSellingProducts,
    SalesDistribution,
    SalesByProduct,
    FilterProducts,
  },
  setup() {
    const salesData = ref(0);
    const period = ref('365');

    const fetchSalesData = async (newPeriod) => {
      console.log('Selected period:', newPeriod);
      period.value = newPeriod;
      try {
        const response = await axios.get(`http://localhost:5000/analytics/total_sales?period=${newPeriod}`);
        salesData.value = response.data.totalSales;
      } catch (error) {
        console.error('Error fetching sales data:', error);
        salesData.value = 0;
      }
    };

    onMounted(() => {
      fetchSalesData(period.value);
    });

    watch(period, (newPeriod) => {
      fetchSalesData(newPeriod);
    });

    return {
      salesData,
      period,
      fetchSalesData,
    };
  },
});
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  font-family: Arial, sans-serif;
  background-color: #f9f9f9;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  font-size: 36px;
  color: #333;
  margin: 0;
}

.flex-container {
  display: flex;
  gap: 20px;
  justify-content: space-between;
  margin-bottom: 30px;
}

.filter-total-sales-container {
  display: flex;
  gap: 20px;
  flex: 1;
}

.filter-container,
.total-sales-container,
.best-selling-container,
.sales-distribution-container {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex: 1;
  min-width: 250px;
}

.total-sales-container {
  display: flex;
}

.sales-by-product-container {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .flex-container {
    flex-direction: column;
  }

  .filter-total-sales-container {
    flex-direction: column;
    gap: 10px;
  }

  .filter-container,
  .total-sales-container,
  .best-selling-container,
  .sales-distribution-container {
    flex: unset;
    width: 100%;
  }
}
</style>
