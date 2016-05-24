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
          'Użytkowniku @<%= nick %>, proszę przestrzegaj zasad netykiety ( ͡° ʖ̯ ͡°)'
        , '@<%= nick %> Twoje wulgarne komentarze zgarszają użytkowników Wykopu, proszę wyrażać się kulturalniej.'
        , 'Osoby przeklinające, takie jak @<%= nick %>, powinno się banować z automatu ( ͡° ʖ̯ ͡°)'
        , '@<%= nick %> ehh... a za te przekeństwa to bana dostaniesz'
        , '@<%= nick %> Twoje poste są cienke, 0/10'
        , '@<%= nick %> A zgłosić Cię do administracji? Będziesz jeszcze klnąć na Wykop.pl? :]'
        , '@<%= nick %> Mówią mi, że kabluje. Ale robię to w dobrej sprawie, na Ciebie też na kabluje z powodu Twoich wulgaryzmów.'
        , '@<%= nick %> Nikogo to nie interesuje, możesz usunąć konto - jeśli nie to administracja zrobi to za Ciebie, za Twoje wulgaryzmy.'
        , '@<%= nick %> Wraz z @Manderigon zgłosimy Twój post ze względu na wulgaryzmy'
    ];
  }

  verifyString(str, patterns) {
    return !_.some(patterns, (word) => str.match(word));
  }

  parseEntry(data) {
    let checkBlock = (entry, comments=[]) => {
      if(!this.verifyString(entry['body'], this.badWords)) {
        let body = _.template(this.templates[Math.floor(this.templates.length * Math.random())])({nick: entry['author']});
        if(!_.find(comments, (comment) => comment['author'] == 'Mati365' && comment['body'].indexOf(entry['author']) === -1)) {
          this.client
            .request('entries/addcomment', {body}, {method: [data['id']]})
            .then((res) => {
              console.log(`${entry['author']} - wpis ${entry['id']} - zostal ukarany - ${res}`);
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