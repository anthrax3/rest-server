'use strict'

const inflection = require('inflection')

class Resource {
  async handle (ctx, next) {
    const { request, auth, params } = ctx
    // call next to advance the request
    const resource = params.resource
    if (resource) {
      const Model = use('App/Models/' + inflection.classify(resource))
      if (params.id) {
        const model = await Model.findOrFail(params.id)
        ctx.model = model
      }
      let query = request.input('query', {})
      if (typeof query === 'string') {
        query = JSON.parse(query)
      }

      Model.getChoices = async () => {
        if (Model.choices) {
          let choices = await Model.choices()
          return _.mapValues(choices, field => _.map(field, (text , value) => ({text, value})))
        }
        return {}
      }

      ctx.query = query
      ctx.resource = resource
      ctx.Model = Model
      
    }
    
    await next()
  }
}

module.exports = Resource
