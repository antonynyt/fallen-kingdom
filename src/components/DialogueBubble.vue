<template>
  <div class="dialogue-bubble">
    <div class="character-info">
      <img v-if="characterImage" :src="characterImage" :alt="speaker" class="character-image" />
      <h3 class="speaker-name">{{ speaker }}</h3>
    </div>
    <div class="dialogue-text">
      {{ text }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  speaker: String,
  text: String,
  characterImage: String
})
</script>

<style scoped>
.dialogue-bubble {
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 1.5rem 2rem;
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  min-height: 120px;
}

.character-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 80px;
}

.character-image {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ffd700;
}

.speaker-name {
  font-size: 0.9rem;
  color: #ffd700;
  text-align: center;
  margin: 0;
}

.dialogue-text {
  flex: 1;
  font-size: 1.1rem;
  line-height: 1.5;
  padding-top: 0.5rem;
}
</style>
