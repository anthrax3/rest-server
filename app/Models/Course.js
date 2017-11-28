'use strict'

const _ = require('lodash')

const Model = require('./Model')
const User = require('./User')
const Post = require('./Post')
const Category = require('./Category')

module.exports = class Course extends Model {

  static get computed() {
    return super.computed.concat(['name'])
  }
  static get objectIDs() {
    return ['_id', 'user_id']
  }

  static get label() {
    return '专辑'
  }

  // setCategoryIds(val) {
  //   val.forEach(v => {
  //     if (typeof v === 'string') {
  //       v = ObjectID()
  //     }
  //   })
  // }

  static get fields() {
    return {
      _id: { sortable: true, searchable: true },
      title: { label: '标题', cols: 4, block: true },
      user_id: {
        label: '所属专家', type: 'select2', ref: "user.username", cols: 4,
        options: this.getOptions('user_id'), searchable: true,
        sortable: true,
      },
      price: { label: '价格', cols: 4, formatter: 'Number', type: 'number' },

      category_ids: {
        label: '所属分类', type: 'select',
        ref: 'categories.name',
        multiple: true,
        cols: 12,
        // size: 10,
        selectSize: 5,
        searchable: true,
        options: this.getOptions('category_ids')
      },

      cover: {
        label: '列表封面图',
        type: 'image',
        accept: 'image/*',
        // limit: {width: 240, height: 240, size: 19 *1024}, //19KB
        cols: 6,
      },
      image: {
        label: '详情页大图',
        type: 'image',
        accept: 'image/*',
        // limit: {width: 240, height: 240, size: 19 *1024}, //19KB
        cols: 6,
        listable: false
      },
      description: { label: '描述', cols: 12, type: 'textarea', listable: false },
      content1: { label: '简介', type: 'html', cols: 3, listable: false },
      content2: { label: '知识核心', type: 'html', cols: 3, listable: false },
      content3: { label: '你将获得', type: 'html', cols: 3, listable: false },
      content4: { label: '免费试听', type: 'html', cols: 3, listable: false },

      created_at: { label: '创建时间' },
    }
  }

  static async buildOptions() {
    this.options = {
      user_id: await User.fetchOptions('_id', 'username', { role_id: 1 }),
      category_ids: await Category.treeOptions('_id', 'name', '专栏分类'),
    }
  }

  static boot() {
    super.boot()

    // this.addHook('afterFetch', async (models) => {
    //   const Server = use('Server')
    //   console.log(Server.Context.auth);
    //   for (let model of models) {
    //     model.is_buy = true
    //     model.collection_count = 10
    //   }
    // })
  }

  getName() {
    return this.title
  }

  getCover(val) {
    return this.uploadUri(val)
  }
  getImage(val) {
    return this.uploadUri(val)
  }

  async appendCollectionCount() {
    const count = await this.actions().where({
      name: 'collection'
    }).count()
    return count || 0
  }

  async appendIsCollected({ auth }) {
    const user = auth.user
    if (!user) {
      return false
    }
    const exist = await user.actions().where({
      actionable_type: this.constructor.name,
      actionable_id: this._id
    }).count()

    return !!exist
  }

  async appendIsBuy({ auth }) {
    const user = auth.user
    if (this.is_free) {
      return true
    }
    if (!user) {
      return false
    }
    const exist = await user.orderItems().where({
      buyable_type: this.constructor.name,
      buyable_id: String(this._id),
      paid_at: { ne: null }
    }).count()

    // console.log(exist);
    return !!exist
  }

  user() {
    return this.belongsTo('App/Models/User', 'user_id', '_id').select(User.listFields)
  }

  categories() {
    return this.referMany('App/Models/Category', '_id', 'category_ids')
  }

  posts() {
    return this.hasMany('App/Models/Post', '_id', 'course_id').select(Post.listFields)
  }

  actions() {
    return this.morphMany('App/Models/Action', 'actionable_type', 'actionable_id')
  }

  collections() {
    return this.morphMany('App/Models/Action', 'actionable_type', 'actionable_id').where({
      name: 'collection'
    })
  }

  comments() {
    return this.manyThrough('App/Models/Post', 'comments', '_id', 'course_id').where({
      is_top: true
    }).with('user').limit(3)
    return this.morphMany('App/Models/Comment', 'commentable_type', 'commentable_id')
  }

  topComments() {
    return this.manyThrough('App/Models/Post', 'comments', '_id', 'course_id').where({
      is_top: true
    })
  }

  /**
   * 获取最新的一条
   */
  post() {
    return this.hasOne('App/Models/Post', '_id', 'course_id').select(Post.listFields).orderBy({
      _id: -1
    })
  }

  sendPush(to, title, extra) {
    const Push = use('Push')
    if (!title) {
      title = this.title
    }
    Push.send(to, title, {
      winName: 'yizhisay-list',
      pageParams: {
        id: String(this._id),
        from: 'push'
      }
    })
  }

}