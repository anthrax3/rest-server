'use strict'

const Model = require('./Model')
const Config = use('Config')
const _ = require('lodash')

module.exports = class AdminUser extends Model {
  static get hidden() {
    return ['password']
  }
  static get label() {
    return '管理员'
  }
  static get fields() {
    return {
      _id: { sortable: true },
      username: { label: '用户名', cols: 3 },
      password: { label: '密码', type: 'password', listable: false, autocomplete: 'new-password', cols: 3 },
      realname: { label: '真实姓名', cols: 3 },
      role: {
        label: '角色', sortable: true, cols: 3, type: 'select', options: [
          {text: '请选择'},
          {text: '系统管理员', value: 'system'},
          {text: '管理员', value: 'admin'},
        ]
      },
      avatar: { label: '头像', type: 'image', preview: { height: 200 }, cols: 3 },
      created_at: { label: '注册时间', sortable: true },
    }
  }

  getAvatar(val) {
    return this.uploadUri(val)
  }

  isRole(role) {
    if (!role) {
      return true
    }
    if (_.isString(role)) {
      return role == this.role
    }
    return role.includes(this.role)
  }

  static boot() {
    super.boot()
    this.addHook('beforeCreate', 'User.hashPassword')
    this.addHook('beforeUpdate', 'User.hashPassword')
  }
}
