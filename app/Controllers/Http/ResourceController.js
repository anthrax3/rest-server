'use strict'

const _ = require('lodash')

class ResourceController {

  async index ({request, Model, query}) {

    return Model.query(query).paginate(query.page, query.perPage)
  }
  
  formatChoices(choices){
    return _.mapValues(choices, field => _.map(field, (text , value) => ({text, value})))
  }

  async grid ({request, Model}) {
    return {
      choices: this.formatChoices(await Model.choices()),
      fields: _.omitBy(Model.fields, v => {
        return v.listable === false
      })
    }
  }

  async form ({request, Model, model}) {
    return {
      choices: this.formatChoices(await Model.choices()),
      fields: _.omitBy(Model.fields, v => {
        return v.editable === false
      }),
      model: model
    }
  }

  async store ({request, auth, Model, model}) {
    return model
  }

  async show ({model}) {
    return model.toJSON()
  }

  async update ({request, auth, Model, model}) {
    return model
  }

  async delete () {
  }

  async choices ({request}) {

  }
}

module.exports = ResourceController
