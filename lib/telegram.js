'use babel';
import request from 'request'

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

export default class Telegram {

  constructor(data) {
    this.last_message_id = 0;
    this.isFetching = false;
    this.profileUrlCache = {};
    //last index of the story sent to each user
    this.aliceStoryIndex = {};

    this.botUrl = `https://api.telegram.org/bot${data.token}`
    this.fileBotUrl = `https://api.telegram.org/file/bot${data.token}`
    this.fetchInterval = atom.config.get('live-emojing.fetchInterval')
    this.callback = data.callback
    this.updatePhoto = data.updatePhoto

    setInterval(() => {
      if (!this.isFetching) {
        this.isFetching = true
        this.fetch()
      }
    }, this.fetchInterval);

  }

  destroy() {}

  tidalInterpretation(text) {
    return 'd1 $  s "TO_BE_DONE"'
  }

  fetch() {

    this.download().then((m) => {
      if (this.last_message_id !== m.message_id) {
        this.last_message_id = m.message_id
        this.handleMessage(m)
      }
    }).catch((error) => {
      if(!error.silent){
        console.log(error)
      }

    })


  }

  download() {
    let url = `${this.botUrl}/getUpdates?offset=-1`
    return new Promise((resolve, reject) => {
      request(url, (error, response, body) => {
        this.isFetching = false

        if (!error && response.statusCode == 200) {
          let data = JSON.parse(body)
          //todo: check errors
          if (data.result.length > 0) {
            let message = data.result[0].message
            resolve(message)
          } else {
            reject({
              silent: true,
              reason: 'No messages found'
            })
          }
        } else {
          reject({
            silent: false,
            reason: 'Unable to download page'
          })
        }
      })
    })

  }

  handleMessage(m) {
    // is this a brand new message?
    let ago = Math.round(Date.now() / 1000) - m.date
    ago *= 1000

    //discard old message
    if (ago > 9999)
      return

    //is this a start message? then say hi!
    if (m.text == '/start') {
      this.sayHi(m.from)
      return
    }

    let msg = {
      who: m.from.first_name //+ ' ' + m.from.last_name
    }

    if(!!m.sticker){
      msg.text = m.sticker.emoji
    }else{
      // a little formatting
      msg.text = m.text.replace(/[\x7f-\xfF|a-z|A-Z|\s]/g, '')

      //empty message after filter?
      if (msg.text.length == 0) {
        this.sayHi(m.from)
        return
      }
    }


    let s = this.callback(msg)
    this.reply(m, (s != null))

    if (s != null)
      this.getProfileUrl(s,m.from.id)

  }

  // try to gather telegram profile picture
  getProfileUrl(s,user_id) {

    if (!!this.profileUrlCache[user_id]) {
      s.updatePhoto(this.profileUrlCache[user_id])
    } else{
      s.updatePhoto("atom://live-emojing/images/no-one.png")
      request.post({
        url: `${this.botUrl}/getUserProfilePhotos`,
        form: {'user_id': user_id}
      }, (err, res, data)  => {
          data = JSON.parse(data);
          if(data.result.total_count==0){
            console.log('no photo')
          }else{
            let file_id = data.result.photos[0][0].file_id;
            let url  = `${this.botUrl}/getFile`
            request.post({
              url: url,
              form: {'file_id': file_id}
            },(err, res, data)  => {
              data = JSON.parse(data);
              let file_path = data.result.file_path;
              let url = `${this.fileBotUrl}/${file_path}`
              this.profileUrlCache[user_id] = url
              s.updatePhoto(url)
            });
          }
      })

    }

  }

  sayHi(who) {
    let text = `Hi ${who.first_name} !` +
      ` Esto es #livecoding 😎 \n\n` +
      ` Escribime algo como 😀😈💩😺 ` +
      ` y se escuchará en esta sesión.\n\n` +
      `Acepto emojis, y expresiones como \n` +
      `-----------------------------------\n` +
      `😀 😶 😈*2 , 💩/4 😺\n` +
      `-----------------------------------\n` +
      `\nTips:\n` +
      `----------\n` +
      `😀 * 2: duplicar velocidad\n` +
      `😈 / 3: tres veces mas lento\n` +
      `😀*2,💩:  😀*2 junto a 💩\n`

    this.sendMessage({
      chat_id: who.id,
      text: text
    })
  }

  reply(m, success) {

    //let text = `${m.text} en #tidalcycles: \n\n` +
    //  ` ${this.tidalInterpretation(m.text)} \n`
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
    request.post({
      url: `${this.botUrl}/sendMessage`,
      form: data
    })
  }


}
