'use strict'

const BaseModel = use('Model')
const _ = require('lodash')
const Validator = use('Validator')
const Antl = use('Antl')
const { HttpException } = require('@adonisjs/generic-exceptions')

class Model extends BaseModel {
  static async options(lhs, rhs) {
    let data = await this.select([lhs, rhs]).fetch()
    data = _.map(data.toJSON(), v => {
      return {
        text: v[rhs],
        value: v[lhs],
      }
    })
    data.unshift({
      text: '请选择...',
      value: null,
    })
    return data
  }

  async validate(data, rules = {}, messages = {}) {
    rules = Object.assign({}, this.rules() || {}, rules)
    messages = Object.assign({}, Antl.list('validations'), messages)
    const labels = await this.constructor.labels()
    const validation = await Validator.validate(data, rules, messages)
    if (validation.fails()) {
      let errorMessages = _.each(validation.messages(), v => {
        v.message = v.message.replace(v.field, labels[v.field])
        return v
      })
      throw new HttpException(errorMessages, 422)
    }
  }

  static async labels() {
    return _.mapValues(await this.fields(), 'label')
  }

  rules() {
    return {}
  }
}

module.exports = Model
