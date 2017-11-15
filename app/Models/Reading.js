'use strict'

const Model = require('./Model')

module.exports = class Reading extends Model {
  static get label () {
    return '深解读'
  }
  static async fields() {
    return {
      _id: { sortable: true },
      title: { label: '标题' }
    }
  }

}