'use strict'

const Model = require('./Model')

module.exports = class Product extends Model {

  static async fields() {
    return {
      _id: { sortable: true },
      mobile: { label: '手机号' }
    }
  }

}