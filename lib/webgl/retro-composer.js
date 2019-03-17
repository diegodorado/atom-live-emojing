'use babel';
import {
  RenderPass,
  EffectComposer,
  HalftonePass,
  UnrealBloomPass,
  Vector2
} from 'three-full'

export default class RetroComposer extends EffectComposer {

  constructor(renderer,scene, camera) {

    super(renderer)
    this.setSize(window.innerWidth, window.innerHeight)

    var renderScene = new RenderPass(scene, camera)
    this.addPass(renderScene)

    var halftoneParams = {
      shape: 1,
      radius: 4,
      rotateR: Math.PI / 12,
      rotateB: Math.PI / 12 * 2,
      rotateG: Math.PI / 12 * 3,
      scatter: 1,
      blending: 0.5,
      blendingMode: 0,
      greyscale: false,
      disable: false
    }
    var halftonePass = new HalftonePass(window.innerWidth, window.innerHeight, halftoneParams)
    //this.addPass(halftonePass)

    var bloomPass = new UnrealBloomPass(new Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85)
    bloomPass.threshold = 0.05
    bloomPass.strength = 0.4
    bloomPass.radius = 0.03
    bloomPass.renderToScreen = true
    this.addPass(bloomPass)

  }


}
