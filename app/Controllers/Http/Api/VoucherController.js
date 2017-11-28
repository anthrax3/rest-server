'use strict'

const _ = require('lodash')
const Helpers = use('Helpers')
const Config = use('Config')
const Drive = use('Drive')
const Voucher = use('App/Models/Voucher')
const Option = use('App/Models/Option')
const Order = use('App/Models/Order')

const { HttpException } = require('@adonisjs/generic-exceptions')
const BaseController = require('./ResourceController')

module.exports = class VoucherController {



  async active({ request, query }) {
    const { code, user_id } = request.all()
    const model = await Voucher.findBy({ code })
    if (!model) {
      throw new HttpException('无效的兑换码', 400)
    }
    model.user_id = user_id
    let order
    try {
      order = await model.active()
    } catch (e) {
      throw new HttpException('兑换失败, ' + e.message)
    }
    order.items = await order.items().with(['buyable']).fetch()
    // for (let item of order.items) {
    //   item.buyable = item.morph().listFields().first()
    // }
    return {
      order,
      msg: '已兑换成功，请在已购买中查看',
      code: 200,
      success: true
    }
  }

  async get({ request }) {
    const data = request.only([
      'object_type',
      'object_id',
      'mobile',
      'source',
    ])
    await validate(data, {
      mobile: 'required|mobile',
      object_id: 'required',
      object_type: 'required'
    })
    const model = await Voucher.findOrNew(data)
    if (!model._id) {
      model.merge({
        code: require('crypto').randomBytes(5).toString('hex'),
        source: data.source
      })
    }
    await model.save()
    return model
  }

}