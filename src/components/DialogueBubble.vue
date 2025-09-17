<template>
  <div class="dialogue-bubble">
    <img v-if="characterImage" :src="characterImage" :alt="speaker" class="character-image" />
    <div class="dialogue-text">
      <h3 class="speaker-name">{{ speaker }}</h3>
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
  align-items: center;
  gap: 2rem;
  min-height: 120px;
}

.character-image {
  width: 80px;
  height: 80px;
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
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: space-between;
  flex: 1;
  font-size: 1.2rem;
  line-height: 1.5;
}
</style>
