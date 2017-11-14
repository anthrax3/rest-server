'use strict'

const _ = require('lodash')
const Helpers = use('Helpers')
const Config = use('Config')
const Drive = use('Drive')
const { HttpException } = require('@adonisjs/generic-exceptions')

module.exports = class ResourceController {

  async index({ request, Model, query }) {
    return Model.query(query).paginate(query.page, query.perPage)
  }

  async grid({ request, Model }) {
    const searchFields = _.pickBy(await Model.fields(), 'searchable')
    const fields = await Model.fields()
    return {
      searchFields: searchFields,
      searchModel: _.mapValues(searchFields, v => null),
      fields: _.omitBy(fields, (v, k) => v.listable === false)
    }
  }

  async form({ request, Model, model }) {
    return {
      labels: await Model.labels(),
      fields: _.omitBy(await Model.fields(), (v, k) => v.editable === false || ['_id', 'created_at', 'updated_at', 'actions'].includes(k)),
      model: model,
    }
  }
  async view({ request, Model, model }) {
    return {
      labels: await Model.labels(),
      fields: _.omitBy(await Model.fields(), (v, k) => v.viewable === false || ['actions'].includes(k)),
      model: model,
    }
  }

  async store({ request, auth, Model, model }) {
    const data = request.all()
    await model.validate(data)
    model.fill(data)
    await model.save()
    return model
  }

  async show({ request, auth, Model, model }) {
    return model
  }

  async update({ request, auth, Model, model, validate }) {
    let data = request.all()
    await model.validate(data)
    model.merge(data)
    await model.save()
    return model
  }

  async destroy({ request, auth, Model, model, validate }) {
    await model.delete()
    return {
      success: true
    }
  }

  async choices({ request }) {

  }

  async stat({ request, auth, Model }) {
    const group = request.input('group', 'os')
    const data = _.mapValues(_.keyBy(await Model.count(group), '_id'), 'count')
    
    return {
      labels: _.keys(data),
      datasets: [
        {
          backgroundColor: [
            '#41B883',
            '#E46651',
            '#00D8FF',
            '#DD1B16'
          ],
          data: _.values(data)
        }
      ]
    }
  }

}