'use babel';

import SceneView from './webgl/scene';

export default class LiveEmojingView {

  constructor(serializedState) {
    this.pics = {};
    this.pics_status = {} //1:loading, 2:loaded
    // Create root element
    this.wrapper = atom.workspace.element
    this.element = document.createElement('div')
    this.element.classList.add('live-emojing')
    this.wrapper.appendChild(this.element)

    //profile pictures container
    this.pics = document.createElement('div')
    this.pics.classList.add('pics')
    this.element.appendChild(this.pics)

    this.scene = new SceneView(this.element)
  }

  // creates the pic element where to hold a profile picture
  createPicElement(){
    let pic = document.createElement('div')
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
