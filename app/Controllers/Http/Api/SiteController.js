'use strict'

const _ = require('lodash')
const Helpers = use('Helpers')
const Config = use('Config')
const Drive = use('Drive')
const { HttpException } = require('@adonisjs/generic-exceptions')

const User = use('App/Models/User')

module.exports = class SiteController {

  async login({ request, auth }) {

    const data = request.all()
    const { mobile, password } = data
    await validate(data, {
      mobile: 'required',
      password: 'required',
    })
    const user = await User.findBy('mobile', mobile)
    if (!user) {
      throw new HttpException([
        { field: 'mobile', message: '用户不存在' }
      ], 422)
    }
    let token
    try {
      token = await auth.attempt(mobile, password)
    } catch (e) {
      throw new HttpException([
        { field: 'password', message: '密码错误' }
      ], 422)
      token = await auth.generate(user) //for test
    }
    token.user = user
    return token
  }

  async upload({ request, response, auth }) {

    const type = request.input('type')
    const file = request.file('file', {
      types: ['image', 'audio', 'video'],
      size: '100mb'
    })
    let fileData = file.toJSON()
    let uploadPath = Config.get('api.upload.path')
    if (type) {
      uploadPath += (uploadPath ? '/' : '') + type
    }
    let filePath = uploadPath + '/' + fileData.clientName
    // let fileUrl = Config.get('api.upload.url') + '/' + fileData.clientName
    let fileUrl = Drive.getUrl(filePath)
    try {
      await Drive.put(filePath, fileData.tmpPath)
    } catch (e) {
      throw new HttpException(e.message, 400)
    }

    // if (fs.existsSync(filePath)) {
    //   fs.unlinkSync(filePath)
    // }
    // console.log(fileData);
    // await file.move(uploadPath)
    // if (!file.moved()) {
    //   throw new HttpException(file.error(), 400)
    // }
    return {
      title: fileData.clientName,
      state: "SUCCESS",
      url: fileUrl
    }
  }

  async index({ request }) {
    // const settings = 
    return {
      ads: await use('App/Models/Ad').findBy({})
    }
  }
  
  async news({ request }) {

    return use('App/Models/Course').limit(3).fetch()
  }
}