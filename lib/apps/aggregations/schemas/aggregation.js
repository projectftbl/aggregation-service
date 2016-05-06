module.exports = {
  required: true
, type: 'object'
, properties: {
    accountId: { required: true, type: 'string' }
  , recordedAt: { required: true, type: 'string', format: 'date-time' }
  , status: { required: true, type: 'string' }
  , timestamp: { type: [ 'string', 'null' ] }
  , data: { type: 'object' }
  }
};