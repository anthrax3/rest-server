const Event = use('Event')

Event.on('order::paid', [
  'Order.paid'
])