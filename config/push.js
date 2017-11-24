'use strict'

const Env = use('Env')

module.exports = {
  default: 'jpush',

  jpush: {
    key: Env.get('JPUSH_KEY'),
    secret: Env.get('JPUSH_SECRET'),
  }
}