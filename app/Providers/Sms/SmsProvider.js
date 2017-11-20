'use strict'

const { ServiceProvider, ioc } = require('@adonisjs/fold')

const Sms = require("./Sms")

module.exports = class SmsProvider extends ServiceProvider {

  register() {
    ioc.singleton('Sms', app => {
      const config = ioc.use('Adonis/Src/Config').get('sms')
      return new Sms(config[config.default])
    })
  }

  boot() {

  }

}
