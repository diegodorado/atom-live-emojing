'use babel';

import LiveEmojingView from './live-emojing-view'
import Chrome from './chrome'
import Sc from './sc'
import Telegram from './telegram'
import FoxDot from './foxdot'
import Tidal from './tidal'
import Slot from './slot'
import fs from 'fs'
import chokidar from 'chokidar'

import {
  CompositeDisposable
} from 'atom';

var mapFileName = 'emojis.json'
var mapFilePath = __dirname + '/' + mapFileName
let map = {}
let loaded = false
let foxdot = false
let tidal = false
var z_order = 0

let parseEmojis = function(text) {
  if(!/(s)(?:ound)?\s+"(.*?)"/.test(text)){
    z_order = 0
  }

  return text.replace(/(s)(?:ound)?\s+"(.*?)"/g, (matchedString, sound, string) => {
    let sounds = []
    let emojis = []

    for (c of string) {
      if (c.codePointAt(0) < 128) {
        // numbers, operators,letters, etc
        sounds.push(c)
        emojis.push(c)
      } else {
        if (map[c] == null){
          sounds.push('[~]')
          emojis.push('[0]')
        }
        else{
          //embrace them just in case
          sounds.push("["+map[c]+"]")
          emojis.push("["+c.codePointAt(0)+"]")
        }
      }
    }
    let text = ` s "${sounds.join('')}" # emoji "${emojis.join('').replace(/([A-Za-z]\w+)(:\d+)?/g, "0")}" # z_order ${z_order} `
    z_order++
    return text

  })


}





