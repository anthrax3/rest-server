'use strict'

const Env = use('Env')

module.exports = {
  default: 'jsms',

  jsms: {
    key: Env.get('JSMS_KEY'),
    secret: Env.get('JSMS_SECRET'),
    templates: {
      code: 127168,

    }
  }
}