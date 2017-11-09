'use strict'

const inflection = require('inflection')
const _ = require('lodash')


class Resource {
  async handle(ctx, next) {
    const { request, auth, params } = ctx
    // call next to advance the request

    const resource = params.resource
    if (resource) {
      const Model = use('App/Models/' + inflection.classify(resource))
      if (params.id) {
        ctx.model = await Model.findOrFail(params.id)
      } else {
        ctx.model = new Model
      }
      let query = request.input('query', {})
      if (typeof query === 'string') {
        query = JSON.parse(query)
      }

      Model.getChoices = async () => {
        if (Model.choices) {
          let choices = await Model.choices()
          return _.mapValues(choices, field => _.map(field, (text, value) => ({ text, value })))
        }
        return {}
      }

      _.mapValues(query.where, (v, k) => {
        if (v === '' || v === null) {
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
        if (typeof v === 'string' && !Model.objectIDs.includes(k)) {

          query.where[k] = new RegExp(v, 'i')
        }
      })
      console.log(query.where);


      ctx.query = query
      ctx.resource = resource
      ctx.Model = Model

    }

    await next()
  }
}

module.exports = Resource
