'use babel';

import osc from 'node-osc'

export default class Sc {

  constructor(data) {
    this.server = new osc.Server(3333, '0.0.0.0')
    this.server.on("message", function (msg, rinfo) {
      data.callback(msg)
    })
  }

  destroy() {
    this.server.kill()
  }

}
