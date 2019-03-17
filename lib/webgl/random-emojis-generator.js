'use babel';

import EmojiFactory from './emoji-factory';


var glyphs = []
for (const c of "😬✅👑👋🎧👇😖😠😶🎵🌟🔴") {
  glyphs.push(c)
}
var count = 0
var pos = 0

export default class RandomEmojisGenerator {

  constructor(emojiFactory) {
    this.emojiFactory = emojiFactory;
  }

  update() {
    count += 0.2;
    if (count > 6) {
      var x = 16 + (pos - 8) * 32
      var y = 16 + Math.random()*32
      var glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
      this.emojiFactory.add(glyph,x,y);
      count = 0
      pos++
      pos %= 16
    }
  }

}
