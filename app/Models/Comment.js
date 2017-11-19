'use strict'

const Model = require('./Model')
const User = use('App/Models/User')

module.exports = class Comment extends Model {
  static get objectIDs() {
    return ['_id']
  }
  static get label() {
    return '评论'
  }

  static get fields() {
    return {
      _id: { sortable: true },
      commentable_type: { label: '类型', options: [
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
        
      ] },
      commentable_id: { label: '文章', ref: 'commentable.title' },
      user_id: {
        label: '用户', type: 'select2', ref: "user.username", cols: 4,
        sortable: true,
      },
      is_top: { label: '是否置顶', type: 'switch' },
      content: { label: '评论内容' },
      created_at: { label: '发布时间' },

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

  commentable () {
    return this.morphTo('App/Models', 'commentable_type', '_id', 'commentable_id')
  }
  

}