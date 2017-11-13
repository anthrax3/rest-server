'use strict'

const Model = require('./Model')
const Config = use('Config')
const Property = use('App/Models/Property')


class User extends Model {
  static get hidden() {
    return ['password']
  }
  static get label() {
    return '用户'
  }
  static async fields() {
    return {
      _id: { sortable: true },
      mobile: { label: '手机号', cols: 4, searchable: true },
      username: { label: '用户名', cols: 4, searchable: true },
      password: { label: '密码', cols: 4, type: 'password', autocomplete: 'new-password',listable: false },

      realname: { label: '真实姓名', cols: 4, searchable: true },
      
      
      points: { label: '积分', cols: 4, sortable: true , editable: false},
      position: { label: '职位', cols: 4, type: 'select', options: await Property.options('position'), searchable: true},
      trade: { label: '行业', cols: 4, type: 'select', options: await Property.options('profession'), searchable: true},
      created_at: { label: '注册时间', sortable: true, searchable: true },

      oauth: {
        label: '第三方账号',
        type: 'object',
        fields: {
          type: {label: '类型'},
          nickname: {label: '用户名'},
        },
        listable: false
      }
    }
  }

  getAvatar(val) {
    return this.uploadUri(val)
  }

  static boot() {
    super.boot()
    this.addHook('beforeCreate', 'User.hashPassword')
    this.addHook('beforeUpdate', 'User.hashPassword')
  }
}

module.exports = User
