<template>
  <div class="intro-screen">
    <div class="intro-overlay">
      <div class="intro-content">
        <h1 class="game-title">King simulator</h1>
        <div class="intro-text">
          <p>You have just ascended to the throne after a turbulent succession.
          Your honor is questioned, your people are restless.
          In the coming days, subjects will approach with their complaints and demands.
          Your decisions will determine your fate and that of the kingdom.</p>
          <p><strong>Rule wisely, for rebellion lurks in every poor choice.</strong></p>
        </div>
        <GameButton @click="$emit('start-game')" class="start-button">
          Begin
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
  font-size: 4rem;
  color: #ffd700;
  margin-bottom: 2rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.intro-text {
  color: white;
  font-size: 1.5rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.intro-text p {
  margin-bottom: 1em;
}

.start-button {
  font-size: 1.8rem;
  padding: 1rem 2rem;
  margin-top: 2rem;
}
</style>
