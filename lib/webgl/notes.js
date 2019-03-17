'use babel';

import {
  BoxBufferGeometry,
  Mesh,
  Vector3,
  MeshLambertMaterial
} from 'three-full'

import {Easing, autoPlay, Tween } from 'es6-tween'

autoPlay(true)

export default class Notes {

  constructor(element, group) {
    this.container = group
    this.notesCount = 64;
    this.channelsCount = 10;

    var geometry = new BoxBufferGeometry(16, 16, 16)

    for (var i = 0; i < this.channelsCount; i++) {
      var material = new MeshLambertMaterial({
        opacity: 0.75,
        transparent: true,
        color: Math.random() * 0xffffff
      })
      for (var j = 0; j < this.notesCount; j++) {
        var object = new Mesh(geometry, material)

        object.position.x = (j-this.notesCount/2)*8 + 16
        object.position.y = (i+1)*8+16
        object.position.z = -512
        object.scale.x = 0.1
        object.scale.y = 0.1
        object.scale.z = 0.1
        this.container.add(object)
      }
    }

  }

  add(note, t, latency, cps, delta, channel) {
    var n = (note+24)
    if(n>=this.notesCount || n<0) return
    if(channel>=this.channelsCount || channel<0) return

    var object = this.container.children[n+channel*this.notesCount]

    new Tween(object.scale)
    	.to({ x: 1, y:1 }, (1000*latency))
      .easing(Easing.Quadratic.In)
      .on('complete', (data => {
         new Tween(object.scale)
        	.to({ x: 0.1, y: 0.1 }, (1000*delta))
          .easing(Easing.Quadratic.In)
        	.start()
    	}))
    	.start()


  }

  update(time) {
    for (var i = 0; i < this.channelsCount; i++) {
      for (var j = 0; j < this.notesCount; j++) {
        var o = this.container.children[i*this.notesCount+j]
        o.position.z = -512 + Math.sin((i/this.channelsCount)*0.15+(j/this.notesCount)*0.15+time*0.0001)*128
      }
    }
  }

}
