'use strict'

const _ = require('lodash')
const Helpers = use('Helpers')
const Config = use('Config')
const fs = require('fs')
const { HttpException } = require('@adonisjs/generic-exceptions')

module.exports = class ResourceController {

  async index({ request, Model, query }) {
    return Model.query(query).paginate(query.page, query.perPage)
  }

  async grid({ request, Model }) {
    const searchFields = _.pickBy(await Model.fields(), 'searchable')
    const fields = await Model.fields()
    return {
      searchFields: searchFields,
      searchModel: _.mapValues(searchFields, v => null),
      fields: _.omitBy(fields, (v, k) => v.listable === false)
    }
  }

  async form({ request, Model, model }) {
    return {
      labels: await Model.labels(),
      fields: _.omitBy(await Model.fields(), (v, k) => v.editable === false || ['_id', 'created_at', 'updated_at', 'actions'].includes(k)),
      model: model,
    }
  }
  async view({ request, Model, model }) {
    return {
      labels: await Model.labels(),
      fields: _.omitBy(await Model.fields(), (v, k) => v.viewable === false),
      model: model,
    }
  }

  async store({ request, auth, Model, model }) {
    const data = request.all()
    await model.validate(data)
    model.fill(data)
    await model.save()
    return model
  }

  async show({ request, auth, Model, model }) {
    return model
  }

  async update({ request, auth, Model, model, validate }) {
    let data = request.all()
    await model.validate(data)
    model.merge(data)
    await model.save()
    return model
  }

  async destroy({ request, auth, Model, model, validate }) {
    await model.delete()
    return {
      success: true
    }
  }

  async choices({ request }) {

  }

  async upload({ request, auth }) {
    const file = request.file('file', {
      types: ['image', 'audio', 'video'],
      size: '100mb'
    })
    let fileData = file.toJSON()
    const uploadPath = Config.get('api.upload.path')
    const filePath = uploadPath + '/' + fileData.clientName
    const fileUrl = Config.get('api.upload.url') + '/' + fileData.clientName
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
    await file.move(uploadPath)
    if (!file.moved()) {
      throw new HttpException(file.error(), 400)
    }
    return {
      title: fileData.clientName,
      state: "SUCCESS",
      url: fileUrl
    }
  }

  async login({ request, auth }) {
    const AdminUser = use('App/Models/AdminUser')
    const data = request.all()
    const { username, password } = data
    await validate(data, {
      username: 'required',
      password: 'required',
    })
    const user = await AdminUser.findBy('username', username)
    if (!user) {
      throw new HttpException([
        {field: 'username', message: '用户不存在'}
      ], 422)
    }
    let token
    try {
      token = await auth.attempt(username, password)
    } catch (e) {
      throw new HttpException([
        {field: 'password', message: '密码错误'}
      ], 422)
      // token = await auth.generate(user) //for test
      
    }
    token.user = user
    return token
  }

}