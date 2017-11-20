'use strict'

const inflection = require('inflection')
const _ = require('lodash')
const { HttpException } = require('@adonisjs/generic-exceptions')

class Resource {
  async handle(ctx, next) {
    const { request, auth, params } = ctx
    // call next to advance the request

    const resource = params.resource
    if (resource) {
      let className = inflection.classify(resource)
      if (['sms'].includes(resource)) {
        //no need to singularize
        className = inflection.camelize(resource)
      }
      const Model = use('App/Models/' + className)

      let query = request.input('query', {})
      if (typeof query === 'string') {
        query = JSON.parse(query)
      }

      if (params.id) {
        let where = {
          _id: params.id
        }
        if (params.id.length != 24) {
          where = {
            or: [{ name: params.id }, { key: params.id }]
          }
        }

        const ret = await Model.query(query).where(where).limit(1).fetch()
        if (ret.rows.length < 1) {
          throw new HttpException('模型不存在', 404)
        }
        ctx.model = ret.rows[0]
        //因.firstOrFail()方法不支持morphTo关联，故用fetch和row[0]代替
      } else {
        ctx.model = new Model
      }

      Model.getChoices = async () => {
        if (Model.choices) {
          let choices = await Model.choices()
          return _.mapValues(choices, field => _.map(field, (text, value) => ({ text, value })))
        }
        return {}
      }

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
        if (_.isArray(v)) {
          query.where[k] = { in: v }
        }
      })
      // console.log(query.where);
      ctx.query = query
      ctx.resource = resource
      ctx.Model = Model

    }

    await next()
  }
}

module.exports = Resource
