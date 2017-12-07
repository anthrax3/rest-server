'use strict'

const BaseModel = use('Model')
const _ = require('lodash')
const Validator = use('Validator')
const Config = use('Config')
const Helpers = use('Helpers')
const Antl = use('Antl')
const { HttpException } = require('@adonisjs/generic-exceptions')

const arrayToTree = require("array-to-tree")

module.exports = class Model extends BaseModel {

  static get fillable() {
    return _.reject(_.keys(this.fields), v => {
      return ['_id', 'id'].includes(v) || v.includes('.')
    })
  }
  // static get iocHooks () {
  //   return ['_bootIfNotBooted']
  //   // return ['_bootIfNotBooted', 'buildOptions']
  // }

  static get computed() {
    return []
  }

  static get objectIDs() {
    return ['_id']
  }

  getId(){
    return this._id
  }

  static async fetchOptions(lhs, rhs, where = {}) {
    let data = await this.select([lhs, rhs]).where(where).fetch()
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

  static async buildOptions() {
    this.options = {
      // course_id: await Course.fetchOptions('_id', 'title'),
      // post_id: await Course.fetchOptions('_id', 'title'),
      // user_id: await Course.fetchOptions('_id', 'username'),
      // category_ids: await Course.fetchOptions('_id', 'name'),
    }
  }

  static getOptions(key) {
    return _.get(this.options, key, [])
  }

  static async treeOptions(lhs = '_id', rhs = 'name', topName = null, parentField = 'parent_id', parentValue = null) {
    let data = await this.select([lhs, rhs, parentField]).fetch()
    
    const tree = arrayToTree(data.toJSON(), {
      customID: '_id'
    })
    
    const flatten = (items = [], level = topName ? -1 : 0) => {
      let ret = []
      level++
      items.forEach(item => {
        
        const option = {
          value: item[lhs],
          text: _.repeat('　', level) + item[rhs],
        }
        
        ret.push(option)
        ret = ret.concat(flatten(item.children, level))
      })
      return ret
    }
    const topNode = _.find(tree, {[rhs]: topName})
    const top = topName && topNode ? topNode.children : tree
    const options = [
      {
        text: '请选择...',
        value: null,
      }
    ].concat(flatten(top))
    
    return options
  }

  static parseObjectID(key, value) {
    return this.formatObjectID(key, value)
  }

  async validate(data, rules = {}, messages = {}) {
    rules = Object.assign({}, this.rules() || {}, rules)
    const labels = await this.constructor.labels()
    await validate(data, rules, messages, labels)
  }

  static async labels() {
    return _.mapValues(this.fields, 'label')
  }

  rules() {
    return {}
  }

  merge(data){
    const newData = _.pickBy(data, (v, k) => this.constructor.fillable.includes(k))
    return super.merge.call(this, newData)
  }

  uploadUri(val) {
    if (!val || typeof val != 'string') {
      return ''
    }
    if (val.match(/^http/i)) {
      return val
    }
    return use('Drive').getUrl(val)
    return Config.get('api.upload.url') + '/' + val
  }

  static scopeListFields(query){
    query.select(this.listFields || [])
  }

  static get listFields() {
    let fields = _.pickBy(this.fields, v => ['html'].includes(v.type))
    fields = _.map(_.keys(fields), v => '-' + v)
    return fields
  }

  user() {
    return this.belongsTo('App/Models/User', 'user_id', '_id')
  }

  async fetchAppends(ctx, appends) {
    for (let key of appends) {
      const getter = 'append' + inflection.classify(key)
      if (this[getter]) {
        this[key] = await this[getter](ctx)
      }
    }
  }
}
