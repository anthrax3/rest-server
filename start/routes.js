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
const Drive = use('Drive')

Route.get('/', async ({ request }) => {
  return await use('App/Models/Category').treeOptions('_id', 'name')
})

async function main() {
  
  // console.log(await Drive.getUrl('node/2.jpg'));
  // console.log(await use('App/Models/Category').treeOptions('_id', 'name'));
  // console.log(await Drive.put('node/2.jpg', __dirname + '/../public/uploads/2.jpg'))
}
main()

require('./rest-api')