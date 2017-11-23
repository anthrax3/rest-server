'use strict'

const { ServiceProvider, ioc } = require('@adonisjs/fold')

const Push = require("./Push")

module.exports = class PushProvider extends ServiceProvider {

  register() {
    ioc.singleton('Push', app => {
      const config = ioc.use('Adonis/Src/Config').get('push')
      return new Push(config[config.default])
    })
  }

  boot() {

  }

}
