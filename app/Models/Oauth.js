'use strict'

const Model = require('./Model')
const User = use('App/Models/User')

module.exports = class Oauth extends Model {
  
  static get objectIDs () {
    return ['_id', 'user_id']
  }
  static get label() {
    return '第三方账号'
  }
  static get gridActions () {

  }

  static get fields() {
    return {
      _id: { sortable: true },
      user_id: {
        label: '用户', 
        type: 'select2', 
        ref: "user.username", 
        cols: 6,
        
        searchable: true,
        sortable: true
      },
      type: {
        label: '类型', 
        type: 'select', 
        options: [
          {text: '请选择...', value: null},
          {text: '微信', value: 'wx'},
          {text: 'QQ', value: 'qq'},
          {text: '微博', value: 'wb'},
        ],
        searchable: true
      },
      openid: { label: 'OpendID' },
      nickname: {label: '昵称'},
      avatar: { label: '头像', type: 'image' },
      // data: {type: 'textarea', listable: false},
      created_at: { label: '创建时间' },
      actions: {
        label: '操作',
        buttons: {
          show: true,
          edit: false,
          remove: false
        }
      }
    }
  }

  user() {
    return this.belongsTo('App/Models/User', 'user_id', '_id')
  }

}