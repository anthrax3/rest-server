'use strict'

const _ = require('lodash')
const Helpers = use('Helpers')
const Config = use('Config')
const fs = require('fs')

module.exports = class ResourceController {

  async index({ request, Model, query }) {
    return Model.query(query).paginate(query.page, query.perPage)
  }

  async grid({ request, Model }) {
    return {
      fields: _.omitBy(await Model.fields(), (v, k) => v.listable === false)
    }
  }

  async form({ request, Model, model }) {
    return {
      labels: await Model.labels(),
      fields: _.omitBy(await Model.fields(), (v, k) => v.editable === false || ['_id', 'created_at', 'updated_at', 'actions'].includes(k)),
      model: model
    }
  }

  async store({ request, auth, Model, model }) {
    model.merge(request.all())
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

  async delete() {
  }

  async choices({ request }) {

  }

  async upload({ request, auth, Model, model, validate }) {
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
      return file.error()
    }
    return {
      url: fileUrl
    }
  }

}