'use babel';

import { CanvasTexture, SpriteMaterial,TextureLoader } from 'three-full'

export default class MaterialFactory {

  constructor(element) {
    // materials cache
    this.materials = {};
    // the busy flag is set to false
    // after render from outside this class
    this.busy = false;

    this.canvas2d = document.createElement('canvas');
    this.canvas2d.setAttribute('width',256);
    this.canvas2d.setAttribute('height',256);
    this.canvas2d.classList.add('canvas2d');
    element.appendChild(this.canvas2d);

    this.ctx2d = this.canvas2d.getContext('2d');
    this.ctx2d.font = '200px Arial';
    this.ctx2d.textBaseline = "middle";
    this.ctx2d.textAlign = "center";
  }

  getEmoji(glyph) {
    if (!!this.materials[glyph]) {
      return this.materials[glyph];
    }

    if(this.busy){
      return new SpriteMaterial({color: 0x000000 })
    }else{
      this.busy = true
      // set canvas as material.map (this could be done to any map, bump, displacement etc.)
      this.ctx2d.clearRect(0, 0, 256, 256);
      this.ctx2d.fillText(glyph, 128, 128);
      var texture = new CanvasTexture(this.canvas2d);
      texture.needsUpdate = true;

      this.materials[glyph] = new SpriteMaterial({
        map: texture,
        color: 0xffffff
      });
      return this.materials[glyph];
    }

  }

}
