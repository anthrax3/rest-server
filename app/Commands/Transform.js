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
const db2 = use('Database').connection('mongodb') //现在的MongoDB数据库
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
    await db2.connect()
    // const tables = await db.raw('show tables')

    // await this.syncNews()


    await this.syncAdmin()
    await this.syncCategories()

    await this.syncUsers()
    await this.syncOauth()
    await this.syncCourses()
    await this.syncComments()
    await this.syncAds()

    await this.syncVouchers()
    await this.syncOptions()
    await this.syncActions()
    await this.syncAssoc()
    await this.syncOrders()

    await this.syncDevices()

    await this.syncSms()

    // await this.createIndexes()

    db.close()
    db2.close()
    this.success('操作成功!')
  }

  async list(collection, lhs = 'id', rhs = '_id') {
    let ret = _.keyBy(await c(collection).find(), lhs)
    if (rhs) {
      ret = _.mapValues(ret, rhs)
    }
    return ret
  }

  async insert(collection, data, preserve = false) {
    if (!preserve) {
      await c(collection).delete({})
    }
    await c(collection).insert(data)
  }

  async createIndexes() {
    const c = name => db2.connection.collection(name)
    c('categories').createIndex({ parent_id: 1 })
    c('users').createIndex({ role_id: 1, created_at: -1 })
    c('users').createIndex({ mobile: 1 })
    c('courses').createIndex({ category_ids: 1, user_id: 1 })
    c('posts').createIndex({
      category_ids: 1, user_id: 1, course_id: 1, is_book: 1, is_free: 1, sort: 1
    })
    c('oauths').createIndex({ user_id: 1, type: 1 })
    c('devices').createIndex({ os: 1, version: 1, model: 1, user_id: 1 })
    c('sms').createIndex({ mobile: 1, msg_id: 1 })
    c('orders').createIndex({ no: 1, user_id: 1, paid_at: 1, created_at: -1 })
    c('order_items').createIndex({
      order_id: 1, user_id: 1, started_at: -1, expired_at: -1, created_at: -1
    })
    c('pay_logs').createIndex({ order_id: 1, transaction_id: 1 })
    c('vouchers').createIndex({ code: 1, used_at: 1, mobile: 1, user_id: 1 })
    c('actions').createIndex({ name: 1, actionable_type: 1, actionable_id: 1, user_id: 1 })
    c('comments').createIndex({
      commentable_type: 1, commentable_id: 1, user_id: 1, is_top: 1
    })
    c('admin_users').createIndex({ role: 1 })

  }

  async syncOptions() {
    const book = await c('posts').where({
      id: 17
    }).first()
    const options = [
      {
        name: "recommend",
        title: "内容推荐",
        fields: JSON.stringify({
          "home_book": {
            "label": "首页听本书推荐", "type": "select",
            "ajaxOptions": {
              "resource": "posts", "text": "title", "value": "_id", "where": { "is_book": true }
            }
          },
          "books_book": {
            "label": "书籍页面-主编推荐", "type": "select",
            "ajaxOptions": {
              "resource": "posts", "text": "title", "value": "_id", "where": { "is_book": true }
            }
          },
        }),
        data: {
          title: "一值财经",
          home_book: String(book._id),
          books_book: String(book._id)
        }
      },
      {
        name: "pagesize",
        title: "分页设置",
        fields: JSON.stringify({ "name": { "label": "名称" }, "title": { "label": "描述" }, "value": { "label": "分页大小(条)", "type": "number", "formatter": "Number" } }),
        isArray: true,
        isTable: true,
        data: [
          { name: "home_courses", title: "首页专栏列表", value: 5 },
          { name: "home_posts", title: "首页一值头条", value: 2 },
        ]
      },
      {
        name: "adminMenu",
        title: "后台菜单",
        fields: JSON.stringify({ "name": { "label": "名称" }, "url": { "label": "URL" }, "icon": { "label": "图标" }, "title": { "label": "是否为标题", "type": "switch" } }),
        isArray: true,
        isTable: true,
        data: [
          {
            name: '首页',
            url: '/',
            icon: 'icon-home',
          },
          {
            title: true,
            name: '内容管理',
          },
          {
            name: '专栏',
            url: '/rest/courses',
            icon: 'icon-notebook',
          },
          {
            name: '一条',
            url: '/rest/posts',
            icon: 'icon-control-play',
          },
          {
            name: '书',
            url: '/rest/posts?query={"where":{"is_book":true}}',
            icon: 'icon-control-play',
          },

          {
            title: true,
            name: '运营管理',
          },
          {
            name: '兑换码',
            url: '/rest/vouchers',
            icon: 'icon-key',
          },
          {
            name: '订单',
            url: '/rest/orders',
            icon: 'icon-basket',
          },
          {
            name: '已售',
            url: '/rest/order_items',
            icon: 'icon-basket',
          },
          {
            name: '评论',
            url: '/rest/comments',
            icon: 'icon-bubble',
          },
          {
            name: '用户',
            url: '/rest/users',
            icon: 'icon-people',
          },

          {
            name: '第三方账号',
            url: '/rest/oauths',
            icon: 'icon-people',
          },
          {
            name: '广告',
            url: '/rest/ads',
            icon: 'icon-camera',
          },

          {
            title: true,
            name: '系统设置',
          },

          {
            name: '系统配置',
            url: '/rest/options',
            icon: 'icon-settings',
          },
          {
            name: '属性管理',
            url: '/rest/properties',
            icon: 'icon-puzzle',
          },

          {
            name: '分类管理',
            url: '/rest/categories',
            icon: 'icon-menu',
          },
          {
            name: '管理员',
            url: '/rest/admin_users',
            icon: 'icon-people',
          },
          {
            name: '注销',
            url: '/login',
            icon: 'icon-login',
          },

          {
            title: true,
            name: '底层数据',
          },
          {
            name: '设备',
            url: '/rest/devices',
            icon: 'icon-screen-smartphone',
          },
          {
            name: '短信记录',
            url: '/rest/sms',
            icon: 'icon-screen-smartphone',
          },
          {
            name: '支付记录',
            url: '/rest/pay_logs',
            icon: 'icon-list',
          }
        ]
      },
    ]
    await this.insert('options', options)
  }

  async syncAds() {
    let ads = await t('ads')
    let adItems = await t('ad_items')
    const newCourses = await this.list('courses')
    adItems = _.groupBy(adItems, 'ad_id')
    _.map(ads, v => {
      v.items = adItems[v.id]
      if (!v.items) {
        return
      }
      v.items.forEach(item => {
        if (String(item.link).match(/^course:/i)) {
          const course_id = item.link.split(':').pop()
          item.course_id = newCourses[course_id]
        }
      })
    })
    // console.log(ads);

    await this.insert('ads', ads)
  }

  async syncAdmin() {
    const data = await t('admin_users')
    data.forEach(v => {
      if (!v.avatar) {
        v.avatar = 'admin/images/一值启动图标512x512 - 副本.jpg'
      }
      v.role = 'admin'
      v.password = String(v.password).replace('$2y$', '$2a$')
    })
    data.unshift({
      username: 'admin',
      password: await use('Hash').make('123456'),
      avatar: 'http://ozegq4sdx.bkt.clouddn.com/avatar/8.jpg',
      role: 'system'
    })

    await this.insert('admin_users', data)
  }

  async syncCategories() {
    const cats = [
      { id: 1, name: '专栏分类', key: 'course' },
      { id: 2, name: '书籍分类', key: 'book' },
      { id: 3, name: '反馈建议', key: 'feedback' },

      { id: 100, name: '职场', key: 'b', parent_id: 1 },
      { id: 200, name: '用户', key: 'c', parent_id: 1 },

      { name: '期货', parent_id: 100 },
      { name: '证券', parent_id: 100 },
      { name: '银行', parent_id: 100 },
      { name: '外汇', parent_id: 100 },
      { name: '基金', parent_id: 100 },
      { name: '保险', parent_id: 100 },
      { name: '信托', parent_id: 100 },
      { name: 'P2P', parent_id: 100 },

      { name: '期货', parent_id: 200 },
      { name: '证券', parent_id: 200 },
      { name: '银行', parent_id: 200 },
      { name: '外汇', parent_id: 200 },
      { name: '基金', parent_id: 200 },
      { name: '保险', parent_id: 200 },
      { name: '信托', parent_id: 200 },
      { name: 'P2P', parent_id: 200 },

      { name: '视野', parent_id: 2 },
      { name: '理财', parent_id: 2 },
      { name: '职业', parent_id: 2 },

      { name: '程序bug', parent_id: 3 },
      { name: '功能建议', parent_id: 3 },
      { name: '行情相关', parent_id: 3 },
      { name: '其他', parent_id: 3 },
    ]

    await this.insert('categories', cats)
    let newCats = await c('categories').find()

    newCats.forEach((v, k) => {
      if (!v.parent_id) {
        return true
      }
      const item = _.find(newCats, { id: v.parent_id })
      v.parent_id = ObjectID(item._id)
    })

    await this.insert('categories', newCats)
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
    await this.insert('users', data)


  }

  async syncNews() {
    const news = await t('news')
    const presses = await t('presses')
    const readings = await t('readings')

    await this.insert('news', news)

    const newNews = await c('news').find()
    presses.forEach(v => {
      v.news_id = _.find(news, { id: v.news_id })._id
    })

    await this.insert('presses', presses)
    await this.insert('readings', readings)
  }

  async syncCourses() {
    const courses = await t('courses')
    const posts = await t('posts')
    const users = _.keyBy(await c('users').find(), 'id')
    let assoc = await t('course_posts')
    assoc = _.keyBy(assoc, 'post_id')

    const prices = _.keyBy(await t('prices').where({
      priceable_type: 'App\\Models\\Course',
      package_id: 4,
    }), 'priceable_id')

    _.map(courses, v => {
      try {
        v.title = v.name
        v.user_id = users[v.user_id]._id
        v.price = prices[v.id].price / 100
        delete v.name
      } catch (e) { }

    })
    await this.insert('courses', courses)

    const newCourses = _.keyBy(await c('courses').find(), 'id')

    posts.forEach(v => {
      const course = newCourses[assoc[v.id].course_id]
      try {

        v.course_id = ObjectID(course._id)
        v.user_id = ObjectID(users[v.user_id]._id)
        v.is_free = !!v.is_free
        v.is_book = course.id == 4
        v.price = 8
      } catch (e) { }
    })

    await this.insert('posts', posts)


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
      if (v.name == 'profession') {
        v.name = 'trade'
      }
    })

    // console.dir(arrayToTree(props))

    await this.insert('properties', arrayToTree(props))

    const getColName = ns => inflection.pluralize(inflection.underscore(ns.split('\\').pop()))

    // await this.insert('properties', props)

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
          const trade = _.get(_.find(newProps['trade'].children, { id: ids[1] }), 'title', null)

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

    await this.insert('oauths', data)
  }

  async syncDevices() {
    const users = _.keyBy(await c('users').find(), 'id')

    const devices = await t('devices')
    _.map(devices, v => {
      try {
        v.user_id = ObjectID(users[v.user_id]._id)
      } catch (e) { }

    })
    await this.insert('devices', devices)

  }

  async syncSms() {
    const sms = await t('sms')
    _.map(sms, v => {
      v.data = JSON.parse(v.data).body
    })
    await this.insert('sms', sms)
  }

  async syncOrders() {
    const orders = await t('orders')
    const users = _.keyBy(await c('users').find(), 'id')
    const courses = _.keyBy(await c('courses').find(), 'id')
    const posts = _.keyBy(await c('posts').find(), 'id')
    const items = await t('order_items')
    _.map(items, (v) => {
      delete v.package_id
      delete v.price_id

      v.price /= 100
      v.buyable_type = v.buyable_type.split('\\').pop()
      let buyable_id = null
      switch (v.buyable_type) {
        case 'Course':
          buyable_id = ObjectID(courses[v.buyable_id]._id)
          break;
        case 'Post':
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

    await this.insert('orders', orders)

    const newOrders = _.keyBy(await c('orders').find(), 'id')

    _.map(items, v => {
      try {
        v.user_id = ObjectID(users[v.user_id]._id)
        v.order_id = ObjectID(newOrders[v.order_id]._id)
      } catch (e) {

      }
    })


    await this.insert('order_items', items)



    const payLogs = await t('paylogs')
    _.map(payLogs, v => {
      v = Object.assign(v, JSON.parse(v.data))

      let order_id = null
      if (v.data.productId) {
        // order_id = parseInt(v.data.productId.match(/_(\d+)$/).pop())
      } else if (v.data.optional) {
        order_id = parseInt(v.data.optional.order_id)
      }

      if (order_id && newOrders[order_id]) {
        v.order_id = ObjectID(newOrders[order_id]._id)
      }

    })

    await this.insert('pay_logs', payLogs)
  }

  async syncComments() {
    const items = await t('comments')
    const users = _.keyBy(await c('users').find(), 'id')
    const courses = _.keyBy(await c('courses').find(), 'id')
    const posts = _.keyBy(await c('posts').find(), 'id')

    _.map(items, (v) => {
      v.commentable_type = v.commentable_type.split('\\').pop()
      let commentable_id = null
      switch (v.commentable_type) {
        case 'Course':
          commentable_id = ObjectID(courses[v.commentable_id]._id)
          break;
        case 'Post':
          commentable_id = ObjectID(posts[v.commentable_id]._id)
          break;

      }
      v.is_top = !!v.is_top
      v.is_checked = !!v.is_checked
      try {
        v.user_id = ObjectID(users[v.user_id]._id)
      } catch (e) {

      }

      v.commentable_id = commentable_id
    })

    await this.insert('comments', items)


  }

  async syncVouchers() {
    const vouchers = await t('vouchers')
    const ids = {
      Course: await this.list('courses'),
      User: await this.list('users'),
      Post: await this.list('posts'),
    }

    vouchers.forEach((v, k) => {
      v.object_type = v.object_type.split('\\').pop()
      const _ids = []
      v.object_id.split(',').forEach(id => {
        _ids.push(ids[v.object_type][id])
      })
      v.object_id = _ids
      v.user_id = ids['User'][v.user_id]
    })
    await this.insert('vouchers', vouchers)

  }

  async syncActions() {
    const actions = await t('actions').whereNot('name', 'view').whereIn('actionable_type', [
      'App\\Models\\Post',
      'App\\Models\\User',
      'App\\Models\\Course',
    ])
    const users = await this.list('users')
    const courses = await this.list('courses')
    const posts = await this.list('posts')



    actions.forEach((v, k) => {
      v.actionable_type = v.actionable_type.split('\\').pop()
      if (!users[v.user_id] || (
        v.actionable_type == 'User' && !users[v.actionable_id]
      )) {
        // delete actions[k]
        actions.splice(k, 1)
        return
      }
      v.user_id = ObjectID(users[v.user_id])

      let actionable_id = null
      switch (v.actionable_type) {
        case 'Course':
          actionable_id = ObjectID(courses[v.actionable_id])
          break;
        case 'Post':
          actionable_id = ObjectID(posts[v.actionable_id])
          break;
        case 'User':
          actionable_id = ObjectID(users[v.actionable_id])
          break;
      }
      v.actionable_id = actionable_id
    })

    await this.insert('actions', actions)

  }


}
