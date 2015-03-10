define(function(require, exports, module) {
  /**
   * 投票基类
   *
   * @module Vote
   */
  'use strict';

  var $ = require('$'),
    Base = require('base'),
    Tips = require('tips');


  var STATE = {
    ERROR: -1,
    NORMAL: 0,
    RECEIVING: 1,
    SENDING: 2,
    DISABLED: 3
  };

  /**
   * 投票基类
   * @class core
   * @constructs
   */
  var Core = Base.extend({
    defaults: {

      url: '',

      /**
       * 频道ID
       * @attribute channel
       * @type {String}
       */
      channel: '',

      /**
       * 页面Id
       * @attribute webId
       * @type {String}
       */
      webId: '',

      /**
       * 内容类型
       * @attribute kind
       * @type {String}
       */
      kind: '1',

      /**
       * 投票成功提示
       * @attribute voteTip
       * @type {String}
       */
      voteTip: '投票成功，感谢您的参与',

      /**
       * 同一IP重复投票提示
       * @attribute ipRepeatTip
       * @type {String}
       */
      ipRepeatTip: '您的IP今天已经投过票了, 感谢您的参与',

      /**
       * 数据异常提示
       * @attribute errorTip
       * @type {String}
       */
      errorTip: '数据处理失败',

      /**
       * 关联的UI
       * @type {[type]}
       */
      baseElement: null

    },

    initialize: function() {
      Core.superclass.initialize.apply(this, arguments);

      this.url = this.option('url') + '?jsonp=?';

      // 设置后端接口参数
      this.params = this.createParams();

      // 初始化状态
      this.state(STATE.NORMAL);
    },

    /**
     * 创建参数
     * @method createParams
     * @return {Object} 参数对象
     * @private
     */
    createParams: function() {
      var self = this;
      return {
        channel: self.option('channel'),
        'web_id': self.option('webId'),
        kind: self.option('kind')
      };
    },

    /**
     * 加载当前投票信息
     * @method load
     * @param {function} 加载成功的回调方法
     */
    load: function(callBack) {
      var self = this;
      self.params.action = '0';
      self.state(STATE.RECEIVING);
      self.dataServer(function(data) {
        callBack && callBack.call(self, data);
        self.fire('load', data);
      });
    },

    /**
     * 提交或获取数据
     * @method dataServer
     * @param  {function} callBack   成功回调
     * @private
     */
    dataServer: function(callBack) {
      var self = this;
      self.getData(self.params, function(resData) {
        var data;
        if (self.done(resData)) {
          data = self.parseData(resData);
          self.state(Core.STATE.NORMAL);
          callBack && callBack.call(self, data);
        }
      }, function() {
        self.fail('-1'); //非业务异常，网络或服务器异常等.
      });
    },

    /**
     * 数据接口
     * @method getData
     * @param  {object}   params 请求参数
     * @param  {function} done   成功回调
     * @param  {function} fail   失败回调
     * @private
     */
    getData: function(params, done, fail) {
      $.getJSON(this.url, params)
        .done(done)
        .fail(fail);
    },

    /**
     * 处理请求成功数据
     * @method done
     * @param  {object}   data   成功数据
     * @private
     */
    done: function(data) {
      var self = this;

      // 数据发送成功
      switch (data.flag) {
        case '1': // 1: 成功
          if (self.state() === STATE.SENDING) {
            self.showTips(self.option('voteTip'));
          }
          self.state(STATE.NORMAL);
          return true;

        case '2': // 2：失败
          self.fail(data.flag);
          break;

        case '3': // 3：参数不全
          self.fail(data.flag);
          break;

        case '9':
          self.showTips(self.option('ipRepeatTip'));
          self.state(STATE.DISABLED);
          self.fire('disabled');
          break;

        default:
          break;
      }

      return false;
    },

    /**
     * 请求失败
     * @method fail
     * @param  {string}  flag    失败类型标识
     * @private
     */
    fail: function(flag) {
      var self = this,
        eventRus = true;
      self.state(STATE.ERROR);
      eventRus = self.fire('fail', flag);
      if (eventRus) {
        self.showTips(self.option('errorTip'));
      }
    },

    /**
     * 解析数据
     * @method parseData
     * @return {object} 解析完的数据
     */
    parseData: function() {

    },

    /**
     * 显示提示信息
     * @method showTips
     * @param {String} info 要提示的信息
     * @private
     */
    showTips: function(info) {
      if (!info || typeof info == 'string' && $.trim(info) === '') {
        return;
      }
      new Tips({
        baseElement: this.option('baseElement'),
        content: info,
        css: {
          position: 'absolute'
        },
        // 引入 dialog 样式
        importStyle: true
      });
    }

  });

  Core.STATE = STATE;

  module.exports = Core;

});
