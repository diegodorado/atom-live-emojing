'use babel'
import {EventEmitter} from 'events'
import bhttp from 'bhttp'

//todo: implement stories
// from https://gimme.fun/m/alice-in-wonderland/
const alice = [
  '👧😯🐇🕐🏃⚫🌳',
  '👧🔒🚪🍾👧⬆😭',
  '👧🍪⬇🌊🚪',
  '👧🔎🐇➡🏠👧🍪⬆',
  '🐇😱🤔🔥🏠',
  '👧🥕⬇🔓🏠➡🔎🐇',
  '🐛🖐🍄👧⬆👌',
  '🌳👧😯🐈➡🙃🎩',
  '🙃🎩🐰🐭🍵🎉',
  '🐇😱🕐🙃🎩🐭🐰😆',
  '👧😕🤔🚶🏡',
  '🌳👧❔🐱👉👸',
  '🏰👸👧🏏🐱✋👸',
  '👸😡👉👧🔒',
  '👧🤔🍄⬆👸😠👉👧',
  '👧😝👸😡🗯👧💀',
  '👧🏃🚪🔒🐱💬👧😴',
  '👧😔😟⛰🤔🐇',
  '👧👩➡🏡🍵🔚'
]


class Adapter extends EventEmitter{

  constructor(){
    super()
    this.start()
  }

  start() {

    const config = atom.config.get('live-emojing.telegram')

    if (!config.enabled)
      return

    if (!config.botToken) {
      atom.notifications.addWarning("You don't have a telegram token configured.")
      return
    }

    this.last_message_id = 0
    this.isFetching = false
    this.profileUrlCache = {}
    //last index of the story sent to each user
    this.aliceStoryIndex = {}


    this.botUrl = `https://api.telegram.org/bot${config.botToken}`
    this.fileBotUrl = `https://api.telegram.org/file/bot${config.botToken}`

    this.fetcher = setInterval(() => {
      if (!this.isFetching) {
        this.fetch()
      }
    }, config.fetchInterval)


  }

  async fetch() {
    this.isFetching = true
    try {
      const url = `${this.botUrl}/getUpdates?offset=-1`
      const {statusCode, body} = await bhttp.get(url)

      if (statusCode !== 200)
        throw 'Unable to download page'

      if (!body.ok)
        throw 'Data was not ok.'

      if (!(body.result instanceof Array))
        throw 'Data should be an array.'

      if (body.result.length === 0)
        throw 'Data array is empty.'

      const msg = body.result[0].message

      // return if already got this message?
      if (this.last_message_id === msg.message_id)
        return

      //save this message_id
      this.last_message_id = msg.message_id

      // how old is this message?
      const ago = (Math.round(Date.now() / 1000) - msg.date)*1000

      //discard old message
      if (ago > 9999)
        throw 'This message is way too old!'

      //is this a start message? then just say hi!
      if (msg.text == '/start')
        return this.sayHi(msg.from)


      if(!!msg.sticker){
        msg.text = msg.sticker.emoji
        this.getStickerUrl(msg.from.id, msg.sticker.thumb.file_id)
      }else{
        // a little formatting
        msg.text = msg.text.replace(/[\x7f-\xfF|a-z|A-Z|\s]/g, '')

        //empty message after filter?
        if (msg.text.length == 0)
          return this.sayHi(msg.from)
      }

      this.emit('message',{
        text: msg.text,
        who: msg.from.first_name,
        user_id: msg.from.id
      })

      this.getProfileUrl(msg.from.id)

      //todo: reply

    } catch (error) {
      this.emit('error', error)
    } finally{
      this.isFetching = false
    }
  }


  // try to gather telegram profile picture
  async getProfileUrl(user_id) {

    if (!!this.profileUrlCache[user_id]) {
      this.emit('avatar', user_id, this.profileUrlCache[user_id])
      return
    }

    const {statusCode, body} = await bhttp.post(`${this.botUrl}/getUserProfilePhotos`, {'user_id': user_id})

    if (statusCode !== 200)
      throw 'Unable to download photo page'

    if (!body.ok)
      throw 'Photo data was not ok.'

    if (body.result.total_count===0)
      throw 'No Photo found.'

    const file_id = body.result.photos[0][0].file_id;

    const url = await this.getFileUrl(file_id)
    this.profileUrlCache[user_id] = url
    this.emit('avatar', user_id, url)
  }


  async getStickerUrl(user_id, file_id) {
    const stickerDuration = atom.config.get('live-emojing.telegram.stickerDuration')
    const url = await this.getFileUrl(file_id)
    this.emit('sticker', user_id, url, stickerDuration)
  }

  async getFileUrl(file_id) {
    const {statusCode, body} = await bhttp.post(`${this.botUrl}/getFile`, {'file_id': file_id})
    const file_path = body.result.file_path;
    const url = `${this.fileBotUrl}/${file_path}`
    return url
  }



  sayHi(who) {
    const welcomeMessage = atom.config.get('live-emojing.telegram.welcomeMessage')
    this.sendMessage({
      chat_id: who.id,
      text: welcomeMessage.replace('%NAME%', who.first_name)
    })
  }

  reply(m, success) {
    let text = ''
    let index = this.aliceStoryIndex[m.from.id]
    if(index===undefined){
      text += 'To give you inspiration, I\'ll tell you a well known story.\n\n'
      this.aliceStoryIndex[m.from.id] = index = 0
    }

    if(index > alice.length-1){
      text += 'End of the story! Let\'s start over.\n\n'
      this.aliceStoryIndex[m.from.id] = index = 0
    }
    text += alice[index]+'\n'

    this.aliceStoryIndex[m.from.id]++

    if (!success) {
      text += '\n\nNo slot available... try again later.'
    }

    this.sendMessage({
      chat_id: m.from.id,
      text: text
    })

  }

  sendMessage(data) {
    bhttp.post(`${this.botUrl}/sendMessage`, data)
  }

  stop() {
    clearInterval(this.fetcher)
  }

}

export default Adapter
