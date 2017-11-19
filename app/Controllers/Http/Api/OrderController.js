'use strict'

const _ = require('lodash')
const Helpers = use('Helpers')
const Config = use('Config')
const Drive = use('Drive')
const Post = use('App/Models/Post')
const Option = use('App/Models/Option')

const { HttpException } = require('@adonisjs/generic-exceptions')
const BaseController = require('./ResourceController')

module.exports = class OrderController extends BaseController {

  async create({ request, auth }) {
    const { payment_type, buyable_id, buyable_type = 'Course' } = request.all()
    const order = await auth.user.buy({ payment_type }, [{
      buyable_id,
      buyable_type,
    }])
    return order.getPayData()
  }

}