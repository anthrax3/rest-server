'use strict'

const _ = require('lodash')
const Helpers = use('Helpers')
const Config = use('Config')
const Drive = use('Drive')
const Voucher = use('App/Models/Voucher')
const Option = use('App/Models/Option')

const { HttpException } = require('@adonisjs/generic-exceptions')
const BaseController = require('./ResourceController')

module.exports = class VoucherController {



  async active({ request, query }) {
    const { code, user_id } = request.all()
    const model = await Voucher.findByOrFail({ code })
    let order
    try {
      order = await model.active(user_id)
    } catch (e) {
      throw new HttpException('兑换失败, ' + e.message)
    }
    return {
      order,
      msg: '已兑换成功，请在已购买中查看',
      code: 200,
      success: true
    }
  }

  async get({ request }) {
    const {
      object_type = 'Course',
      object_id,
      mobile,
      source
    } = request.all()
    const model = await Voucher.firstOrNew({
      object_type,
      object_id,
      mobile
    })
    if (!model._id) {
      model.merge({
        code: 212,
        source
      })
    }
    await model.save()
    
  }

}