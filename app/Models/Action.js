'use strict'

const Model = require('./Model')
const User = use('App/Models/User')

module.exports = class Action extends Model {
  static get objectIDs() {
    return ['_id', 'actionable_id']
  }
  static get label() {
    return '评论'
  }

  static get fields() {
    return {
      _id: { sortable: true },
      actionable_type: { label: '类型', options: [
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
          text: '用户',
          value: 'User'
        },
      ] },
      actionable_id: { label: '文章', ref: 'actionable.title' },
      user_id: {
        label: '用户', type: 'select2', ref: "user.username", cols: 4,
        sortable: true,
        ajaxOptions: {
          resource: 'users',
          text: 'username',
        },
      },

      created_at: { label: '操作时间' },

      actions: {
        buttons: {
          edit: false,
          remove: false
        }
      }
    }
  }

  actionable () {
    return this.morphTo('App/Models', 'actionable_type', '_id', 'actionable_id')
  }
  

}