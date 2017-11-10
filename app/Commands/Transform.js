'use strict'

const { Command } = require('@adonisjs/ace')
const { ioc } = require('@adonisjs/fold')
const _ = require('lodash')
const { ObjectID } = require('mongodb')

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

    // await this.syncUsers()
    await this.syncCourses()

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
    await c('admin_users').insert(await t('admin_users'))
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
      if (v.password) {
        v.password = v.password.replace('$2y$', '$2a$')
      }
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

    const newCourses = await c('courses').insert(courses)

    posts.forEach(v => {
      const item = _.find(newCourses, {id: assoc[v.id].course_id})
      v.course_id = ObjectID(item._id)
    })

    await c('posts').insert(posts)
  }
}
