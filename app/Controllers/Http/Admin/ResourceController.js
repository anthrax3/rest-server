'use strict'

const _ = require('lodash')
const Helpers = use('Helpers')
const Config = use('Config')
const Drive = use('Drive')
const { HttpException } = require('@adonisjs/generic-exceptions')

module.exports = class ResourceController {

  async processData(ctx, query, data) {
    const { params, auth } = ctx
    if (query.appends) {
      for (let row of data.rows) {
        await row.fetchAppends(ctx, query.appends)
      }
    }
    return data
  }

  async index(ctx) {
    const { request, Model, query } = ctx
    const fields = _.omitBy(Model.fields, (v, k) => v.listable === false)
    const { page, perPage = 20 } = query
    const offset = (page - 1) * perPage
    const limit = perPage
    let data = await Model.query(query).select(Object.keys(fields)).skip(offset).limit(limit).fetch()
    const total = await Model.query(query).count()
    const lastPage = Math.ceil(total / perPage)
    data = await this.processData(ctx, query, data)

    return {
      page,
      perPage,
      total,
      lastPage,
      data
    }
  }

  async grid({ request, Model }) {
    await Model.buildOptions()
    const searchFields = _.pickBy(Model.fields, 'searchable')
    const fields = _.omitBy(Model.fields, (v, k) => v.listable === false)
    return {
      searchFields: searchFields,
      searchModel: _.mapValues(searchFields, v => null),
      fields: fields
    }
  }

  async form({ request, Model, model, auth }) {
    await Model.buildOptions()
    const fields = _.omitBy(Model.fields, (v, k) => {
      const ignoredFields = [
        '_id', 'created_at', 'updated_at', 'actions'
      ]
      return v.editable === false || ignoredFields.includes(k) || !auth.current.user.isRole(v.role)
    })
    return {
      labels: await Model.labels(),
      fields: fields,
      model: model,
    }
  }
  async view({ request, Model, model }) {
    await Model.buildOptions()
    return {
      labels: await Model.labels(),
      fields: _.omitBy(Model.fields, (v, k) => v.viewable === false || ['actions'].includes(k)),
      model: model,
    }
  }

  async store({ request, auth, Model, model }) {
    const fields = Model.fields
    const data = _.omitBy(request.all(), (v, k) => !auth.current.user.isRole(fields[k].role))
    
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
    let { text = 'name', value = '_id', where = '{}' } = request.all()
    where = JSON.parse(where)
    if (where[text]) {
      where[text] = new RegExp(where[text], 'i')
    }
    return await Model.fetchOptions(value, text, where)
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