<template>
  <div class="time-period-selector">
    <label for="time-period">Select Time Period:</label>
    <select v-model="selectedPeriod" id="time-period">
      <option value="7">Last 7 days</option>
      <option value="30">Last 1 month</option>
      <option value="180">Last 6 months</option>
      <option value="365">Last 12 months</option>
    </select>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
  setup(props, { emit }) {
    const selectedPeriod = ref<number>(365);

    const updatePeriod = () => {
      emit('update-period', selectedPeriod.value);
    };

    watch(selectedPeriod, updatePeriod);

    return {
      selectedPeriod,
    };
  },
});
</script>

<style scoped>
.time-period-selector {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  margin: 50px auto;
}

.time-period-selector label {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.time-period-selector select {
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 5px;
  width: 100%;
  background-color: #fff;
  transition: all 0.3s ease;
}

.time-period-selector select:hover,
.time-period-selector select:focus {
  border-color: #42A5F5;
  outline: none;
}

@media (max-width: 768px) {
  .time-period-selector {
    width: 90%;
    margin: 20px auto;
  }
}
</style>
