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
      cover: { label: '封面图' },
      created_at: { label: '创建时间' },
    }
  }

}