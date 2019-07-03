'use babel'
import simpleDDP from 'simpleddp'
import ws from 'isomorphic-ws'
import {EventEmitter} from 'events'

const opts = {
    endpoint: "wss://av.thundernize.com/websocket",
    //endpoint: "ws://localhost:3000/websocket",
    SocketConstructor: ws,
    reconnectInterval: 5000
}

class Adapter extends EventEmitter{

  constructor(){
    super()
    this.start()
  }

  start() {
    this.initDdp()
  }

  async initDdp(){

    try {
      const config = atom.config.get('live-emojing.playground')
      this.ddp = new simpleDDP(opts)
      await this.ddp.connect()
      const sub = this.ddp.subscribe('emojis.clients',config.channelName, config.streamingUrl)
      await sub.ready()
      /*
      const clients = this.ddp.collection('clients').reactive()
      this.emit('message',clients.data())
      clients.onChange((data)=>{
        this.emit('message',data)
      })
      */

      const emojis = this.ddp.collection('emojis').reactive()
      emojis.onChange((data)=>{
        for(let msg of data)
          this.emit('message',{
            text: msg.pattern,
            who: msg.nick,
            user_id: msg.nick.toLowerCase(),
            pic: msg.avatarUrl,
          })
      })

    } catch (error) {
      this.emit('error', error)
    }
  }

  stop() {
    this.ddp.clearData()
    this.ddp.disconnect()
  }

}

export default Adapter
