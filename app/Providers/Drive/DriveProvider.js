'use strict'

const { ServiceProvider, ioc } = require('@adonisjs/fold')

module.exports = class DriveProvider extends ServiceProvider {

  register() {
    const Drive = ioc.use('Adonis/Addons/Drive')
    Drive.extend('alioss', require("./Drivers/AliOSS"))
    Drive.extend('qiniu', require("./Drivers/Qiniu"))
  }

}
