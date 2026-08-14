export function playAudioAlert(type: 'new' | 'urgent') {
  if (typeof window === 'undefined') return;

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

  const playTone = (frequency: number, type: OscillatorType, duration: number, startTime: number) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + startTime);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime + startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + startTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(audioContext.currentTime + startTime);
    oscillator.stop(audioContext.currentTime + startTime + duration);
  };

  if (type === 'new') {
    // Double high pitched ping for new orders
    playTone(880, 'sine', 0.2, 0); // A5
    playTone(1108.73, 'sine', 0.3, 0.2); // C#6
  } else if (type === 'urgent') {
    // Warning alarm
    playTone(440, 'square', 0.3, 0);
    playTone(330, 'square', 0.3, 0.4);
    playTone(440, 'square', 0.3, 0.8);
  }
}
