'use strict'

const _ = require('lodash')
const axios = require('axios')
const iap = require('iap')

const Helpers = use('Helpers')
const Config = use('Config')
const { HttpException } = require('@adonisjs/generic-exceptions')

const User = use('App/Models/User')
const PayLog = use('App/Models/PayLog')
const Order = use('App/Models/Order')

const crypto = require('crypto')

const Event = use('Event')

module.exports = class PaymentController {

  async hook({ request }) {
    const data = request.all()

    const config = Config.get('payment')
    const bc = config[config.default]

    const raw = [
      bc.key,
      data.transaction_id,
      data.transaction_type,
      data.channel_type,
      data.transaction_fee,
      bc.secret
    ].join('')

    const sign = crypto.createHash('md5').update(raw).digest('hex')

    if (sign !== data.signature) {
      return 'fail: invalid signature'
    }

    await PayLog.create(data)

    if (data.trade_success) {
      if (data.transaction_type === 'PAY') {
        const order = await Order.findBy({ no: data.transaction_id })
        if (!order) {
          return 'fail: invalid order'
        }
        await order.paid()

      }
    }

    return 'success'
  }

  async verifyIap({ request, response, auth }) {
    const data = request.all()
    const { receipt, productId, transactionId } = data
    const verifyPayment = Helpers.promisify(iap.verifyPayment)
    let res = null
    try {
      res = await verifyPayment('apple', { receipt })
    } catch (e) {
      throw new HttpException(e.message, 400)
    }
    // return res.receipt
    const { in_app } = res.receipt
    if (!in_app) {
      throw new HttpException('无效的交易数据', 400)
    }
    const record = _.find(in_app, v => v.transaction_id == transactionId)
    if (!record) {
      throw new HttpException('错误的交易记录', 400)
    }
    const { product_id } = record
    const iap_id = product_id.split('.').pop()
    const [name, id] = iap_id.split('_')
    if (!name || !id) {
      throw new HttpException('无效的产品', 400)
    }
    let buyable_type
    let buyable_id

    switch (name) {
      case 'course':
        const course = await m('Course').findByOrFail({ id })
        buyable_type = 'Course'
        buyable_id = course._id
        break;
      case 'post':
        const post = await m('Post').findByOrFail({ id })
        buyable_type = 'Post'
        buyable_id = post._id
        break;
      case 'charge':
        const charge = await m('Charge').findByOrFail({
          iap_id
        })
        buyable_type = 'Charge'
        buyable_id = charge._id
        break;
    }
    if (!buyable_id) {
      throw new HttpException(`无效的产品ID ${productId}`, 400)
    }

    const order = await auth.user.buy({
      payment_method: 'APPLE_PAY'
    }, [{
      buyable_type,
      buyable_id,
    }])
    await order.paid();
    return order
  }

  async channels() {
    return Config.get('payment.channels')
  }


}