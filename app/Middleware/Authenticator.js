'use strict'

const Config = use('Config')

class Authenticator {
  async handle ({ request, auth }, next, param) {
    // Config.set('auth.authenticator', param)
    
    auth = auth.authenticator(param)
    try {
      await auth.check()
    } catch (e) {
      console.log(this.constructor.name, e.name);
    }
    await next()
  }
}

module.exports = Authenticator
