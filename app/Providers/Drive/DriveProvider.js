'use strict'

const { ServiceProvider, ioc } = require('@adonisjs/fold')
const Storage = require('@slynova/flydrive/src/Storage')
const StorageManager = require('@slynova/flydrive')

const AliOSSDriver = require("./Drivers/AliOSS")
const QiniuDriver = require("./Drivers/Qiniu")

module.exports = class DriveProvider extends ServiceProvider {

  register() {
    const Drive = ioc.use('Adonis/Addons/Drive')
    Drive.extend('alioss', AliOSSDriver)
    Drive.extend('qiniu', QiniuDriver)
  }

  boot() {

  }

}
