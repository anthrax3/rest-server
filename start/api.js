const Route = use('Route')

//需要登录的mine路由
Route.group(() => {
  Route.get('orders', 'Api/UserController.orders')

}).prefix('api/mine').middleware([
  // 'authenticator:jwt',
  'auth:jwt',
  'query:api'
])

//需要登录
Route.group(() => {
  Route.post('orders/create', 'Api/OrderController.create')
  Route.post('iap', 'Api/PaymentController.verifyIap')
  Route.get('profile', 'Api/UserController.profile')
  Route.get('users/:id/likes', 'Api/UserController.likes')
  Route.post('actions', 'Api/UserController.action')
  
}).prefix('api').middleware([
  // 'authenticator:jwt',
  'auth:jwt',
  'query:api'
])


//必须登录的资源路由
Route.group(() => {

  Route.post(':resource/:id/collections', 'Api/ResourceController.collect')
  Route.post(':resource/:id/comments', 'Api/ResourceController.comment')

}).prefix('api').middleware([
  // 'authenticator:jwt',
  'auth:jwt',
  'query:api',
  'resource',
])

//不需要登录
Route.group(() => {

  Route.get('index', 'Api/SiteController.index')
  Route.get('posts/recommends/:name', 'Api/PostController.recommends')

  Route.post('login', 'Api/SiteController.login')
  Route.post('register', 'Api/SiteController.register')
  Route.post('checkMobileExist', 'Api/SiteController.checkMobileExist')
  Route.post('captcha', 'Api/SiteController.captcha')
  Route.post('payment', 'Api/PaymentController.hook')
  Route.post('iap', 'Api/PaymentController.verifyIap')

}).prefix('api').middleware([
  'authenticator:jwt',
  'query:api',
])

//允许游客访问的资源路由
Route.group(() => {

  Route.get(':resource/:id/comments', 'Api/ResourceController.comments')
  // Route.post('upload', 'Api/SiteController.upload')
  Route.resource(':resource', 'Api/ResourceController')

}).prefix('api').middleware([
  'authenticator:jwt',
  'query:api',
  'resource',
])




