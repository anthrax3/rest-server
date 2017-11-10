'use strict'

const Model = require('./Model')

module.exports = class Course extends Model {

  static get label () {
    return '专辑'
  }

  static async fields() {
    return {
      _id: { sortable: true },
      title: { label: '标题' },
      cover: { 
        label: '封面图', 
        type: 'image', 
        accept: 'image/*', 
        limit: {width: 240, height: 240, size: 19 *1024}, //19KB
      },
      created_at: { label: '创建时间' },
    }
  }

}