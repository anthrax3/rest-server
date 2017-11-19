'use strict'

const Env = use('Env')

module.exports = {
  default: 'beecloud',

  beecloud: {
    key: Env.get('BEECLOUD_KEY'),
    secret: Env.get('BEECLOUD_SECRET'),
  }
}