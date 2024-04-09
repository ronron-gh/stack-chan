declare const global: any

import config from 'mc/config'
import Modules from 'modules'
import { Robot, Driver, TTS, Renderer } from 'robot'
import { RS30XDriver } from 'rs30x-driver'
import { SCServoDriver } from 'scservo-driver'
import { PWMServoDriver } from 'sg90-driver'
import { DynamixelDriver } from 'dynamixel-driver'
import { NoneDriver } from 'none-driver'
import { SimDriver } from 'sim-driver'
import { TTS as LocalTTS } from 'tts-local'
import { TTS as RemoteTTS } from 'tts-remote'
import { TTS as VoiceVoxTTS } from 'tts-voicevox'
import { TTS as VoiceVoxWebTTS } from 'tts-voicevox-web'
import { TTS as ElevenLabsTTS } from 'tts-elevenlabs'
import { TTS as NoneTTS } from 'tts-none'
import defaultMod, { StackchanMod } from 'default-mods/mod'
import { Renderer as SimpleRenderer } from 'simple-face'
import { Renderer as DogFaceRenderer } from 'dog-face'
import { NetworkService } from 'network-service'
import Touch from 'touch'
import { loadPreferences, asyncWait } from 'stackchan-util'

function createRobot() {
  const drivers = new Map<string, new (param: unknown) => Driver>([
    ['scservo', SCServoDriver],
    ['dynamixel', DynamixelDriver],
    ['pwm', PWMServoDriver],
    ['rs30x', RS30XDriver],
    ['none', NoneDriver],
    ['sim', SimDriver],
  ])
  const ttsEngines = new Map<string, new (param: unknown) => TTS>([
    ['local', LocalTTS],
    ['remote', RemoteTTS],
    ['voicevox', VoiceVoxTTS],
    ['voicevox-web', VoiceVoxWebTTS],
    ['elevenlabs', ElevenLabsTTS],
    ['none', NoneTTS],
  ])
  const renderers = new Map<string, new (param: unknown) => Renderer>([
    ['dog', DogFaceRenderer],
    ['simple', SimpleRenderer],
  ])

  // TODO: select driver/tts/renderer by mod

  const errors: string[] = []

  // Servo Driver
  const driverPrefs = loadPreferences('driver')
  const driverKey = driverPrefs.type ?? 'scservo'
  const Driver = drivers.get(driverKey)

  // TTS
  const ttsPrefs = loadPreferences('tts')
  const ttsKey = ttsPrefs.type ?? 'local'
  const TTS = ttsEngines.get(ttsKey)

  // Renderer
  const rendererPrefs = loadPreferences('renderer')
  const rendererKey = rendererPrefs.type ?? 'simple'
  const Renderer = renderers.get(rendererKey)

  if (!Driver || !TTS || !Renderer) {
    for (const [key, klass] of [
      [driverKey, Driver],
      [ttsKey, TTS],
      [rendererKey, Renderer],
    ]) {
      if (klass == null) {
        errors.push(`type "${key}" does not exist`)
      }
    }
    throw new Error(errors.join('\n'))
  }

  const driver = new Driver(driverPrefs)
  const renderer = new Renderer(rendererPrefs)
  const tts = new TTS(ttsPrefs)
  const button = globalThis.button
  const touch = !global.screen.touch && config.Touch ? new Touch() : undefined
  return new Robot({
    driver,
    renderer,
    tts,
    button,
    touch,
  })
}

async function checkAndConnectWiFi() {
  const wifiPrefs = loadPreferences('wifi')
  if (wifiPrefs.ssid == null || wifiPrefs.password == null) {
    return
  }
  return new Promise((resolve, reject) => {
    globalThis.network = new NetworkService({
      ssid: wifiPrefs.ssid,
      password: wifiPrefs.password,
    })
    globalThis.network.connect(resolve, reject)
  })
}

async function main() {
  if (globalThis.Host.Button && !globalThis.button) {
    // wrapper button class for simulator
    class SimButton {
      #button
      onChanged
      constructor(button) {
        const self = this
        this.#button = new button({
          onPush() {
            self.onChanged?.()
          },
        })
      }
      read() {
        return this.#button.read() ?? 1
      }
    }
    globalThis.button = {
      a: new SimButton(globalThis.Host.Button.a),
      b: new SimButton(globalThis.Host.Button.b),
      c: new SimButton(globalThis.Host.Button.c),
    }
  }
  await asyncWait(100)
  await checkAndConnectWiFi().catch((msg) => {
    trace(`WiFi connection failed: ${msg}`)
  })
  let { onRobotCreated, onLaunch } = defaultMod
  if (Modules.has('mod')) {
    const mod = Modules.importNow('mod') as StackchanMod
    onRobotCreated = mod.onRobotCreated ?? onRobotCreated
    onLaunch = mod.onLaunch ?? onLaunch
  }
  const shouldRobotCreate = await onLaunch?.()
  if (shouldRobotCreate !== false) {
    const robot = createRobot()
    await onRobotCreated?.(robot, globalThis.device)
  }
}

main()
