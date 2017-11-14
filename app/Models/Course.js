'use strict'

const Model = require('./Model')
const User = require('./User')

module.exports = class Course extends Model {

  static get objectIDs() {
    return ['_id', 'user_id']
  }

  static get label() {
    return '专辑'
  }

  static async fields() {
    return {
      _id: { sortable: true },
      name: { label: '专栏名称', cols: 6, block: true },
      user_id: {
        label: '所属专家', type: 'select2', ref: "user.username", cols: 6,
        options: await User.options('_id', 'username', { role_id: 1 }), searchable: true,
        sortable: true
      },
      cover: {
        label: '列表封面图',
        type: 'image',
        accept: 'image/*',
        // limit: {width: 240, height: 240, size: 19 *1024}, //19KB
        cols: 6,
      },
      image: {
        label: '详情页大图',
        type: 'image',
        accept: 'image/*',
        // limit: {width: 240, height: 240, size: 19 *1024}, //19KB
        cols: 6,
        listable: false
      },
      description: { label: '描述', cols: 12, type: 'textarea', listable: false },
      content1: { label: '简介', type: 'html', cols: 3, listable: false },
      content2: { label: '知识核心', type: 'html', cols: 3, listable: false },
      content3: { label: '你将获得', type: 'html', cols: 3, listable: false },
      content4: { label: '免费试听', type: 'html', cols: 3, listable: false },

      created_at: { label: '创建时间' },
    }
  }

  getCover(val) {
    return this.uploadUri(val)
  }

  user() {
    return this.belongsTo('App/Models/User', 'user_id', '_id')
  }
}