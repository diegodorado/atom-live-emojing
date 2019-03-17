'use babel';

import {Easing, autoPlay, Tween } from 'es6-tween'
import { Sprite } from 'three-full'

autoPlay(true)

export default class Emoji extends Sprite {

  constructor(material,t,latency,cps,delta,z_order) {
    super(material)
    let x = 16 + (t - 0.5) * 16 * 32
    this.position.x = x
    this.position.y = 0;
    this.position.z = -64 * z_order;
    this.scale.x = this.scale.y = 0.001;

    let tween = new Tween(this.position)
    	.to({ y: 16 }, (1000*latency))
      .on('complete', (data => {
        this.scale.x = this.scale.y = 40;
        let tween2 = new Tween(this.scale)
        	.to({ x: 35, y: 35 }, (1000*delta))
          .easing(Easing.Quadratic.Out)
          .on('complete', (data => {
            this.parent.remove(this);
        	}))
        	.start()
    	}))
    	.start()
  }
}
