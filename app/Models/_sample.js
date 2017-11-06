'use strict'

const Model = use('Model')

module.exports = class Product extends Model {

  static get fields() {
    return {
      _id: { sortable: true },
      mobile: { label: '手机号' }
    }
  }

}