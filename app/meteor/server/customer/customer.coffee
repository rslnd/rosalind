Meteor.methods
  'customer/get': ->
    customer = {}

    customer.name = process.env.CUSTOMER_NAME

    Winston.warn('Please set environment variable CUSTOMER_NAME') unless customer.name

    return customer
