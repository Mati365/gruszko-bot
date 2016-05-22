'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _api = require('./api');

var _api2 = _interopRequireDefault(_api);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Bot = function () {
  function Bot() {
    _classCallCheck(this, Bot);

    this.client = new _api2.default({
      app: 'YjED2JGsO9',
      secret: 'oNiF8V3Yfw',
      account: 't3FB3XyoPeH3EGkLyVsI'
    });
    this.badWords = [/[qk]u?r[wf][ao]/i // kurwa
    , /qwa/i, /jprdl/i, /pierdo\w+/i // pierdolić
    , /szmat[ao]/i // szmata
    , /cwel/i, /pi[zź]d[ayzo]i?e?/i, /testmanderigona/i, /penis/i, /pines/i, /cipk?a/i, /c?h[u|ó]j/i, /zajebi/i, /zapier/i];
    this.templates = ['Użytkowniku @<%= nick %>, proszę przestrzegaj zasad netykiety ( ͡° ʖ̯ ͡°)', '@<%= nick %> Twoje wulgarne komentarze zgarszają użytkowników Wykopu, proszę wyrażać się kulturalniej.', 'Osoby przeklinające, takie jak @<%= nick %>, powinno się banować z automatu ( ͡° ʖ̯ ͡°)', '@<%= nick %> ehh... a za te przekeństwa to bana dostaniesz', '@<%= nick %> Twoje poste są cienke, 0/10', '@<%= nick %> A zgłosić Cię do administracji? Będziesz jeszcze klnąć na Wykop.pl? :]', '@<%= nick %> Mówią mi, że kabluje. Ale robię to w dobrej sprawie, na Ciebie też na kabluje z powodu Twoich wulgaryzmów.', '@<%= nick %> Nikogo to nie interesuje, możesz usunąć konto - jeśli nie to administracja zrobi to za Ciebie, za Twoje wulgaryzmy.', '@<%= nick %> Wraz z @Manderigon zgłosimy Twój post ze względu na wulgaryzmy'];
    this.run();
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
            return comment['author'] == 'Mati365';
          })) {
            _this.client.request('entries/addcomment', { body: body }, { method: [data['id']] }).then(function (res) {
              console.log(entry['author'] + ' - wpis ' + entry['id'] + ' - zostal ukarany - ' + res);
            });
          }
        }
      };
      if (data['body'].indexOf('#bekazlewactwa') > -1) this.client.request('entries/index', null, { method: [data['id']] }).then(function (_ref) {
        var comments = _ref.comments;

        comments = comments.concat([data]);
        _lodash2.default.each(comments, function (entry) {
          return checkBlock(entry, comments);
        });
      });else checkBlock(data);
    }
  }, {
    key: 'run',
    value: function run() {
      var _this2 = this;

      var search = function search() {
        console.log('Szukam mirko...');
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
      setInterval(search.bind(this), 60000);
    }
  }]);

  return Bot;
}();

;

module.exports = new Bot();