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
  use('App/Models/Course').listFields
}
// main()

require('./admin')
require('./api')