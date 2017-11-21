'use strict'

const _ = require('lodash')
const Helpers = use('Helpers')
const Config = use('Config')
const Drive = use('Drive')
const inflection = require('inflection')
const { HttpException } = require('@adonisjs/generic-exceptions')

module.exports = class ResourceController {

  async processData(ctx, query, data) {
    const { params, auth } = ctx
    if (query.appends) {
      for (let row of data.rows) {
        for (let key of query.appends) {
          const getter = 'append' + inflection.classify(key)
          if (row[getter]) {
            row[key] = await row[getter](ctx)
          }
        }
      }
    }
    return data
  }

  async processQuery({ params, model, auth }, query) {
    const resource = params.resource
    const apiConfig =  Config.get('api')
    const resourceConfig = _.get(apiConfig, `resources.${resource}`, {})
    
    if (resourceConfig.auth) {
      if (!auth.user) {
        throw new HttpException('请先登录', 401)
      }
      if (!query.where) {
        query.where = {}
      }
      query.where.user_id = auth.user._id
    }
    switch (resource) {
      case 'courses':
        query = await this.buildCoursesQuery(query)
        break;
    }

    
    if (model._id) {
      //show
      const defaultQuery = _.get(resourceConfig, `query.show`, {})
      query = _.defaultsDeep({}, defaultQuery, query)
    } else {
      //index
      const defaultQuery = _.get(resourceConfig, `query.index`, {})
      query = _.defaultsDeep({}, defaultQuery, query)
    }
    
    
    return query
  }

  async index(ctx) {
    let { request, Model, query, params, auth } = ctx
    
    const { page = 1, perPage = 20 } = query
    const offset = (page - 1) * perPage
    const limit = perPage
    query = await this.processQuery(ctx, query)
    
    let data = await Model.query(query).listFields().skip(offset).limit(limit).fetch()
    data = await this.processData(ctx, query, data)
    return data
  }

  async show({ request, auth, Model, model }) {
    return model
  }

  async buildCoursesQuery(query) {
    const Category = use('App/Models/Category')
    const { category } = query.where || {}
    if (category) {
      const parent = await Category.findBy({ key: category })
      const cats = await Category.where({ parent_id: parent._id }).fetch()
      const ids = _.map(cats.toJSON(), '_id')
      ids.push(parent._id)
      delete query.where.category
      query.where.category_ids = { in: ids }
    }
    return query
  }

}