import _ from 'lodash';
import Client from './api';

class Bot {
  constructor() {
    this.client = new Client({
        app: 'YjED2JGsO9'
      , secret: 'oNiF8V3Yfw'
      , account: 't3FB3XyoPeH3EGkLyVsI'
    });
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
    this.run();
  }

  verifyString(str, patterns) {
    return !_.some(patterns, (word) => str.match(word));
  }

  parseEntry(data) {
    let checkBlock = (entry, comments=[]) => {
      if(!this.verifyString(entry['body'], this.badWords)) {
        let body = _.template(this.templates[Math.floor(this.templates.length * Math.random())])({nick: entry['author']});
        if(!_.find(comments, (comment) => comment['author'] == 'Mati365')) {
          this.client
            .request('entries/addcomment', {body}, {method: [data['id']]})
            .then((res) => {
              console.log(`${entry['author']} - wpis ${entry['id']} - zostal ukarany - ${res}`);
            });
        }
      }
    };
    if(data['body'].indexOf('#bekazlewactwa') > -1)
      this.client.request('entries/index', null, {method: [data['id']]}).then(({comments}) => {
        comments = comments.concat([data]);
        _.each(comments, (entry) => checkBlock(entry, comments));
      });
    else
      checkBlock(data);
  }
  run() {
    let search = () => {
      console.log('Szukam mirko...');
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
    setInterval(search.bind(this), 60000);
  }
};

module.exports = new Bot;