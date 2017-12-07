const Route = use('Route')

//需要登录的mine路由
Route.group(() => {
  Route.get('orders', 'Api/UserController.orders')
  Route.get('comments', 'Api/UserController.comments')
  Route.get('collections/:type', 'Api/UserController.collections')
  Route.get('likes', 'Api/UserController.likes')
  Route.get('follows', 'Api/UserController.follows')
  
  Route.post('actions', 'Api/UserController.action')
  // Route.post('users', 'Api/UserController.update')

}).prefix('api/mine').middleware([
  // 'authenticator:jwt',
  'auth:jwt',
  'query:api'
])

//需要登录
Route.group(() => {
  Route.post('orders', 'Api/OrderController.create')
  Route.post('iap', 'Api/PaymentController.verifyIap')

  Route.get('profile', 'Api/UserController.profile')
  Route.put('profile', 'Api/UserController.update')
}).prefix('api').middleware([
  // 'authenticator:jwt',
  'auth:jwt',
  'query:api'
])


//必须登录的资源路由
Route.group(() => {

  
  Route.post('follows/:id', 'Api/UserController.follow')
  Route.post(':resource/:id/collections', 'Api/ResourceController.collect')
  Route.post(':resource/:id/likes', 'Api/ResourceController.like')
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
  Route.get('contact', 'Api/SiteController.contact')
  Route.get('experts/params', 'Api/SiteController.properties')
  Route.get('advices', 'Api/SiteController.advices').middleware(['resource:advices'])
  Route.post('advices', 'Api/AdviceController.store').middleware(['resource:advices'])


  Route.post('vouchers/active', 'Api/VoucherController.active')
  Route.post('vouchers/get', 'Api/VoucherController.get')
  Route.get('posts/recommends/:name', 'Api/PostController.recommends')

  Route.post('login', 'Api/SiteController.login')
  Route.post('register', 'Api/SiteController.register')

  Route.post('authLogin', 'Api/SiteController.authLogin')
  Route.post('authRegister', 'Api/SiteController.authRegister')

  Route.post('guest', 'Api/SiteController.guest')
  Route.post('checkMobileExist', 'Api/SiteController.checkMobileExist')
  Route.post('captcha', 'Api/SiteController.captcha')
  Route.post('devices', 'Api/SiteController.addDevice')
  Route.get('payment/channels', 'Api/PaymentController.channels')
  Route.post('payment', 'Api/PaymentController.hook')
  Route.post('iap', 'Api/PaymentController.verifyIap')

  Route.post('reset', 'Api/UserController.resetPassword')
  
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




