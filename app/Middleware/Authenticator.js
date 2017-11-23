'use strict'

const Config = use('Config')

class Authenticator {
  async handle ({ request, auth }, next, param) {
    // Config.set('auth.authenticator', param)
    auth = auth.authenticator(param)
    
    console.log('SET auth config: ', param);
    try {
      await auth.check()
    } catch (e) {
      console.log(this.constructor.name, e.name);
    }
    console.log('DEBUG', auth.user);
    await next()
  }
}

module.exports = Authenticator
