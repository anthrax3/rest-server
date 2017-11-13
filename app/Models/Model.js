'use strict'

const BaseModel = use('Model')
const _ = require('lodash')
const Validator = use('Validator')
const Config = use('Config')
const Helpers = use('Helpers')
const Antl = use('Antl')
const { HttpException } = require('@adonisjs/generic-exceptions')

const arrayToTree = require("array-to-tree")

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

  static async treeOptions(lhs = '_id', rhs = 'name', parentField = 'parent_id', parentValue = null) {
    let data = await this.select([lhs, rhs, parentField]).fetch()
    
    const tree = arrayToTree(data.toJSON(), {
      customID: '_id'
    })
    
    const flatten = (items = [], level = 1) => {
      let ret = []
      level++
      items.forEach(item => {
        
        const option = {
          value: item[lhs],
          text: _.padStart(item[rhs], level, '　'),
        }
        ret.push(option)
        ret = ret.concat(flatten(item.children, level))
      })
      return ret
    }
    const options = [
      {
        text: '请选择...',
        value: null,
      }
    ].concat(flatten(tree))
    
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
    if (!val || typeof val != 'string') {
      return ''
    }
    if (val.match(/^http/i)) {
      return val
    }
    return Config.get('api.upload.url') + '/' + val
  }

  user() {
    return this.belongsTo('App/Models/User', 'user_id', '_id')
  }
}

module.exports = Model
