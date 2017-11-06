const Route = use('Route')

Route.group(() => {

  Route.get(':resource/grid', 'ResourceController.grid')
  Route.get(':resource/form', 'ResourceController.form')
  Route.resource(':resource', 'ResourceController')

}).prefix('admin/api').middleware([
  'resource'
])