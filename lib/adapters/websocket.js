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

  stop() {
    this.wsServer.close()
    this.server.close()
  }

}

export default Adapter
