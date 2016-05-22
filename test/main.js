const expect = require('chai').expect
    , Client = require('../dist/api.js')
    , Bot = require('../dist/app.js');

describe('gruszko-bot', function() {
  describe('#api', function() {
    var client = null
      , accountKey = 'GMboUPAqS65aanuqlCwJ';
    before(function() {
      client = new Client({
          app: undefined
        , secret: undefined
        , account: accountKey
      });
    });

    it('creates client', function() {
      expect(client).to.not.be.null;
      expect(client.keys).to.deep.equal({
          app: 'YvGr0FNbqk'
        , secret: 'JGzIpxu0QR'
        , account: accountKey
      });
    });

    it('creates serialized params list', function() {
      let params = Client.serializeParams({
          param1: '123'
        , param2: '321'
      });
      expect(params).to.equal('param1,123,param2,321');
      expect(Client.serializeParams()).to.equal('');
    });
  });

  describe('#bot', function() {
    it('works', function() {
      Bot.run();
    });
  });
});