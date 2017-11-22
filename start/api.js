const Route = use('Route')

//不需要登录
Route.group(() => {

  Route.get('index', 'Api/SiteController.index')
  Route.get('posts/recommends/:name', 'Api/PostController.recommends')
  
  
  Route.post('login', 'Api/UserController.login')
  Route.post('register', 'Api/UserController.register')
  Route.post('checkMobileExist', 'Api/UserController.checkMobileExist')
  Route.post('captcha', 'Api/UserController.captcha')
  Route.post('payment', 'Api/PaymentController.hook')


}).prefix('api').middleware([
  'authenticator:jwt',
  'query:api',
])

//需要登录
Route.group(() => {
  Route.get('orders', 'Api/UserController.orders')
  Route.post('iap', 'Api/PaymentController.verifyIap')

}).prefix('api/mine').middleware([
  'authenticator:jwt',
  'auth:jwt',
  'query:api'
])

//允许游客访问的资源路由
Route.group(() => {
  
    Route.post('iap', 'Api/PaymentController.verifyIap')
    Route.post('actions', 'Api/UserController.action')
    Route.get(':resource/:id/comments', 'Api/ResourceController.comments')
    
    // Route.post('upload', 'Api/SiteController.upload')
    Route.resource(':resource', 'Api/ResourceController')
  
  }).prefix('api').middleware([
    'authenticator:jwt',
    'query:api',
    'resource',
  ])
  
//必须登录的资源路由
Route.group(() => {

  Route.post(':resource/:id/collections', 'Api/ResourceController.collect')
  Route.post(':resource/:id/comments', 'Api/ResourceController.comment')
  

}).prefix('api').middleware([
  'authenticator:jwt',
  'auth:jwt',
  'query:api',
  'resource',
])


