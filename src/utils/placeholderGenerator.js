// Script to generate placeholder images with Canvas API
// This will create colored rectangles as placeholder images

const createPlaceholderImage = (width, height, color, text) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  
  // Text
  ctx.fillStyle = 'white';
  ctx.font = `${Math.min(width, height) / 10}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);
  
  return canvas.toDataURL();
};

// Generate placeholder images
const placeholders = {
  // Characters
  'farmer.jpg': createPlaceholderImage(200, 200, '#8B4513', 'Farmer'),
  'merchant.jpg': createPlaceholderImage(200, 200, '#FFD700', 'Merchant'),
  'noble.jpg': createPlaceholderImage(200, 200, '#800080', 'Noble'),
  'priest.jpg': createPlaceholderImage(200, 200, '#FFFFFF', 'Priest'),
  'captain.jpg': createPlaceholderImage(200, 200, '#FF0000', 'Captain'),
  'witch.jpg': createPlaceholderImage(200, 200, '#4B0082', 'Witch'),
  'orphan.jpg': createPlaceholderImage(200, 200, '#8B4513', 'Orphan'),
  'ambassador.jpg': createPlaceholderImage(200, 200, '#0000FF', 'Ambassador'),
  'healer.jpg': createPlaceholderImage(200, 200, '#00FF00', 'Healer'),
  'blacksmith.jpg': createPlaceholderImage(200, 200, '#696969', 'Smith'),
  'scholar.jpg': createPlaceholderImage(200, 200, '#DDA0DD', 'Scholar'),
  'spy.jpg': createPlaceholderImage(200, 200, '#000000', 'Spy'),
  'bard.jpg': createPlaceholderImage(200, 200, '#FFA500', 'Bard'),
  'ghost.jpg': createPlaceholderImage(200, 200, '#E6E6FA', 'Ghost'),
  'dragon.jpg': createPlaceholderImage(200, 200, '#FF4500', 'Dragon'),
  
  // Backgrounds
  'throne-room.jpg': createPlaceholderImage(1920, 1080, '#8B0000', 'Throne Room'),
  'farmland.jpg': createPlaceholderImage(1920, 1080, '#228B22', 'Farmland'),
  'marketplace.jpg': createPlaceholderImage(1920, 1080, '#DAA520', 'Marketplace'),
  'castle_hall.jpg': createPlaceholderImage(1920, 1080, '#708090', 'Castle Hall'),
  'cathedral.jpg': createPlaceholderImage(1920, 1080, '#F5F5DC', 'Cathedral'),
  'barracks.jpg': createPlaceholderImage(1920, 1080, '#8B4513', 'Barracks'),
  'forest.jpg': createPlaceholderImage(1920, 1080, '#006400', 'Forest'),
  'slums.jpg': createPlaceholderImage(1920, 1080, '#696969', 'Slums'),
  'embassy.jpg': createPlaceholderImage(1920, 1080, '#4169E1', 'Embassy'),
  'infirmary.jpg': createPlaceholderImage(1920, 1080, '#98FB98', 'Infirmary'),
  'forge.jpg': createPlaceholderImage(1920, 1080, '#FF6347', 'Forge'),
  'library.jpg': createPlaceholderImage(1920, 1080, '#DDA0DD', 'Library'),
  'shadows.jpg': createPlaceholderImage(1920, 1080, '#2F4F4F', 'Shadows'),
  'tavern.jpg': createPlaceholderImage(1920, 1080, '#CD853F', 'Tavern'),
  'throne_room_night.jpg': createPlaceholderImage(1920, 1080, '#191970', 'Night'),
  'mountain.jpg': createPlaceholderImage(1920, 1080, '#A0522D', 'Mountain'),
  'ending.jpg': createPlaceholderImage(1920, 1080, '#4B0082', 'The End')
};

// This script would be run in the browser to generate the images
// For now, we'll create a simple HTML file that can generate these

export { placeholders };
