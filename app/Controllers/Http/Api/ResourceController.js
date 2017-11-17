'use strict'

const _ = require('lodash')
const Helpers = use('Helpers')
const Config = use('Config')
const Drive = use('Drive')
const { HttpException } = require('@adonisjs/generic-exceptions')

module.exports = class ResourceController {

  async index({ request, Model, query, params }) {
    const { page = 1, perPage = 20 } = query
    const offset = (page - 1) * perPage
    const limit = perPage
    switch (params.resource) {
      case 'courses':
        query = await this.buildCoursesQuery(query)
        break;
    }
    const data = await Model.query(query).listFields().skip(offset).limit(limit).fetch()
    return data
  }

  async show({ request, auth, Model, model }) {
    return model
  }

  async buildCoursesQuery(query) {
    const Category = use('App/Models/Category')
    const { category } = query.where || {}
    if (category) {
      const parent = await Category.findBy({key: category})
      const cats = await Category.where({parent_id: parent._id}).fetch()
      const ids = _.map(cats.toJSON(), '_id')
      ids.push(parent._id)
      delete query.where.category
      query.where.category_ids = {in: ids}
    }
    return query
  }

}