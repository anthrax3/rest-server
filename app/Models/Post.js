'use strict'

const Model = require('./Model')
const User = use('App/Models/User')
const Course = use('App/Models/Course')
const Category = use('App/Models/Category')
const Config = use('Config')

module.exports = class Post extends Model {
  static get objectIDs() {
    return ['course_id', 'property_ids', 'user_id', '_id']
  }
  static get label() {
    return '一条'
  }
  static get fields() {
    return {
      _id: { sortable: true },

      course_id: {
        label: '所属专辑', type: 'select2', ref: "course.title", cols: 4,
        options: this.getOptions('course_id'), searchable: true,
        sortable: true
      },
      user_id: {
        label: '所属专家', type: 'select2', ref: "user.username", cols: 4,
        options: this.getOptions('user_id'), searchable: true,
        sortable: true
      },

      title: { label: '标题', searchable: true, cols: 4, },

      price: { label: '价格', cols: 3, formatter: 'Number', type: 'number' },
      is_book: { label: '是否为书', type: 'switch', cols: 3 },
      is_free: { label: '是否免费', type: 'switch', cols: 3, },
      duration: { label: '时长(秒)', type: 'number', cols: 3, formatter: 'Number' },


      category_ids: {
        label: '所属分类', type: 'select',
        ref: 'categories.name',
        multiple: true,
        cols: 12,
        // size: 10,
        selectSize: 5,
        searchable: true,
        options: this.getOptions('category_ids'),
        showWhen: 'is_book'
      },

      image: { label: '图片', type: 'image', cols: 6, },
      voice: { label: '语音', type: 'audio', cols: 6, listable: false },
      description: { label: '描述', type: 'textarea', listable: false, cols: 12, },
      content: { label: '详情', type: 'html', listable: false, cols: 6, },
      created_at: { label: '创建时间' },
    }
  }

  static async buildOptions() {
    const User = use('App/Models/User')
    const Course = use('App/Models/Course')
    const Category = use('App/Models/Category')
    this.options = {
      course_id: await Course.fetchOptions('_id', 'title'),
      category_ids: await Category.treeOptions('_id', 'name', '书籍分类'),
      user_id: await User.fetchOptions('_id', 'username', { role_id: 1 }),
    }
  }

  getCover(val) {
    return this.uploadUri(val)
  }

  getImage(val) {
    return this.uploadUri(val)
  }

  getVoice(val) {
    return this.uploadUri(val)
  }

  async appendCollectionCount() {
    const count = await this.actions().where({
      name: 'collection'
    }).count()
    return count || 0
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
      buyable_id: this._id,
      started_at: { ne: null }
    }).count()
    
    return !!exist
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

  course() {
    return this.belongsTo('App/Models/Course', 'course_id', '_id').listFields()
  }

  user() {
    return this.belongsTo('App/Models/User', 'user_id', '_id').select(User.listFields)
  }

  categories() {
    return this.referMany('App/Models/Category', '_id', 'category_ids')
  }

  properties() {
    return this.referMany('App/Models/Property', '_id', 'property_ids')
  }

  comments() {
    return this.morphMany('App/Models/Comment', 'commentable_type', 'commentable_id').with('user').orderBy('-_id')
  }

  actions() {
    return this.morphMany('App/Models/Action', 'actionable_type', 'actionable_id')
  }

}