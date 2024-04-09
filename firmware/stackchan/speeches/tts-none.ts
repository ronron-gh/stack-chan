
export type TTSProperty =
    {
      onPlayed: (number) => void
      onDone: () => void
      host: string
      port: number
      sampleRate?: number
    }

export class TTS {
  onPlayed: (number) => void
  onDone: () => void
  constructor(props: TTSProperty) {
    // do nothing
  }
  async stream(key: string): Promise<void> {
    trace(`speech: ${key}\n`)
  }
}
