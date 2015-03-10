define(function(require, exports, module) {
  /**
   * 投票组件，封装基础UI事件
   *
   * @module Vote
   */
  'use strict';

  var $ = require('$'),
    Widget = require('widget'),
    MultipleVote = require('./multiplevote');

  /**
   * 投票组件，封装基础UI事件
   * @class SupportUi
   * @extends widget
   * @constructs
   */
  var SupportUi = Widget.extend({

    defaults: {
      animate: true, //是否开启动画效果
      support: null, //点击支持的选择器
      oppose: null, // 点击反对的选择器
      maxHeight: null, //配置后高度会转成px值，否则用百分比.
      maxWidth: null,
      updateAll: false, //投票后是否更新所有顶踩，默认只更新当前顶踩
      channel: null, //频道号
      kind: '1', //页面类型
      voteTip: undefined,
      ipRepeatTip: undefined,
      errorTip: undefined,
      baseElement: undefined,
      container: null,
      classPrefix: 'ue-component ue-support'
    },

    initialize: function(defaults) {

      defaults.delegates = {};

      if (defaults.support) {
        defaults.delegates['click ' + defaults.support] = 'doSupport';
      }

      if (defaults.oppose) {
        defaults.delegates['click ' + defaults.oppose] = 'doOppose';
      }

      SupportUi.superclass.initialize.apply(this, arguments);
    },

    setup: function() {
      var element = $(this.option('element'));
      var dataKey = [];
      var elementDataKey = element.attr('data-key');
      var baseElement = this.option('baseElement');

      var parame;

      element.find('[data-key]').each(function() {
        dataKey.push($(this).attr('data-key'));
      });

      if (!dataKey.length && elementDataKey) {
        dataKey.push(elementDataKey);
      }

      parame = {
        channel: this.option('channel'),
        kind: this.option('kind'),
        webIds: dataKey,
        baseElement: baseElement ? $(baseElement) : element,
        voteTip: this.option('voteTip'),
        ipRepeatTip: this.option('ipRepeatTip'),
        errorTip: this.option('errorTip')
      };

      this.vote = new MultipleVote(parame);
      this.render();
      this.updateView();
    },

    //更新所有顶踩
    updateView: function() {
      var self = this;
      var vote = this.vote;
      vote.load(function(data) {
        self.globalView(data);
        self.itemView(data);
      });
    },

    globalView: function(data) {
      this.$('[data-total]').text(data.allTotal);
      this.$('[data-max]').text(data.max);
    },

    //更新单项顶踩
    updateSubView: function(data, $item) {
      var newData = {
        supPercent: data.support.percent,
        oppPercent: data.oppose.percent,
        count: data.support.count,
        oppose: data.oppose.count
      };
      this.typeRender(newData, $item);
    },

    itemView: function(data) {
      var self = this;
      var target = this.$('[data-key]');
      target = target.length ? target : self.element;
      target.each(function() {
        var $item = $(this);
        var datas = data[$item.attr('data-key')];
        self.typeRender(datas, $item);
      });
    },

    typeRender: function(datas, $item) {
      var maxWidth = this.option('maxWidth');
      var maxHeight = this.option('maxHeight');
      var supPercent = datas.supPercent;
      var oppPercent = datas.oppPercent;

      function getPercent(percent, maxValue) {
        return maxValue ? percent / 100 * maxValue : percent + '%';
      }

      var params = {
        datas: datas,
        item: $item,
        isAnimate: this.option('animate'),
        supWidth: getPercent(supPercent, maxWidth),
        supHeight: getPercent(supPercent, maxHeight),
        oppWidth: getPercent(oppPercent, maxWidth),
        oppHeight: getPercent(oppPercent, maxHeight)
      };

      for (var fn in dictionary) {
        params.target = $item.find('[data-' + fn + ']');
        dictionary[fn].call(this, params);
      }

    },

    doSupport: function(e) {
      var self = this;
      var updateAll = self.option('updateAll');
      var item = self.getDataKey(e.currentTarget);
      if (item.dataKey) {
        self.vote.vote(item.dataKey, function(data) {
          updateAll ? self.updateView() : self.updateSubView(data, item.item);
        });
      }
    },

    doOppose: function(e) {
      var self = this;
      var updateAll = self.option('updateAll');
      var item = self.getDataKey(e.currentTarget);
      if (item.dataKey) {
        self.vote.oppose(item.dataKey, function(data) {
          updateAll ? self.updateView() : self.updateSubView(data, item.item);
        });
      }
    },

    getDataKey: function(target) {
      var item = this.getTarget(target);
      return {
        item: item,
        dataKey: item.attr('data-key')
      };
    },

    getTarget: function(target) {
      var voteItem = $(target);
      var parents = voteItem.parents('[data-key]');
      return (parents.length ? parents : voteItem);
    }

  });

  /*
  var params = {
    datas: datas,
    item : $item,
    target : target,
    isAnimate: this.option('animate'),
    supWidth: getPercent(supPercent, maxWidth),
    supHeight: getPercent(supPercent, maxHeight),
    oppWidth: getPercent(oppPercent, maxWidth),
    oppHeight: getPercent(oppPercent, maxHeight)
  }*/

  var dictionary = {
    'sup-width': function(params) {
      if (params.isAnimate) {
        params.target.animate({
          width: params.supWidth
        });
      } else {
        params.target.width(params.supWidth);
      }
    },

    'sup-height': function(params) {
      if (params.isAnimate) {
        params.target.animate({
          height: params.supHeight
        });
      } else {
        params.target.height(params.supHeight);
      }
    },

    'opp-width': function(params) {
      if (params.isAnimate) {
        params.target.animate({
          width: params.oppWidth
        });
      } else {
        params.target.width(params.oppWidth);
      }
    },

    'opp-height': function(params) {
      if (params.isAnimate) {
        params.target.animate({
          height: params.oppHeight
        });
      } else {
        params.target.height(params.oppHeight);
      }
    },

    'sup-percent': function(params) {
      params.target.text(Math.round(params.datas.supPercent) + '%');
    },

    'opp-percent': function(params) {
      params.target.text(Math.round(params.datas.oppPercent) + '%');
    },

    'support': function(params) {
      params.target.text(params.datas.count);
    },

    'oppose': function(params) {
      params.target.text(params.datas.oppose);
    }

  };

  module.exports = SupportUi;

});
