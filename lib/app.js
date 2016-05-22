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
      , /pi[zź]d[ayz]i?e?/i
      , /testmanderigona/i
      , /penis/i
      , /pines/i
      , /cipk?a/i
      , /c?h[u|ó]j/i
      , /zajebi/i
      , /zapier/i
    ];
    this.templates = [
        'Użytkowniku @<%= nick %>, Jestem oburzony Twoim wpisem, mógłbyś go usunąć? ( ͡° ʖ̯ ͡°)'
      , 'Panie, @<%= nick %>, pan weź to usuń bo Cie zgłosze!'
      , '@<%= nick %>, ... usuń konto'
      , '@<%= nick %> baaardzo interesujące, usuń się'
      , '@<%= nick %> nie klnij tak bo Cie zglosze'
    ];
    this.cache = [];
  }

  verifyString(str, patterns) {
    return !_.some(patterns, (word) => str.match(word));
  }

  parseEntry(data) {
    let checkBlock = (entry, comments=[]) => {
      if(!this.verifyString(entry['body'], this.badWords)) {
        let cacheKey = `${data['id']}${entry['author']}`;
        if(this.cache.indexOf(cacheKey) > -1)
          return;
        let body = _.template(this.templates[Math.floor(this.templates.length * Math.random())])({nick: entry['author']})
        if(!_.find(comments, (comment) => comment['author'] === 'Mati365' && !~comment['body'].indexOf(entry['author']))) {
          console.log('Niegrzeczny ', entry['author'], '! Wiadomosc:', entry['body']);
          this.cache.push(cacheKey);
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
      this.client
        .request('stream/index')
        .then((data) => {
          _.each(data, (entry) => this.parseEntry(entry));
        });
    }

    search();
    setInterval(() => search.bind(this), 300000);
  }
};

export default new Bot;