'use babel'

import express from 'express'
import ws from 'isomorphic-ws'

export default class Chrome {

  constructor(data) {
    this.callback = data.callback
    this.initWs();
  }

  initWs() {
    this.server = express().listen(8080, ()=>{})
    //todo: let change port
    this.wsServer = new ws.Server({port: 1337})
    this.wsServer.on('connection', (ws) => {
      ws.on('message', (str) =>{
        const msg = JSON.parse(str) //JSON.parse(str.utf8Data)
        const s = this.callback(msg)
        if (s !== null && msg.user_id!==null) {
          let url = `https://graph.facebook.com/${msg.user_id}/picture?height=320`
          s.updatePhoto(url)
        }
      })
    })

  }

  destroy() {
    this.wsServer.close()
    this.server.close()
  }

}
