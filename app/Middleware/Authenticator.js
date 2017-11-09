'use strict'

const Config = use('Config')

class Authenticator {
  async handle ({ request }, next, param) {
    Config.set('auth.authenticator', param)
    await next()
  }
}

module.exports = Authenticator
