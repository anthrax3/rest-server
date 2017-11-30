'use strict'

const _ = require('lodash')
const Helpers = use('Helpers')
const Config = use('Config')
const Drive = use('Drive')
const Order = use('App/Models/Order')
const Option = use('App/Models/Option')

const { HttpException } = require('@adonisjs/generic-exceptions')
const BaseController = require('./ResourceController')

module.exports = class OrderController extends BaseController {

  async create({ request, auth }) {
    const user = auth.user
    const data = request.all()
    const {
      payment_type = 'WALLET',
      buyable_id,
      buyable_type = 'Course'
    } = data

    await validate({
      buyable_type,
      payment_type
    }, {
        payment_type: 'required|in:WX_APP,ALI_APP,APPLE_PAY,WALLET',
        buyable_type: 'required|in:Course,Post,Charge'
      })

    if (buyable_type == 'Charge' && payment_type == 'WALLET') {
      throw new HttpException('非法请求: 充值的支付方式不支持钱包支付', 400)
    }

    let order
    const exist = await user.orderItems().where({
      buyable_id,
      buyable_type,
      paid_at: null
    }).first()
    if (exist) {
      order = await exist.order().first()
      if (order.payment_type != payment_type) {
        order.payment_type = payment_type
        await order.save()
      }
    } else {
      try {
        order = await user.buy({ payment_type }, [{
          buyable_id,
          buyable_type,
        }])

      } catch (e) {
        throw new HttpException('下单失败: ' + e.message, 400)
      }
    }
    
    if (order.payment_type == 'WALLET') {
      await user.payViaBalance(order)
    } else {
      return order.getPayData()
    }

    return order
  }

}