'use strict'

const Model = require('./Model')

module.exports = class News extends Model {

  static get label () {
    return '新闻'
  }

  static async fields() {
    return {
      _id: { sortable: true },
      title: { label: '标题', sortable: true},
      image: { label: '图片', type: 'image' },
      source: { label: '来源' },

      description: { label: '描述', type: 'html', listable: false },
      content: { label: '详情', type: 'html', listable: false },

      created_at: { label: '创建时间' },

    }
  }

}