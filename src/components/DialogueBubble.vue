<template>
  <div class="dialogue-bubble">
    <div class="dialogue-text">
      <div class="speaker-header">
        <h3 class="speaker-name">{{ speaker }}</h3>
        <span v-if="summary" class="speaker-summary">SUMMARY: {{ summary }}</span>
      </div>
      <p>
        {{ text }}
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  speaker: String,
  text: String,
  characterImage: String,
  summary: String
})
</script>

<style scoped>
.dialogue-bubble {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 1.2rem 1.5rem;
  width: 100%;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.speaker-name {
  font-size: 2rem;
  color: #ffd700;
  margin: 0;
  font-weight: bold;
}

.speaker-header {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-bottom: 0.8rem;
}

.speaker-summary {
  font-size: 1.2rem;
  color: #ccc;
  font-style: italic;
  opacity: 0.9;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dialogue-text {
  font-size: 1.5rem;
  line-height: 1.4;
}
</style>
