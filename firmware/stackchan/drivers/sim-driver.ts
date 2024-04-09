import Timer from 'timer'
import type { Maybe, Rotation } from 'stackchan-util'

//import { fetch } from 'fetch'
import Headers from 'headers'
import {Request} from "http"

//const API_URL = 'http://192.168.3.6:8080'
//const API_URL = 'http://localhost:8080'
const API_URL = 'localhost'

//type SCServoDriverProps = {
//  panId: number
//  tiltId: number
//}

export class SimDriver {
  #appliedOriY: number
  #appliedOriP: number
  #headers: Headers
  //constructor(param: SCServoDriverProps) {
  constructor(param: unknown) {
    this.#appliedOriY = 0
    this.#appliedOriP = 0
    this.#headers = new Headers([
      ['Content-Type', 'application/json'],
    ])
  }

  async setTorque(torque: boolean): Promise<void> {
    //await Promise.all([this._pan.setTorque(torque), this._tilt.setTorque(torque)])
    trace(`set torque ${torque}\n`)
  }

  async applyRotation(ori: Rotation, time = 0.5): Promise<void> {
    trace(`applying yaw:${ori.y}, pitch:${ori.p}\n`)
    this.#appliedOriY = ori.y
    this.#appliedOriP = ori.p

    //const result = await this.#sendMessage(ori.y, ori.p);
    this.#sendMessage(ori.y, ori.p);
  }
  async getRotation(): Promise<Maybe<Rotation>> {
    const y = this.#appliedOriY
    const p = this.#appliedOriP
    return {
      success: true,
      value: {
        y,
        p,
        r: 0.0,
      },
    }
  }
  //async #sendMessage(yaw, pitch): Promise<string> {
  #sendMessage(yaw, pitch) {
    const body = {
      yaw: yaw,
      pitch: pitch,
    }
    /*
    return fetch(API_URL, { method: 'POST', headers: this.#headers, body: JSON.stringify(body) })
      .then((response) => {
        if (response.status != 200) {
          throw new Error(`response error:${response.status}`)
        }
        trace(`response.status: ${response.status}\n`)
        //return response.arrayBuffer()
        return response.text()
        //return response.json()
      })
      .then((text) => {
        trace(`text: ${text}\n`)
        //const text = String.fromArrayBuffer(body)
        //trace(`body(text): ${text}\n`)
        return text 
        //return body 
      })
    */


    let request = new Request({	host: API_URL,
      path: "/",
      port: 8080,
      method: "POST",
      body: JSON.stringify(body),
      response: String
    });

    request.callback = function(message, value)
    {
      if (Request.responseComplete === message) {
        trace(`value: ${value}\n`)
      }
    }
  }
}
