'use strict'

const Model = require('./Model')
const User = use('App/Models/User')

module.exports = class OrderItem extends Model {

  static get label() {
    return '订单产品'
  }

  static async fields() {
    return {
      _id: { sortable: true },
      buyable_type: { label: '产品类型' },
      buyable_id: { label: '产品ID' },
      price: { label: '价格' },
      started_at: { label: '生效时间' },
      expired_at: { label: '过期时间' },
    }
  }

  buyable () {
    return this.morphTo('App/Models', 'buyable_type', '_id', 'buyable_id')
  }

}