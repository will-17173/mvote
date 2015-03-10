define(function(require, exports, module) {
  /**
   * 投票
   *
   * @module Vote
   */
  'use strict';

  var $ = require('$'),
    Core = require('./core');

  /**
   * 顶踩
   * @class Support
   * @extends core
   * @constructs
   */
  var Support = Core.extend({

    defaults: {
      url: 'http://hits.17173.com/support/support_opb.php'
    },

    /**
     * 支持
     * @method support
     * @param  {function} callBack 回调函数
     */
    support: function(callBack) {
      var self = this;
      self.params.action = '1';
      self.state(Core.STATE.SENDING);
      self.dataServer(function(data) {
        callBack && callBack.call(self, data);
        self.fire('support', data);
      });
    },

    /**
     * 反对
     * @method oppose
     * @param  {function} callBack 回调函数
     */
    oppose: function(callBack) {
      var self = this;
      self.params.action = '2';
      self.state(Core.STATE.SENDING);
      self.dataServer(function(data) {
        callBack && callBack.call(self, data);
        self.fire('oppose', data);
      });
    },

    /**
     * 解析数据
     * @method parseData
     * @param  {Object} data 原始数据
     * @return {Object}      加工后的数据
     * @private
     */
    parseData: function(data) {
      var support = parseInt(data.support, 10);
      var oppose = parseInt(data.oppose, 10);
      var total = support + oppose;
      var supPercent = total === 0 ? 0 : (support / total * 100);
      var oppPercent = total === 0 ? 0 : (oppose / total * 100);
      return {
        original: data,
        support: {
          count: support,
          percent: supPercent
        },
        oppose: {
          count: oppose,
          percent: oppPercent
        },
        max: Math.max(oppose, support),
        total: total,
        webId: this.option('webId')
      };
    }

  });

  module.exports = Support;

});
