'use strict'

const Model = require('./Model')

const User = use('App/Models/User')

module.exports = class Advice extends Model {
  static get objectIDs() { 
    return ['_id', 'user_id', 'category_id']
  }

  static get label () {
    return '意见反馈'
  }
  static get fields() {
    return {
      _id: { sortable: true },
      category_id: { label: '类别', ref: 'category.name' },
      content: { label: '反馈内容'},
      contact: { label: '联系方式'},
      user_id: { label: '用户', ref: 'user.username' },
      device_id: { label: '设备ID', listable: false },
      device_data: { label: '设备信息', listable: false },
      actions: {
        buttons: {
          edit: false
        }
      }
    }
  }

  category() {
    return this.belongsTo('App/Models/Category', 'category_id', '_id')
  }
  user() {
    return this.belongsTo('App/Models/User', 'user_id', '_id').select(User.listFields)
  }

}