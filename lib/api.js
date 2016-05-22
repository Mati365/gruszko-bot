import _ from 'lodash';
import request from 'request-promise';
import md5 from 'md5';

class Client {
  constructor(keys={}) {
    this.keys = _.merge({
        app: 'YvGr0FNbqk'
      , secret: 'JGzIpxu0QR'
    }, keys);

    keys.account && this.login(keys.account);
  }

  login(accountKey) {
    this.authPromise = this
      .request('user/login', {
        accountkey: accountKey
      })
      .then((user) => this.user = user);
  }

  request(action, payload, params, userKey='') {
    if(action === 'user/login')
      this.authPromise = Promise.resolve(true);

    return this.authPromise.then(() => {
      let key = `appkey,${this.keys.app}` + (userKey ? `,userkey,${userKey}` : '')
        , uri = `${this.constructor.config.apiUrl}/${action}/${key + this.constructor.serializeParams(params)}`;

      let payloadMeta = _(payload).chain()
        .keys()
        .sort()
        .reduce((obj, key) => obj.concat(payload[key]), [])
        .thru((val) => val.join(','))
        .value();

      return request({
          uri
        , method: (payload && !_.isEmpty(payload) ? 'POST' : 'GET')
        , json: true
        , form: payload
        , headers: {
            'apisign': md5(this.keys.secret + uri + payloadMeta)
          , 'User-Agent': 'gruszko-bot'
        }
      });
    });
  }
}
Client.config = {
  apiUrl: 'http://a.wykop.pl'
};
Client.serializeParams = function(params) {
  return _.chain(params)
    .keys()
    .reduce((memo, key, index) => memo + `${key},${params[key]},`, '')
    .thru((value) => {
      return value.endsWith(',') ? value.substr(0, value.length - 1) : value;
    })
    .value();
};

export default Client;