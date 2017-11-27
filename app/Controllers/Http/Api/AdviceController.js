'use strict'

const _ = require('lodash')
const Helpers = use('Helpers')
const Config = use('Config')
const Drive = use('Drive')
const Advice = use('App/Models/Advice')
const Option = use('App/Models/Option')

const { HttpException } = require('@adonisjs/generic-exceptions')
const BaseController = require('./ResourceController')

module.exports = class AdviceController extends BaseController {

  

  async store({ request, Model, model, query }) {
    const data = request.only([
      'category_id',
      'content',
      'contact',
      'user_id',
      'device_id',
      'device_data'
    ])
    model.fill(data)
    await model.save()
    return model
  }

}