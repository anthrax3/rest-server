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

Route.get('/', async ({ request }) => {
  return await use('App/Models/Category').treeOptions('_id', 'name')
})

async function main() {
  console.log(await use('App/Models/Category').treeOptions('_id', 'name'));
}
// main()

require('./rest-api')