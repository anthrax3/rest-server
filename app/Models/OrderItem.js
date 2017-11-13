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
      buyable_type: { label: '产品类型', options: [
        {
          text: ''
        },
        {
          text: '专栏',
          value: 'App/Models/Course'
        },
        {
          text: '一条',
          value: 'App/Models/Post'
        },
        
      ] },
      buyable_id: { label: '产品', ref: 'buyable.name' },
      price: { label: '价格' },
      started_at: { label: '生效时间' },
      expired_at: { label: '过期时间' },
    }
  }

  static get dates() {
    return super.dates.concat([
      'started_at', 'expired_at'
    ])
  }

  buyable () {
    return this.morphTo('App/..', 'buyable_type', '_id', 'buyable_id')
  }

}