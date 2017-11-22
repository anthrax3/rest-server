'use strict'

const _ = require('lodash')
const Helpers = use('Helpers')
const Config = use('Config')
const Drive = use('Drive')
const { HttpException } = require('@adonisjs/generic-exceptions')

const User = use('App/Models/User')
const Option = use('App/Models/Option')
const Course = use('App/Models/Course')
const Reading = use('App/Models/Reading')
const Ad = use('App/Models/Ad')

module.exports = class SiteController {
  async index() {
    return {
      version: 2,
      status: 'ok'
    }
  }

  async upload({ request, response, auth }) {

    const type = request.input('type')
    const file = request.file('file', Config.get('api.uploadParams', {}))
    let fileData = file.toJSON()
    let uploadPath = Config.get('api.upload.path')
    if (type) {
      uploadPath += (uploadPath ? '/' : '') + type
    }
    let filePath = uploadPath + '/' + fileData.clientName
    let fileUrl = Drive.getUrl(filePath)
    try {
      await Drive.put(filePath, fileData.tmpPath)
    } catch (e) {
      throw new HttpException(e.message, 400)
    }
    return {
      title: fileData.clientName,
      state: "SUCCESS",
      url: fileUrl
    }
  }

  async sendCode({ request, auth }) {
    const Sms = use('App/Models/Sms')
    const { mobile, captcha, isLogin } = request.all()
    let ret = await use('Sms').sendCode()
  }

  
}