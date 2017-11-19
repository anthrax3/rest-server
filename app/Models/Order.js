'use strict'

const Model = require('./Model')
const User = use('App/Models/User')
const OrderItem = use('App/Models/OrderItem')
const Event = use('Event')

module.exports = class Order extends Model {

  static get objectIDs() {
    return ['_id', 'user_id']
  }

  static get dates() {
    return super.dates.concat([
      'paid_at'
    ])
  }

  static get label() {
    return '订单'
  }

  static get fields() {
    return {
      // _id: { sortable: true },
      no: { label: '编号', sortable: true, searchable: true },
      title: { label: '名称' },
      user_id: {
        label: '用户',
        type: 'select2',
        ref: "user.username",
        cols: 6,
        ajaxOptions: {
          resource: 'users',
          text: 'username',
        },
        searchable: true,
        sortable: true
      },
      payment_type: {
        label: '支付方式',
        type: 'select',
        options: [
          { text: '请选择...', value: null },
          { text: '支付宝', value: 'ALI_APP' },
          { text: '微信支付', value: 'WX_APP' },
          { text: '兑换码', value: 'VOUCHER' },
        ],
        searchable: true
      },
      items: {
        label: '购买产品',
        type: 'array',
        editable: false,
        listable: false,
        ref: 'items.buyable._id',
        fields: _.omit(OrderItem.fields, ['_id', 'actions'])
      },
      total: { label: '金额', sortable: true },
      created_at: { label: '创建时间' },
      paid_at: { label: '支付时间', sortable: true },
      actions: {
        buttons: {
          edit: false,
          remove: false
        }
      }
    }
  }

  user() {
    return this.belongsTo('App/Models/User', 'user_id', '_id')
  }

  items() {
    return this.hasMany('App/Models/OrderItem', '_id', 'order_id')
  }

  

  getPayData() {
    return {
      no: this.no,
      channel: this.payment_type,
      title: this.title,
      billno: this.no,
      totalfee: this.total,
      optional: {
        order_id: this._id
      }
    }
  }

}