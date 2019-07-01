'use babel';

import SceneView from './webgl/scene';

export default class LiveEmojingView {

  constructor() {
    // Create root element
    const wrapper = atom.workspace.element
    this.element = document.createElement('div')
    this.element.classList.add('live-emojing')
    wrapper.appendChild(this.element)

    //profile pictures container
    this.pics = document.createElement('div')
    this.pics.classList.add('pics')
    this.element.appendChild(this.pics)

    if(atom.config.get('live-emojing.backgroundScene')){
      this.scene = new SceneView(this.element)
    }

  }

  addEmoji(glyph, t, latency, cps, delta, z_order) {
    if(this.scene)
      this.scene.addEmoji(glyph, t, latency, cps, delta, z_order)
  }

  addNote(note, t, latency, cps, delta, channel) {
    if(this.scene)
      this.scene.addNote(note, t, latency, cps, delta, channel)
  }

  // creates the pic element where to hold a profile picture
  createPicElement(){
    const pic = document.createElement('div')
    pic.classList.add('pic')
    this.pics.appendChild(pic)
    return pic
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

}