export default {
  config: {
    'botToken': {
      type: 'string',
      default: ''
    },
    'fetchInterval': {
      type: 'integer',
      default: 500,
      minimum: 50,
      maximum: 60000
    },
    'ownershipTime': {
      type: 'integer',
      default: 20,
      minimum: 1,
      maximum: 120
    },
    'debug': {
      type: 'boolean',
      default: false
    },
    'evaluateCode': {
      type: 'boolean',
      default: false
    }
  },
  view: null,
  chrome: null,
  sc: null,
  telegram: null,
  modalPanel: null,
  subscriptions: null,
  slots: [],

  activate(state) {
    this.view = new LiveEmojingView(state.liveEmojingViewState);
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'live-emojing:bind': () => this.bind(),
      'live-emojing:load': () => this.load()
    }));

    setInterval(() => {
      for (let [i, s] of this.slots.entries()) {
        if (s.valid)
          s.update()
        else
          this.slots.splice(i, 1)
      }
    }, 1000);

  },

  didLoad(callback) {
    if (loaded)
      return true

    let ed = atom.workspace.getActiveTextEditor()

    // is this foxdot?
    if (ed.getGrammar().scopeName == "source.python") {
      if (atom.packages.loadedPackages.foxdot.mainModule == null) {
        atom.notifications.addWarning("Iniciar FoxDot antes.")
        return false
      } else {
        foxdot = true
        this.commentStart = '# '
        atom.packages.loadedPackages.foxdot.mainModule.evaluateCode = function(code) {
          code = parseEmojis(code)
          let stdin = this.childProcess.stdin;
          stdin.write(code);
          stdin.write('\n\n');
        }
      }
    }

    // is this tidalcycles?
    if (ed.getGrammar().scopeName == "source.tidalcycles") {
      if (atom.packages.loadedPackages.tidalcycles.mainModule == null) {
        let editorView = atom.views.getView(atom.workspace)
        atom.commands.dispatch(editorView, "tidalcycles:boot")
        activationPromise = atom.packages.activatePackage('tidalcycles')

        // Two functions
        const onResolved = (resolvedValue) =>  callback.call(this)
        const onRejected = (error) => console.log(this,error)
        //bind after tidal is loaded
        activationPromise.then(onResolved, onRejected)
        return false
      } else {
        tidal = true
        this.commentStart = '-- ';
        var boot = `
          z_order = pF "z_order"
          emoji = pF "emoji"
        `
        atom.packages.loadedPackages.tidalcycles.mainModule.tidalRepl.tidalSendLine(boot)

        atom.packages.loadedPackages.tidalcycles.mainModule.tidalRepl.tidalSendLine = function(code) {
          code = parseEmojis(code)
          this.stdinWrite(code)
          this.stdinWrite('\n')
        }
      }
    }

    this.chrome = new Chrome({
      callback: (msg) => {
        //empty message after filter?
        if (msg.text.replace(/[\x7f-\xfF|a-z|A-Z|\s]/g, '').length == 0) {
          atom.notifications.addInfo('<b>'+msg.who +':</b><br/>'+msg.text)
        }else{
          return this.messageReceived(msg)
        }
      }
    });

    this.cs = new Sc({
      callback: (msg) => {
        return this.scMessageReceived(msg)
      }
    });

    let token = atom.config.get('live-emojing.botToken')
    if (!token) {
      atom.notifications.addWarning("Falta configurar el token de telegram en settings.")
      return false
    }

    this.telegram = new Telegram({
      token: token,
      callback: (msg) => {
        return this.messageReceived(msg)
      }
    });

    this.tryLoadMap()

    loaded = true
    return loaded

  },

  tryLoadMap() {
    let ed = atom.workspace.getActiveTextEditor()
    let path = ''

    //get emojis.json at current file path
    path = ed.getPath().replace(ed.getFileName(),'') + mapFileName

    //gets  emojis.json at current project path
    if (!fs.existsSync(path)){
      path = atom.workspace.project.rootDirectories[0].realPath
      path += '/' + mapFileName
    }

    // else, get default mapping
    if (!fs.existsSync(path))
      path = mapFilePath


    this.loadMap(path)

    // Initialize watcher.
    this.watcher = chokidar.watch(path, { persistent: true})
    this.watcher.on('change', (path, stats) => {
      this.loadMap(path);
    });

  },

  loadMap(path) {
    let s = fs.readFileSync(path).toString()
    map = {}
    let rules = JSON.parse(s)
    rules.forEach((s) => {
      let i = 0
      for (const c of s[0].replace(' ', '')) {
        // if map ends with colon, assign different indexes
        // to each emoji
        map[c] = s[1] + (/:$/.test(s[1])?i++:'')
      }
    })
  },

  load() {
    if (this.didLoad(this.load)) {
      //do nothing
    }
  },

  bind() {
    if (this.didLoad(this.bind)) {
      let pic = this.view.createPicElement()
      this.slots.push(new Slot({
        pic: pic,
        commentStart: this.commentStart,
        foxdot: foxdot,
        tidal: tidal
      }))
    }
  },

  messageReceived(msg) {
    let s = this.getSlot(msg.who)
    if (s != null)
      s.change(msg)
    return s
  },

  scMessageReceived(msg) {
    if(msg[0]=="/emoji"){
      let glyph = String.fromCodePoint(msg[1])
      let t = (msg[2] % 1)
      let cps = msg[3]
      let delta = msg[4]
      let latency = msg[5]
      let z_order = msg[6]
      this.view.scene.addEmoji(glyph,t,latency,cps,delta,z_order)
    }
    if(msg[0]=="/note"){
      let note = msg[1]
      let t = (msg[2] % 1)
      let cps = msg[3]
      let delta = msg[4]
      let latency = msg[5]
      let channel = msg[6]
      this.view.scene.addNote(note,t,latency,cps,delta,channel)
    }
  },

  getSlot(who) {

    let own = this.slots.filter(
      (s) => (s.who == who)
    )
    if (own.length > 0)
      return own[0]

    let brandNews = this.slots.filter(
      (s) => (s.free && s.who == null)
    )

    if (brandNews.length > 0)
      return brandNews[0]

    let free = this.slots.filter(
      (s) => (s.free)
    )

    if (free.length > 0)
      return free[Math.floor(Math.random() * free.length)]

  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.view.destroy();
    this.chrome.destroy();
    this.telegram.destroy();
    for (s of this.slots) {
      s.destroy()
    }
  },

  serialize() {
    return {
      liveEmojingViewState: this.view.serialize()
    };
  }

};
