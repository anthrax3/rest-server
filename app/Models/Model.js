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
    const labels = await this.constructor.labels()
    await validate(data, rules, messages, labels)
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
