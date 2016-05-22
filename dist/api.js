'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _md = require('md5');

var _md2 = _interopRequireDefault(_md);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Client = function () {
  function Client() {
    var keys = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Client);

    this.authPromise = null;
    this.keys = _lodash2.default.merge({
      app: 'YvGr0FNbqk',
      secret: 'JGzIpxu0QR'
    }, keys);

    keys.account && this.login(keys.account);
  }

  _createClass(Client, [{
    key: 'login',
    value: function login(accountKey) {
      var _this = this;

      this.authPromise = this.request('user/login', {
        accountkey: accountKey
      }).then(function (user) {
        _this.user = user;
      });
    }
  }, {
    key: 'request',
    value: function request(action, payload) {
      var _this2 = this;

      var params = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var userKey = this.user ? this.user['userkey'] : null,
          promise = action === 'user/login' ? Promise.resolve(true) : this.authPromise,
          serializedParams = {
        api: params.api ? ',' + this.constructor.serializeParams(params.api) : '',
        method: (params.method || []).join('/')
      };

      return promise.then(function () {
        var key = 'appkey,' + _this2.keys.app + (userKey ? ',userkey,' + userKey : ''),
            uri = _this2.constructor.config.apiUrl + '/' + action + '/' + serializedParams.method + '/' + (key + serializedParams.api);

        var payloadMeta = (0, _lodash2.default)(payload).chain().keys().sort().reduce(function (obj, key) {
          return obj.concat(payload[key]);
        }, []).thru(function (val) {
          return val.join(',');
        }).value();

        return (0, _requestPromise2.default)({
          uri: uri,
          method: payload && !_lodash2.default.isEmpty(payload) ? 'POST' : 'GET',
          json: true,
          form: payload,
          headers: {
            'apisign': (0, _md2.default)(_this2.keys.secret + uri + payloadMeta),
            'User-Agent': 'gruszko-bot'
          }
        });
      });
    }
  }]);

  return Client;
}();

Client.config = {
  apiUrl: 'http://a.wykop.pl'
};
Client.serializeParams = function (params) {
  return _lodash2.default.chain(params).keys().reduce(function (memo, key, index) {
    return memo + (key + ',' + params[key] + ',');
  }, '').thru(function (value) {
    return value.endsWith(',') ? value.substr(0, value.length - 1) : value;
  }).value();
};

exports.default = Client;
module.exports = exports['default'];