let audioContext

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (audioContext.state === 'suspended') audioContext.resume()
  return audioContext
}

const tone = (frequency, duration, type = 'sine', volume = 0.06, endFrequency = frequency) => {
  const context = getAudioContext()
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  const now = context.currentTime
  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, now)
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), now + duration)
  gain.gain.setValueAtTime(volume, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration)
  oscillator.connect(gain).connect(context.destination)
  oscillator.start(now)
  oscillator.stop(now + duration)
}

export const playClick = () => tone(480, 0.07, 'sine', 0.035, 360)
export const playFlagPlace = () => tone(720, 0.1, 'triangle', 0.055, 980)
export const playFlagRemove = () => tone(360, 0.1, 'triangle', 0.045, 240)

export const playBomb = () => {
  const context = getAudioContext()
  const now = context.currentTime
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = 'sawtooth'
  oscillator.frequency.setValueAtTime(130, now)
  oscillator.frequency.exponentialRampToValueAtTime(38, now + 0.6)
  gain.gain.setValueAtTime(0.12, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6)
  oscillator.connect(gain).connect(context.destination)
  oscillator.start(now)
  oscillator.stop(now + 0.6)

  const buffer = context.createBuffer(1, context.sampleRate * 0.18, context.sampleRate)
  const data = buffer.getChannelData(0)
  for (let index = 0; index < data.length; index += 1) data[index] = Math.random() * 2 - 1
  const noise = context.createBufferSource()
  const noiseGain = context.createGain()
  noise.buffer = buffer
  noiseGain.gain.setValueAtTime(0.16, now)
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18)
  noise.connect(noiseGain).connect(context.destination)
  noise.start(now)
}

export const playWin = () => {
  ;[523, 659, 784, 1047].forEach((frequency, index) => {
    window.setTimeout(() => tone(frequency, 0.18, 'triangle', 0.055, frequency * 1.02), index * 90)
  })
}
