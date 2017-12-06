'use strict'

const Model = require('./Model')
const User = use('App/Models/User')

module.exports = class OrderItem extends Model {

  static get objectIDs() {
    return ['_id', 'buyable_id', 'user_id', 'order_id']
  }

  static get label() {
    return '订单产品'
  }

  static get fields() {
    return {
      _id: { sortable: true },
      buyable_type: {
        label: '产品类型', options: [
          {
            text: ''
          },
          {
            text: '专栏',
            value: 'Course'
          },
          {
            text: '一条',
            value: 'Post'
          },
          {
            text: '充值',
            value: 'Charge'
          },

        ]
      },
      buyable_id: { label: '产品', ref: 'buyable.title' },
      user_id: { label: '用户', ref: 'user.username' },
      price: { label: '价格' },
      started_at: { label: '生效时间' },
      expired_at: { label: '过期时间' },
      actions: {
        buttons: {
          edit: false,
          remove: false
        }
      }
    }
  }

  static get dates() {
    return super.dates.concat([
      'started_at', 'expired_at'
    ])
  }

  

  morph(query) {
    return use(`App/Models/${this.buyable_type}`).query(query).where({
      _id: this.buyable_id
    })
  }

  buyable() {
    return this.morphTo('App/Models', 'buyable_type', '_id', 'buyable_id')
  }

  order() {
    return this.belongsTo('App/Models/Order', 'order_id', '_id')
  }

}