'use babel';

import MaterialFactory from './material-factory';
import Emoji from './emoji';

export default class EmojiFactory {

  constructor(element, group) {
    this.materialFactory = new MaterialFactory(element)
    this.container = group
  }

  add(glyph,t,latency,cps,delta,z_order) {
    const material = this.materialFactory.getEmoji(glyph)
    const emoji = new Emoji(material,t,latency,cps,delta,z_order)
    this.container.add(emoji)
  }

}
