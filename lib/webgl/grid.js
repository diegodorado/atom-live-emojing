'use babel';

import {
  DoubleSide,
  RepeatWrapping,
  TextureLoader,
  MeshBasicMaterial,
  PlaneGeometry,
  Mesh
} from 'three-full'

export default class Grid extends Mesh {

  constructor() {
    var textureLoader = new TextureLoader()
    var texture = textureLoader.load("atom://live-emojing/images/squaremask.jpg")
    texture.wrapS = texture.wrapT = RepeatWrapping
    texture.repeat.set(16, 32)

    var floorMaterial = new MeshBasicMaterial({
      map: texture,
      side: DoubleSide,
      color: "#ff40a0"
    })
    var floorGeometry = new PlaneGeometry(512, 1024, 16, 32)

    super(floorGeometry, floorMaterial)

    this.texture = texture
    this.position.y = 0.5
    this.rotation.x = Math.PI / 2
  }

  update(time) {
    this.texture.offset.set( 0,-0.002*time )
  }



}
