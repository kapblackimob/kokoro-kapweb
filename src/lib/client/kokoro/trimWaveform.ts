/**
 * Trims a Float32Array waveform by removing some samples from the beginning and end.
 *
 * The trimming is done by calculating the average amplitude of the waveform and
 * finding the start and end of the audio based on a threshold.
 */
export function trimWaveform(waveform: Float32Array): Float32Array {
  // Calculate the average amplitude of the waveform.
  let sum = 0;
  for (let i = 0; i < waveform.length; i++) {
    sum += Math.abs(waveform[i]);
  }
  const avgAmplitude = sum / waveform.length;

  // Calculate the threshold for silence.
  const threshold = avgAmplitude * 0.05;

  // Find the start of the audio.
  let start = 0;
  for (let i = 0; i < waveform.length; i++) {
    if (Math.abs(waveform[i]) > threshold) {
      start = i;
      break;
    }
  }

  // Find the end of the audio.
  let end = waveform.length;
  for (let i = waveform.length - 1; i >= 0; i--) {
    if (Math.abs(waveform[i]) > threshold) {
      end = i;
      break;
    }
  }

  return waveform.slice(start, end);
}
