'use strict'

const Config = use('Config')

class Authenticator {
  async handle ({ request, auth }, next, param) {
    Config.set('auth.authenticator', param)
    try {
      await auth.check()
    } catch (e) {
    }
    await next()
  }
}

module.exports = Authenticator
