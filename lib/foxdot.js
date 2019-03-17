'use babel';


let parseForFoxdot = function(text) {
  //bar   caret   hash   hyphen   lessthan
  let glyphs = '1234&*@/:$=!\%+?;~'
  glyphs += 'abcdefghijklmnopqrstuvwxyz'
  glyphs += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

  let r = []
  for (c of text) {
    let code = c.charCodeAt(0)
    if (code < 128) {
      r.push(c)
    } else {
      if (c == '😶')
        r.push(' ')
      else
        r.push(glyphs[code % glyphs.length])
    }
  }
  return r.join('')
}

export default class FoxDot {

  constructor(data) {
 
  }

  destroy() {
  }

}
