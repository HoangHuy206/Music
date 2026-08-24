import { reactive } from 'vue';

export const globalPlayerState = reactive({
  currentSong: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  progressPercentage: 0,
  isFavorite: false,
});
