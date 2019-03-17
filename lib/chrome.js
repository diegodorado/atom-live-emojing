'use babel';

import http from 'http'
import websocket from 'websocket'

export default class Chrome {

  constructor(data) {
    this.callback = data.callback
    this.initWs();
  }

  destroy() {
  }

  initWs() {
    var server = http.createServer(function(request, response) {
        // just WebSockets
        // we don't have to implement anything.
    });
    server.listen(1337, function() {});

    wsServer = new websocket.server({ httpServer: server });

    //quick and dirty
    var that = this

    // WebSocket server
    wsServer.on('request', function(request) {
        var conn = request.accept(null, request.origin);
        conn.on('message', function(str) {
            let msg = JSON.parse(str.utf8Data)
            s = that.callback(msg)
            if (s != null){
              let url = `https://graph.facebook.com/${msg.user_id}/picture?height=320`
              s.updatePhoto(url)
            }
        });
    });

  }

}
