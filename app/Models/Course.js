'use strict'

const Model = require('./Model')
const User = require('./User')
const Post = require('./Post')
const Category = require('./Category')

module.exports = class Course extends Model {

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

  static async fields() {
    return {
      _id: { sortable: true },
      title: { label: '标题', cols: 4, block: true },
      user_id: {
        label: '所属专家', type: 'select2', ref: "user.username", cols: 4,
        options: await User.options('_id', 'username', { role_id: 1 }), searchable: true,
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
        options: await Category.treeOptions('_id', 'name', '专栏分类')
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

  static get listFields() {
    return '_id title tag subhead user_id category_ids description pv image cover price description created_at'.split(' ')
  }

  static scopeListFields(query) {
    query.select(this.listFields)
  }

  getCover(val) {
    return this.uploadUri(val)
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

  /**
   * 获取最新的一条
   */
  post() {
    return this.hasOne('App/Models/Post', '_id', 'course_id').select(Post.listFields).orderBy({
      _id: -1
    })
  }

}