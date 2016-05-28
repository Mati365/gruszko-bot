'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _yargs = require('yargs');

var _api = require('./api');

var _api2 = _interopRequireDefault(_api);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Bot = function () {
  function Bot(keys) {
    _classCallCheck(this, Bot);

    this.client = new _api2.default(keys);
    this.badWords = [/[qk]u?r[wf][ao]/i // kurwa
    , /qwa/i, /jprdl/i, /pierdo\w+/i // pierdolić
    , /szmat[ao]/i // szmata
    , /cwel/i, /pi[zź]d[ayzo]i?e?/i, /testmanderigona/i, /penis/i, /pines/i, /cipk?a/i, /c?h[u|ó]j/i, /zajebi/i, /zapier/i];
    this.templates = ['@<%= nick %> plz nie przeklinaj hultaju', '@<%= nick %> nie przeklinaj mireczku'];
  }

  _createClass(Bot, [{
    key: 'verifyString',
    value: function verifyString(str, patterns) {
      return !_lodash2.default.some(patterns, function (word) {
        return str.match(word);
      });
    }
  }, {
    key: 'parseEntry',
    value: function parseEntry(data) {
      var _this = this;

      var checkBlock = function checkBlock(entry) {
        var comments = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

        if (!_this.verifyString(entry['body'], _this.badWords)) {
          var body = _lodash2.default.template(_this.templates[Math.floor(_this.templates.length * Math.random())])({ nick: entry['author'] });
          if (!_lodash2.default.find(comments, function (comment) {
            return comment['author'] == 'TestBot';
          })) {
            _this.client.request('entries/addcomment', { body: body }, { method: [data['id']] }).then(function (res) {
              console.log(entry['author'] + ' - wpis ' + entry['id'] + ' - zostal ukarany', res);
            });
          }
        }
      };
      if (data['body'].indexOf('#bekazlewactwa') > -1 || !this.verifyString(data['body'], this.badWords)) this.client.request('entries/index', null, { method: [data['id']] }).then(function (_ref) {
        var comments = _ref.comments;

        comments = comments.concat([data]);
        _lodash2.default.each(comments, function (entry) {
          return checkBlock(entry, comments);
        });
      });
    }
  }, {
    key: 'run',
    value: function run() {
      var _this2 = this;

      var search = function search() {
        console.log('Przeszukuje mirko...');
        _this2.lastId = 0;
        _this2.client.request('stream/index').then(function (data) {
          _lodash2.default.each(data.reverse(), function (entry) {
            if (entry['id'] > _this2.lastId) {
              _this2.parseEntry(entry);
              _this2.lastId = entry['id'];
            }
          });
        });
      };

      search();
      setInterval(search.bind(this), 3 * 60 * 1000);
    }
  }]);

  return Bot;
}();

;

// CLI
var keys = _lodash2.default.merge({
  app: process.env.appKey || '4Ac50eaivm',
  secret: process.env.secretKey || 'H8IA8kj3rY',
  account: process.env.accountKey || 'u146l0Xlsyj5rzcx56ZH'
}, _yargs.argv);
new Bot(keys).run();