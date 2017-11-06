'use strict'

const _ = require('lodash')

module.exports = class ResourceController {

  async index ({request, Model, query}) {
    return Model.query(query).paginate(query.page, query.perPage)
  }

  async grid ({request, Model}) {
    return {
      fields: _.omitBy(await Model.fields(), v => v.listable === false)
    }
  }

  async form ({request, Model, model}) {
    return {
      fields: _.omitBy(await Model.fields(), v => v.editable === false),
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