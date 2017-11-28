'use strict'

const Model = require('./Model')
const User = m('User')

module.exports = class Voucher extends Model {
  static get label() {
    return '兑换码'
  }
  static get fields() {
    return {
      _id: { sortable: true },
      code: { label: '代码', searchable: true },
      // object_id: { label: '产品ID'},
      // object_type: {label: '类型'},
      object_title: { label: '产品名称' },
      user_id: { label: '使用人', ref: 'user.username' },
      used_at: { label: '使用时间' },
      mobile: { label: '手机号', searchable: true },
      source: { label: '来源', searchable: true},

      actions: {
        buttons: {
          edit: false
        }
      }
    }
  }

  object() {
    return this.morphTo('App/Models', 'object_type', '_id', 'object_id')
  }

  async appendObjectTitle() {
    const Model = use(`App/Models/${this.object_type}`)
    const data = await Model.where({
      _id: { in: this.object_id }
    }).select(['_id', 'title']).fetch()
    return _.map(data.toJSON(), 'title').join(', ')
  }

  async active(){
    const user = await User.find(this.user_id)
    if (!user) {
      throw new Error('用户不存在')
    }
    const items = _.map(this.object_id, id => ({
      buyable_type: this.object_type,
      buyable_id: id
    }))
    const order = await user.buy({
      payment_type: 'VOUCHER'
    }, items)
    await order.paid()
    return order
  }

}