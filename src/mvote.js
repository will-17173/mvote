define(function(require, exports, module) {
  /**
   * 投票
   *
   * @module Mvote
   */
  'use strict';

  var $ = require('$'),
    Widget = require('widget'),
    Handlebars = require('handlebars'),
    Tips = require('tips'),
    importStyle = require('./style.css'),
    template = require('./mvote.handlebars');

  //FastClick, 消除移动端300ms点击延迟
  var attachFastClick = require('./fastclick');
  attachFastClick(document.body);

  //Handlebars helper, 把投票选项的序号+1
  var handleHelper = Handlebars.registerHelper('plusOne', function(index){
    return index + 1;
  });

  /**
   * 根据CMS2.0输出的投票内容生成新的适用于移动端的投票组件
   * @class Mvote
   * @extends Widget
   * @constructs
   */
  var Mvote = Widget.extend({

    defaults: {

      /**
       * 是否使用默认样式 
       * @attribute importStyle
       * @type {Boolean}
       */   
      importStyle: true,

      /**
       * 投票信息请求地址
       * @attribute voteInfoUrl
       * @type {String}
       */
      voteInfoUrl: 'http://vote.17173.com/port/getvote_interface.php',

      /**
       * 投票提交地址
       * @attribute voteProcUrl
       * @type {String}
       */     
      voteProcUrl: 'http://vote.17173.com/action/vote_process_interface.php',

      /**
       * 要处理的投票class
       * @attribute baseClass
       * @type {String}
       */
      baseClass: '.vote',

      /**
       * 手工插入投票ID
       * @attribute voteIds
       * @type {Array}
       */ 
      voteIds: [],

      /**
       * 手工投票插入的元素(jQuery选择器)
       * @attribute voteId
       * @type {Array}
       */ 
      appendToElement: '',

      /**
       * 是否删除页面中原有投票
       * @attribute removeOldVote
       * @type {Boolean}
       */ 
      removeOldVote: false
    },

    setup: function() {

      var $el = $(this.option('baseClass'));
      if($el.length < 1){
       return;
      }
      this.option('importStyle') && importStyle();
      $el.hide();

      if(!this.option('removeOldVote')){
        var voteIds = [];
        for(var i = 0; i < $el.length; i++){
          voteIds.push($el.eq(i).find('[name=vote_id]').val());
        }
        this.getVoteData(voteIds);
      }

      if(this.option('voteIds').length > 0){
        this.getVoteData(this.option('voteIds'), true);
      }
      
    },

    /**
     * 获取投票数据
     * @method getVoteData
     * @param  {Array} voteIds 投票ID的数组集合
     * @param  {Boolean} appendToEl 是否手动插入投票
     */
    getVoteData: function(voteIds, appendToEl){
      var self = this;
      $.ajax({
        url: self.option('voteInfoUrl'),
        data: {
          id: voteIds.join()
        },
        dataType: 'JSONP',
        success: function(data){
          if(appendToEl){
            for(var i = 0; i < voteIds.length; i++){
              $(template(data.votelist[i])).appendTo(self.option('appendToElement') || 'body');
            }
          } else{
            $(self.option('baseClass')).each(function(i, el){
              $(this).replaceWith(template(data.votelist[i]));
            });     
          }
          self.bindVote();
        }
      });
    },

    /**
     * 绑定投票事件 
     * @method bindVote
     */
    bindVote: function(){
      var self = this,
        $vote;

      $('.vote-main dd').on('click', function(){
        $vote = $(this).parents('.pn-vote');
        var voteitem = $(this).data('itemid'),
          voteid = $(this).parents('[data-voteid]').data('voteid'),
          $totalNum = $vote.find('.vote-meta span'),
          totalNum = parseInt($totalNum.text(), 10);

        $.ajax({
          url: self.option('voteProcUrl'),
          data: {
            voteitem: voteitem,
            voteid: voteid
          },
          dataType: 'JSONP',
          success: function(data){
            if(data.code == 1){
              totalNum++;
              $totalNum.text(totalNum);
              var $resultItem = $vote.find('.vote-result [data-itemid=' + voteitem + ']');
              $resultItem.attr('data-itemnum', parseInt($resultItem.attr('data-itemnum'), 10) + 1).addClass('voted')
                .find('.itemnum').text($resultItem.attr('data-itemnum'));
            }
            $vote.find('.vote-result dd').each(function(){
              var width = $(this).attr('data-itemnum') / totalNum * 100 + '%';
              $(this).find('.nums').css({width: width});
            });
            $vote.find('.vote-main').hide();
            $vote.find('.vote-result').show();
            new Tips({
              content: data.msg,
              importStyle: true
            });
          }
        });
      });
    }

  });

  module.exports = Mvote;

});
