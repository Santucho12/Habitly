import { Howl } from 'howler';

export const sounds = {
  success: new Howl({ src: ['/assets/sounds/success.mp3'], volume: 0.3 }),
  error: new Howl({ src: ['/assets/sounds/error.mp3'], volume: 0.3 }),
  achievement: new Howl({ src: ['/assets/sounds/achievement.mp3'], volume: 0.4 }),
};

export function playSound(type) {
  if (sounds[type]) {
    sounds[type].play();
  }
}
