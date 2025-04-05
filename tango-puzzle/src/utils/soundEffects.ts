// Map of sound effect names to their audio elements
const soundEffects: Record<string, HTMLAudioElement> = {};

// Load a sound effect
export function loadSound(name: string, path: string): void {
  soundEffects[name] = new Audio(path);
}

// Play a sound effect
export function playSound(name: string): void {
  if (soundEffects[name]) {
    // Reset the audio to the beginning to allow rapid replay
    soundEffects[name].currentTime = 0;
    soundEffects[name].play().catch(error => {
      // Handle any errors (often due to user interaction requirements)
      console.log(`Couldn't play sound ${name}:`, error);
    });
  } else {
    console.warn(`Sound effect "${name}" not loaded`);
  }
}

// Initialize common sound effects
export function initSoundEffects(): void {
  loadSound('complete', '/sounds/complete.mp3');
  // You can add more sounds here as needed
}