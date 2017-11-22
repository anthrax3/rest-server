'use strict'

const { ServiceProvider, ioc } = require('@adonisjs/fold')

module.exports = class ValidatorProvider extends ServiceProvider {

  register() {

  }

  mobileFn(data, field, message, args, get) {
    return new Promise((resolve, reject) => {
      const value = get(data, field)
      if (!value) {
        return resolve('skiped')
      }
      if (!value.match(/^1[3578]\d{9}$/i)) {
        reject(message)
      }
      resolve('passed')
    })
  }

  boot() {
    const Validator = use('Validator')
    Validator.extend('mobile', this.mobileFn.bind(this))
  }

}
