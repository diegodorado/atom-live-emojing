'use babel';

import {Easing, autoPlay, Tween } from 'es6-tween'
import { Sprite } from 'three-full'
import Grid from './grid'

autoPlay(true)

export default class Emoji extends Sprite {

  constructor(material,t,latency,cps,delta,z_order) {
    super(material)
    this.position.x = 16 + (t - 0.5) * 16 * 32
    this.position.y = 0
    this.position.z = -64 * z_order
    this.scale.x = this.scale.y = 0.001

    new Tween(this.position)
      .to({ y: 16 }, (1000*latency))
      .on('complete', (data => {
        this.scale.x = this.scale.y = 40;
        new Tween(this.scale)
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
