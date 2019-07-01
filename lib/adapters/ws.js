'use babel'
import express from 'express'
import ws from 'isomorphic-ws'
import {EventEmitter} from 'events'

//todo: let change ports
class Adapter extends EventEmitter{

  constructor(){
    super()
    this.start()
  }

  start() {
    this.initWs()
  }

  initWs() {
    this.server = express().listen(8080, ()=>{})
    this.wsServer = new ws.Server({port: 1337})
    this.wsServer.on('connection', (ws) => {
      ws.on('message', (str) =>{
        const msg = JSON.parse(str) //JSON.parse(str.utf8Data)
        const s = this.callback(msg)


        //empty message after filter?
        if (msg.text.replace(/[\x7f-\xfF|a-z|A-Z|\s]/g, '').length == 0) {
          atom.notifications.addInfo('<b>'+msg.who +':</b><br/>'+msg.text)
        }else{
          return this.messageReceived(msg)
        }


        if (s !== null && msg.user_id!==null) {
          let url = `https://graph.facebook.com/${msg.user_id}/picture?height=320`
          s.updatePhoto(url)
        }
      })
    })

  }

  async initDdp(){

    try {
      const channelName = atom.config.get('live-emojing.channelName')
      const streamingUrl = atom.config.get('live-emojing.streamingUrl')

      this.ddp = new simpleDDP(opts)
      await this.ddp.connect()
      const sub = this.ddp.subscribe('emojis.clients',channelName, streamingUrl)
      await sub.ready()
      const clients = this.ddp.collection('clients').reactive()
      this.emit('message',clients.data())
      clients.onChange((data)=>{
        this.emit('message',data)
      })

      const emojis = this.ddp.collection('emojis').reactive()
      this.emit('message',emojis.data())
      emojis.onChange((data)=>{
        this.emit('message',data)
        //this.callback({who:fields.name, text:fields.pattern})
      })

    } catch (error) {
      this.emit('error', error)
    }
  }

  stop() {
    this.wsServer.close()
    this.server.close()
  }

}

export default Adapter
