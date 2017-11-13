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


    await this.syncAds()
    await this.syncAdmin()
    await this.syncCategories()
    await this.syncNews()
    await this.syncUsers()
    await this.syncCourses()
    await this.syncAssoc()
    await this.syncOauth()

    await this.syncOrders()
    await this.syncDevices()
    await this.syncSms()


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
    const profiles = _.keyBy(await t('profiles'), 'user_id')
    data.forEach(v => {
      const profile = profiles[v.id]
      v.password = String(v.password).replace('$2y$', '$2a$')
      v.intro = profile.introduction
      switch (profile.gender) {
        case 'f':
          v.gender = '女'
          break;

      }
      v.gender = profile.gender == 'f' ? '女' : '男'
      v.birthday = profile.birthday == 'null' ? null : profile.birthday
      v.cover = profile.cover
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
    const users = _.keyBy(await c('users').find(), 'id')
    let assoc = await t('course_posts')
    assoc = _.keyBy(assoc, 'post_id')

    await c('courses').delete({})
    await c('posts').delete({})

    const prices = _.keyBy(await t('prices').where({
      priceable_type: 'App\\Models\\Course',
      package_id: 4,
    }), 'priceable_id')

    _.map(courses, v => {
      try {
        v.user_id = users[v.user_id]._id
        v.price = prices[v.id].price / 100
      } catch (e) { }

    })
    await c('courses').insert(courses)

    const newCourses = _.keyBy(await c('courses').find(), 'id')

    posts.forEach(v => {
      try {
        
        v.course_id = ObjectID(newCourses[assoc[v.id].course_id]._id)
        v.user_id = ObjectID(users[v.user_id]._id)
        v.is_free = !!v.is_free
        v.price = price
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

    const getColName = ns => inflection.pluralize(inflection.underscore(ns.split('\\').pop()))

    // await c('properties').insert(props)

    const newProps = _.keyBy(await c('properties').find(), 'name')

    const data = []

    const group = _.mapValues(
      _.groupBy(
        propsAssoc,
        v => getColName(v.propertyable_type)
      ),
      (v, k) => {
        _.mapValues(_.groupBy(v, 'propertyable_id'), async (v, k) => {
          const ids = _.map(v, 'property_id')

          const position = _.get(_.find(newProps['position'].children, { id: ids[0] }), 'title', null)
          const trade = _.get(_.find(newProps['profession'].children, { id: ids[1] }), 'title', null)

          data.push({
            id: parseInt(k),
            position,
            trade
          })

        })
        // console.log();

        // return _.groupBy(v, 'propertyable_id')
      }
    )

    for (let v of data) {
      await c('users').update({
        id: v.id
      }, {
          position: v.position,
          trade: v.trade
        })
    }

  }

  async syncOauth() {
    const data = await t('oauths')
    const users = _.keyBy(await c('users').find(), 'id')
    _.map(data, v => {
      // v.old_user_id = v.user_id
      v.user_id = ObjectID(users[v.user_id]._id)
      v.data = JSON.parse(v.data)
    })
    await c('oauths').delete({})
    await c('oauths').insert(data)
  }

  async syncDevices() {
    const users = _.keyBy(await c('users').find(), 'id')

    const devices = await t('devices')
    _.map(devices, v => {
      try {
        v.user_id = ObjectID(users[v.user_id]._id)
      } catch (e) { }

    })

    await c('devices').delete({})
    await c('devices').insert(devices)
  }

  async syncSms() {
    const sms = await t('sms')
    _.map(sms, v => {
      v.data = JSON.parse(v.data)
    })
    await c('sms').delete({})
    await c('sms').insert(sms)
  }

  async syncOrders() {
    const orders = await t('orders')
    const users = _.keyBy(await c('users').find(), 'id')
    const courses = _.keyBy(await c('courses').find(), 'id')
    const posts = _.keyBy(await c('posts').find(), 'id')

    
    const items = await t('order_items')
    _.map(items, (v) => {
      delete v.user_id
      delete v.package_id
      delete v.price_id

      v.price /= 100
      v.buyable_type = v.buyable_type.replace(/\\/g, '/')
      let buyable_id = null
      switch (v.buyable_type) {
        case 'App/Models/Course':
          buyable_id = ObjectID(courses[v.buyable_id]._id)
          break;
        case 'App/Models/Post':
          buyable_id = ObjectID(posts[v.buyable_id]._id)
          break;
        
      }
      v.buyable_id = buyable_id
    })
    const groupedItems = _.groupBy(items, 'order_id')

    _.map(orders, v => {
      try {
        delete v.package_id
        v.total /= 100
        v.user_id = ObjectID(users[v.user_id]._id)
        // v.items = groupedItems[v.id]
      } catch (e) {

      }
    })
    await c('orders').delete({})
    await c('orders').insert(orders)

    const newOrders = _.keyBy(await c('orders').find(), 'id')

    _.map(items, v => {
      try {
        v.order_id = ObjectID(newOrders[v.order_id]._id)
      } catch (e) {
        
      }
    })

    await c('order_items').delete({})
    await c('order_items').insert(items)

    const payLogs = await t('paylogs')
    _.map(payLogs, v => {
      v.data = JSON.parse(v.data)
      let order_id = null
      if (v.data.productId) {
        order_id = parseInt(v.data.productId.match(/_(\d+)$/).pop())
      } else if (v.data.optional) {
        order_id = parseInt(v.data.optional.order_id)
      }

      if (order_id && newOrders[order_id]) {
        v.order_id = ObjectID(newOrders[order_id]._id)
      }
      
    })
    await c('pay_logs').delete({})
    await c('pay_logs').insert(payLogs)
  }


}
