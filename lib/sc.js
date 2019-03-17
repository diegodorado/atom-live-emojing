'use babel';

import osc from 'node-osc'

export default class Sc {

  constructor(data) {
    this.callback = data.callback
    this.initSc();
  }

  destroy() {
  }

  initSc() {
    //quick and dirty
    var that = this

    var oscServer = new osc.Server(3333, '0.0.0.0');
    oscServer.on("message", function (msg, rinfo) {
      that.callback(msg)
    });

    this.show();
  }

  show() {
    document.body.classList.add('live-emojing-enabled')
  }

  hide() {
    document.body.classList.remove('live-emojing-enabled')
  }

}
