'use strict'

const Model = require('./Model')

module.exports = class News extends Model {

  static get label () {
    return '新闻'
  }

  static async fields() {
    return {
      _id: { sortable: true },
      title: { label: '标题', cols: 3, sortable: true, searchable: true},
      image: { label: '图片', cols: 3, type: 'image' },
      source: { label: '来源', cols: 3 },

      description: { label: '描述', type: 'textarea', listable: false },
      content: { label: '详情', type: 'html', listable: false },

      created_at: { label: '创建时间', type: 'date', range: true, searchable: true},

    }
  }

  getImage(val){
    return this.uploadUri(val)
  }

}