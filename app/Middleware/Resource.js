'use strict'

const inflection = require('inflection')
const _ = require('lodash')
const { HttpException } = require('@adonisjs/generic-exceptions')

class Resource {
  async handle(ctx, next) {
    const { request, auth, params, query } = ctx

    const resource = params.resource
    if (resource) {
      let className = inflection.classify(resource)
      if (['sms'].includes(resource)) {
        //no need to singularize
        className = inflection.camelize(resource)
      }
      const Model = use('App/Models/' + className)

      if (params.id) {

        const ret = await Model.query(query).limit(1).fetch()
        if (ret.rows.length < 1) {
          throw new HttpException('模型不存在', 404)
        }
        const model = ret.rows[0]
        
        if (query.appends) {
          await model.fetchAppends(ctx, query.appends)
        }
        ctx.model = model
        
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

      ctx.resource = resource
      ctx.Model = Model

    }

    await next()
  }
}

module.exports = Resource
