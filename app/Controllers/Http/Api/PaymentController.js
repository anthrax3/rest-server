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

const md5 = require('crypto').createHash('md5')

const Event = use('Event')

module.exports = class PaymentController {

  async hook({ request }) {
    const data = request.all() || {
      "signature": "9c4e06f4e1d95d1e97c09e0ed995b2b7",
      "timestamp": 1511100802000,
      "channel_type": "ALI",
      "trade_success": true,
      "transaction_type": "PAY",
      "sub_channel_type": "test",
      "transaction_id": "test",
      "transaction_fee": 1,
      "optional": {
        "test": "test"
      },
      "message_detail": {
        "trade_status": "TRADE_SUCCESS",
        "trade_no": "test_trade_no",
        "out_trade_no": "test_out_trade_no",
        "buyer_email": "test_buyer_email",
        "total_fee": "0.10",
        "price": "0.10",
        "subject": "test",
        "discount": "0.00",
        "gmt_create": "2015-05-23 22:26:20",
        "notify_type": "test",
        "quantity": "1",
        "seller_id": "test",
        "buyer_id": "test",
        "use_coupon": "N",
        "notify_time": "2015-05-23 22:26:20",
        "body": "test",
        "seller_email": "test",
        "notify_id": "test",
        "sign_type": "RSA",
        "sign": "test"
      }
    }

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

    const sign = md5.update(raw).digest('hex')

    if (sign !== data.signature) {
      return 'fail: invalid signature'
    }

    if (data.trade_success) {
      if (data.transaction_type === 'PAY') {
        const order = await Order.find({ no: data.transaction_id })
        if (!order) {
          return 'fail: invalid order'
        }
        Event.emit('order::paid', order)
      }
    }

    return 'success'
  }

  async verifyIap({ request, response, auth }) {
    const { receipt } = request.all()
    const verifyPayment = Helpers.promisify(iap.verifyPayment)
    let res = null
    try {
      res = await verifyPayment('apple', { receipt })
    } catch (e) {
      throw new HttpException(e.message, 400)
    }
    const { productId } = res
    const [name, id] = productId.split('.').pop().split('_')
    if (name && id) {
      if (name === 'course') {
        const Course = use('App/Models/Course')
        const course = await Course.find({ id })
        const order = await auth.user.buy({
          payment_method: 'APPLE_PAY'
        }, [{
          buyable_type: 'Course',
          buyable_id: course._id
        }])
        return order
      }
    }

    return res
  }


}