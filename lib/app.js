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
    ];
  }

  verifyString(str, patterns) {
    return !_.some(patterns, (word) => str.match(word));
  }

  parseEntry(data) {
    let checkBlock = (entry, comments=[]) => {
      if(!this.verifyString(entry['body'], this.badWords)) {
        let body = _.template(this.templates[Math.floor(this.templates.length * Math.random())])({nick: entry['author']});
        if(!_.find(comments, (comment) => comment['author'] == 'Mati365')) {
          console.log('Niegrzeczny ', entry['author'], '! Wiadomosc:', entry['body']);
          this.client
            .request('entries/addcomment', {body}, {method: [data['id']]})
            .then((res) => console.log(res));
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

(new Bot).run();
module.exports = new Bot;