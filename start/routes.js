'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/guides/routing
|
*/

require('./functions')

const Route = use('Route')


async function main() {
  // const Sms = use('Sms')
  // let ret = await use('Sms').sendCode()
  // console.log(ret);
  // delete require.cache['/Users/xuesong/node/rest-server/node_modules/lucid-mongo/src/LucidMongo/Relations/ReferMany.js']
  
  // const Course = use('App/Models/Course')
  // const courses = await use('App/Models/Course').with('categories').select([
  //   '_id','title', 'category_ids'
  // ]).limit(3).fetch()
  // log(courses.toJSON());
  
  // console.log((await user.actions().where('name', 'collection').with('actionable', builder => {
  //   builder.select(['_id', 'title'])
  // }).fetch()).toJSON());
  // console.log(await use('App/Models/Post').query().withCount('comments').first());

  // const Drive = use('Drive')
  // console.log((await Course.query().listFields().limit(1).fetch()).toJSON());
  // console.log(await Drive.getUrl('node/2.jpg'));
  // console.log(await use('App/Models/Category').treeOptions('_id', 'name', '专栏分类'));
  // console.log(await Drive.put('node/2.jpg', __dirname + '/../public/uploads/2.jpg'))

  // console.log((await use('App/Models/Comment').query().with('commentable').limit(2).fetch()).toJSON());
  // const user = await use('App/Models/User').findBy({username: 'User43041'})
  // console.log(await user.addBalance('charge', 10));
  const JPush = require('jpush-sdk')
  const axios = require('axios')
  const config = {
    key: use('Env').get('JPUSH_KEY'),
    secret: use('Env').get('JPUSH_SECRET'),
  }
  //https://docs.jiguang.cn/jpush/server/push/rest_api_v3_device/
  // axios.get('https://device.jpush.cn/v3/aliases/13642', {
  axios.get('https://device.jpush.cn/v3/devices/101d8559097e2f905e7', {
    headers: {
      Authorization: 'Basic ' + new Buffer(config.key + ':' + config.secret).toString('base64')
    }
  }).then(({data}) => {
    console.log(data);
  }).catch(({response}) => {
    console.log(response.data);
  })
}
// main()

require('./admin')
require('./api')