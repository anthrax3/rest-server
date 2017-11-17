'use strict'

const _ = require('lodash')
const Helpers = use('Helpers')
const Config = use('Config')
const Drive = use('Drive')
const { HttpException } = require('@adonisjs/generic-exceptions')

module.exports = class ResourceController {

  async index({ request, Model, query }) {
    const fields = _.omitBy(await Model.fields(), (v, k) => v.listable === false)
    const { page, perPage = 20 } = query
    const offset = (page - 1) * perPage
    const limit = perPage
    const data = await Model.query(query).select(Object.keys(fields)).skip(offset).limit(limit).fetch()
    const total = await Model.query(query).count()
    const lastPage = Math.ceil(total / perPage)
    return {
      page,
      perPage,
      total,
      lastPage,
      data
    }
  }

  async grid({ request, Model }) {
    const searchFields = _.pickBy(await Model.fields(), 'searchable')
    const fields = _.omitBy(await Model.fields(), (v, k) => v.listable === false)
    return {
      searchFields: searchFields,
      searchModel: _.mapValues(searchFields, v => null),
      fields: fields
    }
  }

  async form({ request, Model, model, auth }) {
    console.log(auth.user.role);
    const fields = _.omitBy(await Model.fields(), (v, k) => {
      const ignoredFields = [
        '_id', 'created_at', 'updated_at', 'actions'
      ]
      return v.editable === false || ignoredFields.includes(k) || !auth.user.isRole(v.role)
    })
    return {
      labels: await Model.labels(),
      fields: fields,
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
    const fields = await Model.fields()
    const data = _.omitBy(request.all(), (v, k) => !auth.user.isRole(fields[k].role))
    
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

  async options({ request, Model }) {
    const { text = 'name', value = '_id', where = '{}' } = request.all()
    return await Model.options(value, text, JSON.parse(where))
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