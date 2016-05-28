import _ from 'lodash';
import {argv} from 'yargs';

import Client from './api';

class Bot {
  constructor(keys) {
    this.client = new Client(keys);
    this.badWords = [
        /[qk]u?r[wf][ao]/i // kurwa
      , /qwa/i
      , /jprdl/i
      , /pierdo\w+/i // pierdolić
      , /szmat[ao]/i // szmata
      , /cwel/i
      , /pi[zź]d[ayzo]i?e?/i
      , /testmanderigona/i
      , /penis/i
      , /pines/i
      , /cipk?a/i
      , /c?h[u|ó]j/i
      , /zajebi/i
      , /zapier/i
    ];
    this.templates = [
        '@<%= nick %>, wykryto wulgaryzmy w Twoim wpisie ( ͡° ʖ̯ ͡°) zrób #pokazmorde albo to zgłoszę. Wygenerowano automatycznie przez ostoje prawilności na Wykopie, **TestBot**'
      , '@<%= nick %>, wykryto wulgaryzmy w Twoim wpisie ( ͡° ʖ̯ ͡°) zrób #rozdajo albo to zgłoszę. Wygenerowano automatycznie przez ostoje prawilności na Wykopie, **TestBot**'
      , '@<%= nick %>, wykryto wulgaryzmy w Twoim wpisie ( ͡° ʖ̯ ͡°) zrób wyjdź z piwnicy albo to zgłoszę. Wygenerowano automatycznie przez ostoje prawilności na Wykopie, **TestBot**'
    ];
  }

  verifyString(str, patterns) {
    return !_.some(patterns, (word) => str.match(word));
  }

  parseEntry(data) {
    let checkBlock = (entry, comments=[]) => {
      if(!this.verifyString(entry['body'], this.badWords)) {
        let body = _.template(this.templates[Math.floor(this.templates.length * Math.random())])({nick: entry['author']});
        if(!_.find(comments, (comment) => comment['author'] == 'TestBot' && comment['body'].indexOf(entry['author']) === -1)) {
          this.client
            .request('entries/addcomment', {body}, {method: [data['id']]})
            .then((res) => {
              console.log(`${entry['author']} - wpis ${entry['id']} - zostal ukarany`, res);
            });
        }
      }
    };
    if(data['body'].indexOf('#bekazlewactwa') > -1 || !this.verifyString(data['body'], this.badWords))
      this.client.request('entries/index', null, {method: [data['id']]}).then(({comments}) => {
        comments = comments.concat([data]);
        _.each(comments, (entry) => checkBlock(entry, comments));
      });
  }

  run() {
    let search = () => {
      console.log('Przeszukuje mirko...');
      this.lastId = 0;
      this.client
        .request('stream/index')
        .then((data) => {
          _.each(data.reverse(), (entry) => {
            if(entry['id'] > this.lastId) {
              this.parseEntry(entry);
              this.lastId = entry['id'];
            }
          });
        });
    }

    search();
    setInterval(search.bind(this), 3 * 60 * 1000);
  }
};

// CLI
var keys = _.merge({
    app: process.env.appKey
  , secret: process.env.secretKey
  , account: process.env.accountKey
}, argv);
new Bot(keys).run();