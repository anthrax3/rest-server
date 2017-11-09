'use strict'

const { Command } = require('@adonisjs/ace')
const { ioc } = require('@adonisjs/fold')
const _ = require('lodash')

ioc.singleton('Adonis/Raw/Database', (app) => {
  const Config = app.use('Adonis/Src/Config')
  const Database = require('@adonisjs/lucid/src/Database/Manager')
  return new Database(Config)
})

const db = use('Adonis/Raw/Database').connection('old') //之前的MYSQL数据库
const db2 = use('Database') //现在的MongoDB数据库
const t = name => db.table(name)
const c = name => db2.collection(name)

class Transform extends Command {
  static get signature() {
    return 'transform'
  }

  static get description() {
    return '一值数据库迁移程序'
  }

  async handle(args, options) {
    const tables = await db.raw('show tables')
    
    
    await this.syncAds()
    
    db.close()
    db2.close()
    this.success('操作成功!')
  }

  async syncAds(){
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
}

module.exports = Transform
