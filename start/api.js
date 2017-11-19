const Route = use('Route')

//不需要登录
Route.group(() => {

  Route.get('index', 'Api/SiteController.index')
  Route.get('posts/weekly_book', 'Api/PostController.weeklyBook')
  Route.post('login', 'Api/UserController.login')
  Route.post('payment', 'Api/PaymentController.hook')
  
  
}).prefix('api').middleware([
  'authenticator:jwt'
])

//需要登录
Route.group(() => {

  Route.post('iap', 'Api/PaymentController.verifyIap')
  Route.post('actions', 'Api/UserController.action')

  // Route.post('upload', 'Api/SiteController.upload')
  
  Route.resource(':resource', 'Api/ResourceController')

}).prefix('api').middleware([
  // 'auth:jwt',
  'resource'
])

