import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const createSVGImage = (width, height, text, bgColor, textColor = 'white') => {
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${bgColor}"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="20" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">${text}</text>
  </svg>`
}

// Create directories
const dirs = [
  'public/images/characters',
  'public/images/backgrounds'
]

dirs.forEach(dir => {
  mkdirSync(dir, { recursive: true })
})

// Character images (square format)
const characters = [
  { name: 'farmer', color: '#8B4513', label: 'Farmer John' },
  { name: 'merchant', color: '#DAA520', label: 'Merchant Elena' },
  { name: 'noble', color: '#800080', label: 'Lord Blackwood' },
  { name: 'priest', color: '#4B0082', label: 'Father Marcus' },
  { name: 'captain', color: '#B22222', label: 'Captain Steel' },
  { name: 'witch', color: '#2F4F4F', label: 'Morgana' },
  { name: 'orphan', color: '#696969', label: 'Little Tim' },
  { name: 'ambassador', color: '#4682B4', label: 'Ambassador' },
  { name: 'healer', color: '#228B22', label: 'Healer Anne' },
  { name: 'blacksmith', color: '#708090', label: 'Blacksmith' },
  { name: 'scholar', color: '#9932CC', label: 'Scholar Livia' },
  { name: 'spy', color: '#2F2F2F', label: 'The Crow' },
  { name: 'bard', color: '#FF6347', label: 'Bard Felix' },
  { name: 'ghost', color: '#778899', label: 'Old King' },
  { name: 'dragon', color: '#DC143C', label: 'Dragon Envoy' }
]

characters.forEach(char => {
  const svg = createSVGImage(200, 200, char.label, char.color)
  writeFileSync(`public/images/characters/${char.name}.svg`, svg)
})

// Background images (landscape format)
const backgrounds = [
  { name: 'throne-room', color: '#4A4A4A', label: 'Throne Room' },
  { name: 'farmland', color: '#9ACD32', label: 'Farmland' },
  { name: 'marketplace', color: '#DEB887', label: 'Marketplace' },
  { name: 'castle_hall', color: '#2F4F4F', label: 'Castle Hall' },
  { name: 'cathedral', color: '#483D8B', label: 'Cathedral' },
  { name: 'barracks', color: '#A0522D', label: 'Barracks' },
  { name: 'forest', color: '#228B22', label: 'Dark Forest' },
  { name: 'slums', color: '#696969', label: 'Slums' },
  { name: 'embassy', color: '#4682B4', label: 'Embassy' },
  { name: 'infirmary', color: '#F0F8FF', label: 'Infirmary' },
  { name: 'forge', color: '#FF4500', label: 'Forge' },
  { name: 'library', color: '#8B4513', label: 'Library' },
  { name: 'shadows', color: '#191970', label: 'Shadows' },
  { name: 'tavern', color: '#CD853F', label: 'Tavern' },
  { name: 'throne_room_night', color: '#2F2F2F', label: 'Night Throne' },
  { name: 'mountain', color: '#8B0000', label: 'Dragon Mountain' },
  { name: 'ending', color: '#FFD700', label: 'The End' }
]

backgrounds.forEach(bg => {
  const svg = createSVGImage(1920, 1080, bg.label, bg.color)
  writeFileSync(`public/images/backgrounds/${bg.name}.svg`, svg)
})

console.log('✅ All placeholder images generated successfully!')
console.log(`📁 Generated ${characters.length} character images`)
console.log(`📁 Generated ${backgrounds.length} background images`)
