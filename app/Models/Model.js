'use strict'

const BaseModel = use('Model')
const _ = require('lodash')
const Validator = use('Validator')
const Config = use('Config')
const Helpers = use('Helpers')
const Antl = use('Antl')
const { HttpException } = require('@adonisjs/generic-exceptions')

class Model extends BaseModel {
  static async options(lhs, rhs) {
    let data = await this.select([lhs, rhs]).fetch()
    data = _.map(data.toJSON(), v => {
      return {
        label: v[rhs],
        value: v[lhs],
      }
    })
    data.unshift({
      label: '请选择...',
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

  uploadUri(val){
    if (!val) {
      return val
    }
    if (val.match(/^http/i)) {
      return val
    }
    return Config.get('api.upload.url') + '/' + val
  }
}

module.exports = Model
