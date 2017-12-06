const Validator = use('Validator')
const Config = use('Config')
const Helpers = use('Helpers')
const Antl = use('Antl')
const { HttpException } = require('@adonisjs/generic-exceptions')
const _ = require('lodash')
const inflection = require('inflection')

global._ = _
global.inflection = inflection
global.m = name => use('App/Models/' + name)
global.validate = async function (data, rules, messages, labels) {
  messages = Object.assign({}, Antl.list('validations'), messages)
  labels = Object.assign({}, Antl.list('labels'), labels)
  const validation = await Validator.validate(data, rules, messages)
  if (validation.fails()) {
    let errorMessages = _.each(validation.messages(), v => {
      v.message = String(v.message).replace(v.field, labels[v.field] || v.field)
      // console.log(v);
      return v
    })
    throw new HttpException(errorMessages, 422)
  }
}

global.upload = async function (request, key = 'file', typeName = 'type')  {
  const Drive = use('Drive')
  const type = request.input(typeName, key)
  const file = request.file(key, Config.get('api.uploadParams', {}))
  if (!file) {
    return
  }
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
  fileData.url = fileUrl
  return fileData
}

global.log = val => {
  console.log(JSON.stringify(val, null, 2));
}

global.toNumber = (val, defaultValue = 0) => Number(val) || defaultValue

global.add = (...args) => Number(_.sum(_.map(args, v => toNumber(v))).toFixed(2))