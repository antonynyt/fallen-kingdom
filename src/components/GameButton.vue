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
  background: linear-gradient(45deg, #ffd700, #ffed4e);
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

.game-button:hover:not(:disabled) {
  background: linear-gradient(45deg, #ffed4e, #ffd700);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
}

.game-button:active:not(:disabled) {
  transform: translateY(0);
}

.game-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
