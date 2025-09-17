<template>
  <div class="intro-screen">
    <div class="intro-overlay">
      <div class="intro-content">
        <h1 class="game-title">The King's Trial</h1>
        <div class="intro-text">
          <p>You have just ascended to the throne after a turbulent succession.</p>
          <p>Your honor is questioned, your people are restless.</p>
          <p>In the coming days, subjects will approach with their complaints and demands.</p>
          <p>Your decisions will determine your fate - and that of the kingdom.</p>
          <p><strong>Rule wisely, for rebellion lurks in every poor choice.</strong></p>
        </div>
        <GameButton @click="$emit('start-game')" class="start-button">
          Begin Your Reign
        </GameButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import GameButton from './GameButton.vue'

defineEmits(['start-game'])
</script>

<style scoped>
.intro-screen {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.intro-overlay {
  background: rgba(0, 0, 0, 0.7);
  padding: 3rem;
  border-radius: 10px;
  max-width: 800px;
  text-align: center;
}

.game-title {
  font-size: 3rem;
  color: #ffd700;
  margin-bottom: 2rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.intro-text {
  color: white;
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.intro-text p {
  margin-bottom: 1rem;
}

.start-button {
  font-size: 1.5rem;
  padding: 1rem 2rem;
}
</style>
