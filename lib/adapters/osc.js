'use babel'
import osc from 'node-osc'
import {EventEmitter} from 'events'

class Adapter extends EventEmitter{

  constructor(){
    super()
    this.start()
  }

  start() {
    const config = atom.config.get('live-emojing.osc')
    if(!config.enabled)
      return

    this.server = new osc.Server(config.port, '0.0.0.0')
    this.server.on('message' , (msg) => {
      this.emit('emoji',msg)
    })
  }

  stop() {
    if(this.server)
      this.server.kill()
  }

}

export default Adapter
