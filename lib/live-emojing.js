'use babel'

import LiveEmojingView from './live-emojing-view'
import Manager from './manager'
import {patchTidalCycles,loadMap} from './patch'
import {CompositeDisposable} from 'atom'
import config from './config'

const package = {
  hasStarted: false,
  isActive: false,

  activate() {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'live-emojing:toggle': () => this.toggle(),
      'live-emojing:bind': () => this.bind()
    }));
  },

  // ctrl shift alt e
  toggle(){

    if (!this.hasStarted) {
      this.asyncToggle()
    }else{
      if (this.isActive) {
        this.stop()
      }else{
        this.start()
      }
    }
  },

  // ctrl shift e
  bind() {
    this.asyncBind()
  },

  async asyncToggle(){
    try {
      await this.load()
      loadMap()
    } catch (error) {
      console.log(typeof error)
      atom.notifications.addError(error)
    }
  },


  async asyncBind(){
    try {
      await this.load()
      loadMap()
      this.manager.bind()
    } catch (error) {
      console.log(typeof error)
      atom.notifications.addError(error)
    }
  },

  async load(){
    if (this.isActive)
      return // already active, we are ok
    await patchTidalCycles()
    // finish startup
    this.start()
  },

  start() {
    document.body.classList.add('live-emojing-enabled')
    const view = new LiveEmojingView()
    this.manager = new Manager(view)
    this.isActive = true
    this.hasStarted = true
  },

  stop() {
    document.body.classList.remove('live-emojing-enabled')
    this.manager.destroy()
    this.isActive = false
  },


  deactivate() {
    this.stop()
    this.subscriptions.dispose()
  },

  serialize() {
    return {};
  }

};

package.config = config

export default package
