'use babel';

export default class Slot {

  editor: null
  marker: null
  attributionMarker: null
  user_id : null
  who: null
  pic: null //the pic element in the UI
  lastUpdate: null
  free: true

  constructor(data) {
    this.pic = data.pic
    this.commentStart = data.commentStart
    this.ownershipTime = atom.config.get('live-emojing.ownershipTime')

    let ed = atom.workspace.getActiveTextEditor()

    let curPos = ed.getCursorBufferPosition()

    let r = ed.getSelectedBufferRange()

    //remove previous comments
    const a = [[r.end.row,r.end.column+2],[r.start.row+1,0]]
    const s = ed.getTextInBufferRange(a).replace(/\s*--.*/,'')
    ed.setTextInBufferRange(a, s, {undo: 'skip'})

    //r = ed.getSelectedBufferRange()
    let m = ed.markBufferRange(r, {
      invalidate: 'overlap'
    })


    ed.moveToEndOfLine()
    ed.insertText("   ")
    let r2 = ed.insertText(" ")[0]
    ed.insertText("  ") // so i can write afterwards
    let m2 = ed.markBufferRange(r2, {
      invalidate: 'never'
    })

    ed.setCursorBufferPosition(curPos)


    ed.decorateMarker(m, {
      type: 'highlight',
      class: "highlight-rainbow"
    })

    ed.decorateMarker(m2, {
      type: 'highlight',
      class: "highlight-colorswipe"
    })

    this.editor = ed
    this.marker = m
    this.attributionMarker = m2
    this.free = true
    this.pic.classList.remove('occupied')
    this.valid = true
    // strangely, if I create and append an svg element
    // it get 0x0 dimension.. ??
    // so, I create it by literally setting the HTML
    const randomId = Math.floor(Math.random()*100)
    this.pic.innerHTML=`
    <img class="avatar" src="https://api.adorable.io/avatars/200/${randomId}"/>
    <img class="sticker" src=""/>
    <svg>
      <ellipse class="bg" />
      <ellipse class="fg" />
    </svg>`

    // sets accesors for further updates
    this.timeEllipse = this.pic.getElementsByClassName('fg')[0]
    this.timeEllipseLength = this.timeEllipse.getTotalLength()
    this.avatarImage = this.pic.getElementsByTagName('img')[0]
    this.stickerImage = this.pic.getElementsByTagName('img')[1]

    this.update()
    m.onDidChange((e) => this.markerChanged(e))

  }

  destroy() {
    this.marker.destroy()
    this.editor.setTextInBufferRange(this.attributionMarker.getBufferRange(), '')
    this.attributionMarker.destroy()
    this.pic.remove()
    this.valid = false
  }

  markerChanged(e) {
    if (!e.isValid)
      this.destroy()
  }

  change(msg) {

    this.user_id = msg.user_id
    this.who = msg.who
    this.lastUpdate = Date.now()
    this.free = false

    this.editor.setTextInBufferRange(this.marker.getBufferRange(), msg.text)

    let curPos = this.editor.getCursorBufferPosition()
    let editorView = atom.views.getView(this.editor)
    this.editor.setCursorBufferPosition(this.marker.getStartBufferPosition())

    if(atom.config.get('live-emojing.evaluateCode')){
      atom.commands.dispatch(editorView, "tidalcycles:eval-multi-line")
    }

    //restore buffer position
    this.editor.setCursorBufferPosition(curPos)
    this.update()

    //do this last to avoid ellipse transition
    this.pic.classList.add('occupied')

  }

  updatePhoto(url){
    this.avatarImage.src = url
  }

  updateSticker(url, duration){
    this.stickerImage.src = url
    this.pic.classList.add('has-sticker')
    setTimeout(()=>{
      this.pic.classList.remove('has-sticker')
    },duration)
  }

  update() {
    let attr = this.commentStart+' waiting player'
    if (this.user_id!==null){
      let passed = Math.round((Date.now() - this.lastUpdate) / 1000)
      let left = this.ownershipTime - passed
      // keep only first name of who
      attr = `${this.commentStart} ${this.who} `
      if (left <= 0) {
        this.free = true
        this.pic.classList.remove('occupied')
        this.timeEllipse.setAttribute('style','stroke-dashoffset: '+this.timeEllipseLength)
        //attr += '( LIBRE!!! )'
      } else {
        let o = -this.timeEllipseLength*passed/this.ownershipTime
        this.timeEllipse.setAttribute('style','stroke-dashoffset: '+o)
        //attr += `(${left}'')`
      }

    }

    this.updatePicPosition()

    this.editor.setTextInBufferRange(this.attributionMarker.getBufferRange(), attr)



  }

  updatePicPosition() {
    let pos = this.attributionMarker.getEndScreenPosition()
    //gets absolute top position of the attribution marker
    let top = (pos.row - this.editor.getScrollTopRow() + 1) * this.editor.lineHeightInPixels
    this.pic.setAttribute('style',`top:${top}px;`)
  }


}
