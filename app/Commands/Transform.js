'use strict'

const { Command } = require('@adonisjs/ace')
const { ioc } = require('@adonisjs/fold')
const _ = require('lodash')
const inflection = require('inflection')
const { ObjectID } = require('mongodb')
const arrayToTree = require('array-to-tree')

ioc.singleton('Adonis/Raw/Database', (app) => {
  const Config = app.use('Adonis/Src/Config')
  const Database = require('@adonisjs/lucid/src/Database/Manager')
  return new Database(Config)
})

const db = use('Adonis/Raw/Database').connection('old') //之前的MYSQL数据库
const db2 = use('Database') //现在的MongoDB数据库
const t = name => db.table(name)
const c = name => db2.collection(name)

module.exports = class Transform extends Command {
  static get signature() {
    return 'transform'
  }

  static get description() {
    return '一值数据库迁移程序'
  }

  async handle(args, options) {
    const tables = await db.raw('show tables')


    // await this.syncAds()
    // await this.syncAdmin()
    // await this.syncCategories()
    // await this.syncNews()
    // await this.syncUsers()
    // await this.syncCourses()
    await this.syncAssoc()

    db.close()
    db2.close()
    this.success('操作成功!')
  }

  async syncAds() {
    let ads = await t('ads')
    let adItems = await t('ad_items')
    adItems = _.groupBy(adItems, 'ad_id')
    _.map(ads, v => {
      v.items = adItems[v.id]
    })
    // console.log(ads);
    await c('ads').delete({})
    await c('ads').insert(ads)
  }

  async syncAdmin() {
    const data = await t('admin_users')
    data.forEach(v => {
      v.password = String(v.password).replace('$2y$', '$2a$')
    })
    await c('admin_users').delete({})
    await c('admin_users').insert(data)
  }

  async syncCategories() {
    const cats = await t('categories')
    await c('categories').delete({})
    await c('categories').insert(cats)
    let newCats = await c('categories').find()

    newCats.forEach(v => {
      if (!v.parent_id) {
        return true
      }
      const item = _.find(newCats, { id: v.parent_id })
      v.parent_id = ObjectID(item._id)
    })
    await c('categories').delete({})
    await c('categories').insert(newCats)
  }

  async syncUsers() {
    const data = await t('users')
    data.forEach(v => {
      v.password = String(v.password).replace('$2y$', '$2a$')
    })
    await c('users').delete({})
    await c('users').insert(data)
  }

  async syncNews() {
    const news = await t('news')
    const presses = await t('presses')
    const readings = await t('readings')

    await c('news').delete({})
    await c('presses').delete({})
    await c('readings').delete({})

    await c('news').insert(news)

    const newNews = await c('news').find()
    presses.forEach(v => {
      v.news_id = _.find(news, { id: v.news_id })._id
    })


    await c('presses').insert(presses)
    await c('readings').insert(readings)
  }

  async syncCourses() {
    const courses = await t('courses')
    const posts = await t('posts')
    let assoc = await t('course_posts')
    assoc = _.keyBy(assoc, 'post_id')

    await c('courses').delete({})
    await c('posts').delete({})

    await c('courses').insert(courses)

    const newCourses = await c('courses').find()
    const users = await c('users').find()

    posts.forEach(v => {

      try {
        const item = _.find(newCourses, { id: assoc[v.id].course_id })
        v.course_id = ObjectID(item._id)
        v.user_id = ObjectID(_.find(users, { id: v.user_id })._id)
        v.is_free = !!v.is_free
      } catch (e) { }
    })

    await c('posts').insert(posts)
  }

  async syncAssoc() {
    // const cats = await c('categories')
    // const catsAssoc = await t('categoryables')

    const props = await t('properties')
    const propsAssoc = await t('propertyables')

    _.mapValues(props, v => {
      delete v.created_at
      delete v.updated_at
      delete v.description
      // delete v.name
    })

    // console.dir(arrayToTree(props))
    await c('properties').delete({})
    await c('properties').insert(arrayToTree(props))

    log(arrayToTree(props))
    
    return

    const getColName = ns => inflection.pluralize(inflection.underscore(ns.split('\\').pop()))

    // await c('properties').insert(props)

    const newProps = await c('properties')

    const group = _.mapValues(
      _.groupBy(
        propsAssoc,
        v => getColName(v.propertyable_type)
      ),
      (v, k) => {
        const data = _.mapValues(_.groupBy(v, 'propertyable_id'), v => _.map(v, 'property_id'))
        console.log(data);
        
        // return _.groupBy(v, 'propertyable_id')
      }
    )
    // return console.log(group);

    // _.mapValues(group, async (row, col) => {

    // })
    // catsAssoc.forEach(v => {
    //   const colName = getColName(v.categoryable_type)
    //   const cat = _.find(cats, {id: v.category_id})
    //   await c(colName).update({
    //     id: v.cateoryable_id
    //   }, {
    //     categories: [cat]
    //   })
    // })
    // const newCatsAssoc = []
    // propsAssoc.forEach(v => {
    //   newCatsAssoc.push()
    // })
    // propsAssoc.forEach(v => {
    //   const colName = getColName(v.propertyable_type)
    //   const cat = _.find(cats, {id: v.property_id})
    //   await c(colName).update({
    //     id: v.propertyable_id
    //   }, {
    //     properties: [cat]
    //   })
    // })



  }
}
