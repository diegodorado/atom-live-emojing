'use babel'
import Chrome from './chrome'
import Sc from './sc'
import Slot from './slot'
import Playground from './adapters/playground'
import WsAdapter from './adapters/ws'
import Telegram from './adapters/telegram'


class Manager {


  constructor(view) {
    console.log('Manager started')
    this.slots = []
    this.view = view
    this.slotsInterval = setInterval(() => {
      for (let [i, s] of this.slots.entries()) {
        if (s.valid)
          s.update()
        else
          this.slots.splice(i, 1)
      }
    }, 1000)

    this.playground = new Playground()
    this.wsAdapter = new WsAdapter()
    this.telegram = new Telegram()

    this.playground.on('message', this.onMessage)

    this.telegram.on('message', this.onMessage)
    this.telegram.on('error', this.onError)
    this.telegram.on('avatar', this.onAvatar)
    this.telegram.on('sticker', this.onSticker)


    this.sc = new Sc({
      callback: (msg) => {
        return this.scMessageReceived(msg)
      }
    })

  }

  getImage = (src)=>{
    // get a random url if none provided
    if(!src){
      const randomId = Math.floor(Math.random()*100)
      src =`https://api.adorable.io/avatars/200/${randomId}`
    }

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(src)
      img.onerror = reject
      img.src = src
    })
  }

  onMessage = (msg)=>{
    const s = this.get(msg.user_id)
    if (s !== null){
      s.change(msg)
      if(!!msg.pic){
        this.getImage(msg.pic)
          .then((src)=>s.updatePhoto(src))
      }
    }
  }


  onError = (error)=>{
    console.log(error)
  }

  onAvatar = (user_id, url)=>{
    for(s of this.slots){
      if(s.user_id===user_id)
        this.getImage(url)
          .then((src)=>s.updatePhoto(src))
    }
  }

  onSticker = (user_id, url, duration)=>{
    for(s of this.slots){
      if(s.user_id===user_id)
        this.getImage(url)
          .then((src)=>s.updateSticker(src, duration))
    }
  }

  //todo: unbind if on a binded region
  bind() {
    const pic = this.view.createPicElement()
    this.slots.push(new Slot({
      pic: pic,
      commentStart: '-- '
    }))
  }


  scMessageReceived(msg) {
    if(msg[0]=="/emoji"){
      let glyph = String.fromCodePoint(msg[1])
      let t = (msg[2] % 1)
      let cps = msg[3]
      let delta = msg[4]
      let latency = msg[5]
      let z_order = msg[6]
      this.view.addEmoji(glyph,t,latency,cps,delta,z_order)
    }
    if(msg[0]=="/note"){
      let note = msg[1]
      let t = (msg[2] % 1)
      let cps = msg[3]
      let delta = msg[4]
      let latency = msg[5]
      let channel = msg[6]
      this.view.addNote(note,t,latency,cps,delta,channel)
    }
  }


  get(user_id) {

    const own = this.slots.filter(s => s.user_id === user_id)
    if (own.length > 0)
      return own[0]

    const brandNews = this.slots
      .filter(s => s.free && s.user_id === null)
    if (brandNews.length > 0)
      return brandNews[0]

    const free = this.slots.filter(s => s.free)
    if (free.length > 0)
      return free[Math.floor(Math.random() * free.length)]

  }

  destroy(){
    // stop adapters
    this.playground.stop()
    this.wsAdapter.stop()
    this.telegram.stop()

    for (s of this.slots) {
      s.destroy()
    }
    clearInterval(this.slotsInterval)


    this.view.destroy()

  }

}


export default Manager
