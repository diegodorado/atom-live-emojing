'use babel'

export default  {

  'telegram': {
    type: 'object',
    properties: {
      'enabled': {
        type: 'boolean',
        default: false,
        description: 'Enable if you want to receive messages from a telegram bot.'
      },
      'botToken': {
        type: 'string',
        default: '',
        description: 'Get your telegram bot token'
      },
      'fetchInterval': {
        type: 'integer',
        description: 'How often should the telegram API be fetched?',
        default: 500,
        minimum: 50,
        maximum: 60000
      },
      'welcomeMessage': {
        type: 'string',
        default: `Hola %NAME% !` +
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
          `<😀💩>: un ciclo 😀 y el otro 💩\n`,
        description: 'This greeting will be replied upon /start reception.'
      },
      'stickerDuration': {
        type: 'integer',
        description: 'How long does a sticker replace avatar image? (milliseconds)',
        default: 3000,
        minimum: 500,
        maximum: 10000
      }
    },
  },
  'playground': {
    type: 'object',
    properties: {
      'enabled': {
        type: 'boolean',
        default: false,
        description: 'Enable if you want to receive messages from a telegram bot.'
      },
      'channelName': {
        type: 'string',
        description: 'The channel name users will connect to. Change it if you want to avoid message collisions.',
        default: 'live-emojing'
      },
      'streamingUrl': {
        type: 'string',
        description: 'An url to inform users where they can watch the streaming.',
        default: ''
      }
    },
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
    default: false,
    description: 'Should the code be auto evaluated upon message reception?'
  },
  'backgroundScene': {
    type: 'boolean',
    description: 'Enable background scene. Disable this if you are having performance issues.',
    default: true
  },
}
