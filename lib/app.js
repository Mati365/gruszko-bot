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
        '@<%= nick %> plz nie przeklinaj hultaju'
      , '@<%= nick %> nie przeklinaj mireczku'
    ];
  }

  verifyString(str, patterns) {
    return !_.some(patterns, (word) => str.match(word));
  }

  parseEntry(data) {
    let checkBlock = (entry, comments=[]) => {
      if(!this.verifyString(entry['body'], this.badWords)) {
        let body = _.template(this.templates[Math.floor(this.templates.length * Math.random())])({nick: entry['author']});
        if(!_.find(comments, (comment) => comment['author'] == 'TestBot')) {
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
    app: process.env.appKey || '4Ac50eaivm'
  , secret: process.env.secretKey || 'H8IA8kj3rY'
  , account: process.env.accountKey || 'u146l0Xlsyj5rzcx56ZH'
}, argv);
new Bot(keys).run();