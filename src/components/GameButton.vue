<template>
  <button 
    class="game-button"
    @click="$emit('click')"
    :disabled="disabled"
  >
    <slot></slot>
  </button>
</template>

<script setup>
defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])
</script>

<style scoped>
.game-button {
  background: #D09C57;
  border: none;
  color: #333;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.game-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
