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

  static async treeOptions(lhs = '_id', rhs = 'name', parentField = 'parent_id', parentValue = null) {
    let data = await this.select([lhs, rhs, parentField]).fetch()
    const group = _.groupBy(data.toJSON(), parentField)
    const unflatten = (items, level = 1) => {
      level++
      items.forEach(item => {
        item.text = item[rhs],
        item.value = item[lhs],
        item.children = group[item[lhs]] ? unflatten(group[item[lhs]], level) : []
      })
      return items
    }

    const flatten = (items = [], level = 1) => {
      let ret = []
      level++
      items.forEach(item => {
        const option = _.pick(item, ['text', 'value'])
        option.text = _.padStart(option.text, level, '　')
        ret.push(option)
        ret = ret.concat(flatten(item.children, level))
      })
      return ret
    }
    const options = flatten(unflatten(group[parentValue]))
    options.unshift({
      text: '请选择...',
      value: null,
    })
    return options
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

  uploadUri(val) {
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
