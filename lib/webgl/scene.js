'use babel'

import {
  Easing
} from 'es6-tween'
import {
  Group,
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  FogExp2
} from 'three-full'
import SimplexNoise from 'simplex-noise'
import Grid from './grid'
import EmojiFactory from './emoji-factory'
import Notes from './notes'
import RetroComposer from './retro-composer'

var simplex = new SimplexNoise()

export default class SceneView {

  constructor(element) {
    this.count = 0
    this.pos = 0
    this.cameraBrownianY = 0
    this.cameraBrownianX = 0

    this.renderer = new WebGLRenderer({
      antialias: true
    })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    element.appendChild(this.renderer.domElement)

    this.scene = new Scene()

    this.camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000)
    this.scene.add(this.camera)

    this.composer = new RetroComposer(this.renderer, this.scene, this.camera)
    this.grid = new Grid()
    this.scene.add(this.grid)

    const emojisContainer = new Group()
    this.scene.add(emojisContainer)
    this.emojiFactory = new EmojiFactory(element, emojisContainer)

    //const notesContainer = new Group()
    //this.scene.add(notesContainer)
    //this.notes = new Notes(element, notesContainer)

    window.addEventListener('resize', (e) => {
      this.onWindowResize(e)
    }, false)


    this.scene.fog = new FogExp2(0x000000, 0.001)
    //trigger the render queue
    requestAnimationFrame(this.update)

  }

  addEmoji(glyph, t, latency, cps, delta, z_order) {
    this.emojiFactory.add(glyph, t, latency, cps, delta, z_order)
  }

  addNote(note, t, latency, cps, delta, channel) {
    //this.notes.add(note, t, latency, cps, delta, channel)
  }

  update = (time)=> {
    //prevent undefined on first call
    if (!time)
      time = 0


    //this.notes.update(time)
    this.grid.update(time)
    this.updateCameraNoise(time)
    this.composer.render()
    requestAnimationFrame(this.update)

    // the materialFactory can generate a single texture
    // per render tick.
    // that is why a busy flag is set when a new
    // texture is generated and can only be unset
    // after the render is done
    if (this.emojiFactory.materialFactory.busy)
      this.emojiFactory.materialFactory.busy = false

  }

  updateCameraNoise(time) {
    time *=0.5
    var noiseX = simplex.noise2D(time * 0.00012, time * 0.00016) * 40
    var noiseY = simplex.noise2D(time * 0.0002, time * 0.00005) * 40

    this.cameraBrownianX += (noiseX - this.cameraBrownianX) * 0.05
    this.cameraBrownianY += (noiseY - this.cameraBrownianY) * 0.05

    this.camera.position.x = this.cameraBrownianX
    this.camera.position.y = 80 + this.cameraBrownianY
    this.camera.position.z = 300
    this.camera.lookAt(this.scene.position)
  }

  onWindowResize() {
    var width = window.innerWidth
    var height = window.innerHeight
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
    this.composer.setSize(width, height)
  }



}
