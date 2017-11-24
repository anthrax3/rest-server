'use strict'

const inflection = require('inflection')
const _ = require('lodash')
const { HttpException } = require('@adonisjs/generic-exceptions')
const Option = use('App/Models/Option')
const Config = use('Config')

class Query {
  async handle (ctx, next, param) {

    const { request, params } = ctx
    // call next to advance the request

    const resource = params.resource

    let query = request.input('query', {})
    if (typeof query === 'string') {
      query = JSON.parse(query)
    }
    if(!query.where) {
      query.where = {}
    }

    if (_.isString(query.perPage)) {
      const pagesize = await Option.get('pagesize', 'name', 'value')
      query.perPage = parseInt(pagesize[query.perPage]) || 10
    }

    query.page = Math.max(toNumber(query.page, 1), 1)
    query.perPage = Math.min(Math.max(toNumber(query.perPage, 10), 1), 25)

    _.mapValues(query.where, (v, k) => {
      if (v === '' || v === null || _.isEqual(v, []) || _.isEqual(v, [null])) {
        return delete query.where[k]
      }
      const isDate = ['created_at', 'updated_at'].includes(k)
      if (isDate) {
        // v = _.map(v, d => d.replace(/(\d{4}-\d{2}-\d{2})/, '$1'))
        let [begin, end] = v
        if (!end) {
          end = begin + 1
        }
        query.where[k] = { gte: begin, lte: end }
        return
      }
      if (_.isString(v) && v.includes('regexp:')) {

        query.where[k] = new RegExp(v.replace('regexp:', ''), 'i')
      }
      if (_.isArray(v) && !_.isObject(v[0])) {
        query.where[k] = { in: v }
      }
    })

    if (params.id) {
      let where = {
        _id: params.id
      }
      if (params.id.length != 24) {
        where = {
          or: [{ name: params.id }, { key: params.id }]
        }
      }
      query.where = _.defaultsDeep({}, query.where, where)
    }

    
    if(param) {
      const apiConfig = Config.get(param)
      const resourceConfig = _.get(apiConfig, `resources.${resource}`, {})
  
      if (resourceConfig.auth) {
        if (!auth.user) {
          throw new HttpException('请先登录', 401)
        }
        if (!query.where) {
          query.where = {}
        }
        query.where.user_id = auth.user._id
      }
      
  
  
      if (params.id) {
        //show
        const defaultQuery = _.get(resourceConfig, `query.show`, {})
        query = _.defaultsDeep({}, defaultQuery, query)
      } else {
        //index
        const defaultQuery = _.get(resourceConfig, `query.index`, {})
        query = _.defaultsDeep({}, defaultQuery, query)
      }
    }

    ctx.query = query

    await next()
  }
}

module.exports = Query
