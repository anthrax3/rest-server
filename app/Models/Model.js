'use strict'

const BaseModel = use('Model')
const _ = require('lodash')

class Model extends BaseModel {
  static async pair(lhs, rhs) {
    const data = await this.select([lhs, rhs]).fetch()
    return _.map(data.toJSON(), v => {
      return {
        text: v[rhs],
        value: v[lhs],
      }
    })
    
  }
}

module.exports = Model
