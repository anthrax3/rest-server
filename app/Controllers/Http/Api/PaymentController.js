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

  async channels(){
    return Config.get('payment.channels')
  }


}