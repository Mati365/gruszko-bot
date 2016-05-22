import Client from './api';

class Bot {
  constructor() {
    this.client = new Client({
      account: 'GMboUPAqS65aanuqlCwJ'
    });
  }

  run() {
    this.client
      .request('entries/index', null, {method: [17825711]})
      .then((data) => {
        console.log(data);
      });
  }
};

export default new Bot;