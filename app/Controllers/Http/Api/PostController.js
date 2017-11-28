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

  async recommends(ctx) {
    const { params, query } = ctx
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
      const posts = await finder.fetch()
      for(let post of posts.rows) {
        await post.fetchAppends(ctx, ['is_buy'])
      }
      return posts
    } else {
      const post = await finder.first()
      await post.fetchAppends(ctx, ['is_buy'])
      return post
    }

  }

  async comments({ request, query }) {

  }

}