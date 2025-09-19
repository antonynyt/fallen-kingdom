<template>
  <div class="intro-screen">
    <div>


      <div class="intro-overlay">
        <div class="intro-content">
          <div class="content">
            <div class="story-section">
              <h1 class="game-title">Heavy is the crown</h1>
              <p>You have just ascended to the throne after a turbulent succession.
                Your honor is questioned.
                In the coming days, subjects will approach with their complaints and demands.
                Your decisions will determine your fate and that of the kingdom.</p>
              <p><strong>Rule wisely, for rebellion lurks in every poor choice.</strong></p>
            </div>
            <div class="character-section">
              <div class="character-info">
                <img src="/images/characters/king.png" alt="" class="king-image" />
                <h2 class="name">King Braby</h2>
                <p class="age">Age: 67</p>
                <p class="crimes">Loves Gambling, taxes and himself.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <GameButton @click="$emit('start-game')" class="start-button">
        <span v-if="isPreloading">Preparing first character...</span>
        <span v-else-if="preloadComplete">Start</span>
        <span v-else>Start</span>
      </GameButton>
    </div>
  </div>
</template>

<script setup>
import GameButton from './GameButton.vue'

defineProps({
  isPreloading: {
    type: Boolean,
    default: false
  },
  preloadComplete: {
    type: Boolean,
    default: false
  }
})

defineEmits(['start-game'])
</script>

<style scoped>
.intro-screen {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7e5e33;
}

.intro-overlay {
  background: #FFDEA9;
  padding: 3rem;
  border-radius: 10px;
  max-width: 1000px;
  text-align: left;
}

.intro-content {
  position: relative;
}

.game-title {
  font-size: 4rem;
  text-align: left;
  margin-bottom: 3rem;
  line-height: 1;
}

.content {
  display: flex;
  gap: 3rem;
  align-items: flex-start;
}

.story-section {
  flex: 2;
  color: #7e5e33;
  line-height: 1.6;
}

.story-section p {
  text-align: justify;
  margin-bottom: 1rem;
}

.character-section {
  flex: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  border-left: 5px solid #7e5e33;
  padding-left: 2em;
}

.king-image {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 10px;
}

.character-info {
  background: rgba(255, 255, 255, 0.3);
  padding: 1.5rem;
  border-radius: 10px;
  width: 100%;
}

.character-info p {
  color: #7e5e33;
}

.age {
  font-weight: bold;
}

.birth-year {
  font-weight: bold;
}

.crimes {
  font-style: italic;
}

.start-button {
  font-family: "Jaini", system-ui;
  font-size: 3rem;
  color: #7e5e33;
  padding: 1rem 5rem;
  margin-top: 2rem;
  display: block;
  margin-left: auto;
  margin-right: auto;
  background: #FFDEA9;
}

h2 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}
</style>
