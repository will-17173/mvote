define(function(require, exports, module) {
  /**
   * 投票组件，封装基础UI事件
   *
   * @module Vote
   */
  'use strict';

  var $ = require('$'),
    Widget = require('widget'),
    SingleVote = require('./singlevote'),
    MultipleVote = require('./multiplevote');

  /**
   * 投票组件，封装基础UI事件
   * @class Vote
   * @extends widget
   * @constructs
   */
  var Vote = Widget.extend({

    defaults: {
      multiple: false, //是否是多选
      animate: true, //是否开启动画效果
      maxBar: false, //长度是否以最高票的为参照，默认为所有票数。
      handle: null, //点击的选择器
      maxHeight: null, //配置后高度会转成px值，否则用百分比.
      maxWidth: null,
      maxClass: null, //配置投票最多项的样式
      channel: null, //频道号
      kind: '1', //页面类型
      webId: null, //页面id
      voteTip: undefined,
      ipRepeatTip: undefined,
      errorTip: undefined,
      baseElement: undefined,
      container: null,
      classPrefix: 'ue-component ue-vote'
    },

    initialize: function(defaults) {
      if (defaults.handle) {
        defaults.delegates = {};
        defaults.delegates['click ' + defaults.handle] = 'handle';
      }
      Vote.superclass.initialize.apply(this, arguments);
    },

    setup: function() {
      var element = $(this.option('element'));
      var multiple = this.option('multiple');
      var baseElement = this.option('baseElement');
      var dataKey = [];
      var parame;

      element.find('[data-key]').each(function() {
        dataKey.push($(this).attr('data-key'));
      });

      parame = {
        channel: this.option('channel'),
        kind: this.option('kind'),
        baseElement: baseElement ? $(baseElement) : element,
        voteTip: this.option('voteTip'),
        ipRepeatTip: this.option('ipRepeatTip'),
        errorTip: this.option('errorTip')
      };

      if (multiple) {
        parame.webIds = dataKey;
        this.vote = new MultipleVote(parame);
      } else {
        parame.webId = this.option('webId');
        this.vote = new SingleVote(parame);
      }
      this.render();
      this.updateView();
    },

    updateView: function() {
      var self = this;
      var vote = this.vote;
      vote.load(function(data) {
        self.globalView(data);
        self.itemView(data);
      });
    },

    globalView: function(data) {
      var item;
      var views = ['total', 'max'];
      for (var i = views.length - 1; i >= 0; i--) {
        item = views[i];
        this.$('[data-' + item + ']').text(data[item]);
      }
    },

    itemView: function(data) {
      var self = this;
      var views = ['width', 'height', 'percent', 'count'];
      this.$('[data-key]').each(function() {
        var $item = $(this);
        var datas = data[$item.attr('data-key')];
        for (var i = views.length - 1; i >= 0; i--) {
          self.typeRender(datas, $item, views[i]);
        }
      });
    },

    typeRender: function(datas, $item, type) {
      var $target = $item.find('[data-' + type + ']');
      var isAnimate = this.option('animate');
      var maxWidth = this.option('maxWidth');
      var maxHeight = this.option('maxHeight');
      var percent = this.option('maxBar') ? datas.viewPercent : datas.percent;
      var width = maxWidth ? percent / 100 * maxWidth : percent + '%';
      var height = maxHeight ? percent / 100 * maxHeight : percent + '%';

      switch (type) {
        case 'width':
          if (isAnimate) {
            $target.animate({
              width: width
            });
          } else {
            $target.width(width);
          }
          break;
        case 'height':
          if (isAnimate) {
            $target.animate({
              height: height
            });
          } else {
            $target.height(height);
          }
          break;
        case 'percent':
          $target.text(Math.round(datas.percent) + '%');
          break;
        case 'count':
          $target.text(Math.round(datas.count));
          break;
      }

      if (datas.isMax) {
        $item.addClass(this.option('maxClass'));
      }
    },

    handle: function(e) {
      var self = this;

      var voteItem = $(e.currentTarget);
      var parents = voteItem.parents('[data-key]');
      var dataKey = parents.length ? parents : voteItem;

      dataKey = dataKey.attr('data-key');

      if (dataKey) {
        self.vote.vote(dataKey, function() {
          self.updateView();
        });
      }
    }

  });

  module.exports = Vote;

});
