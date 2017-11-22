'use strict'

const _ = require('lodash')
const Helpers = use('Helpers')
const Config = use('Config')
const Drive = use('Drive')
const Post = use('App/Models/Post')
const Option = use('App/Models/Option')

const { HttpException } = require('@adonisjs/generic-exceptions')
const BaseController = require('./ResourceController')

module.exports = class PostController extends BaseController {

  async recommends({ params, query }) {
    const recommend = await Option.get('recommend')
    const ids = recommend[params.name]
    let whereId = recommend[params.name]
    if (_.isArray(ids)) {
      whereId = { in: recommend[params.name] }
    }
    const finder = Post.query(query).listFields().where({
      _id: whereId
    }).with(['course.categories', 'user'])
    if (_.isArray(ids)) {
      return await finder.fetch()
    } else {
      return await finder.first()
    }

  }

  async comments({ request, query }) {

  }

}