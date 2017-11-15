'use strict'

const Model = require('./Model')

module.exports = class Press extends Model {
  static get label () {
    return '轻阅读'
  }
  static async fields() {
    return {
      _id: { sortable: true },
      news_id: {label: '关联新闻', ref: "news.title"},
      title: { label: '标题' },
      content: { label: '内容' },
    }
  }

}