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
    template = require('./mvote.handlebars');

  //Handlebars helper, 把投票选项的序号+1
  var handleHelper = Handlebars.registerHelper("plusOne", function(index){
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
      baseClass: '.vote'
    },

    setup: function() {

      var $el = $(this.option('baseClass'));
      if($el.length < 1){
       return;
      }
      $el.hide();
      var voteIds = [];
      for(var i = 0; i < $el.length; i++){
        voteIds.push($el.eq(i).find('[name=vote_id]').val());
      }
      this.getVoteData(voteIds);
    },

    /**
     * 获取投票数据
     * @method getVoteData
     * @param  {Array} voteIds 投票ID的数组集合
     */
    getVoteData: function(voteIds){
      var self = this;
      $.ajax({
        url: self.option('voteInfoUrl'),
        data: {
          id: voteIds.join()
        },
        dataType: 'JSONP',
        success: function(data){
          $(self.option('baseClass')).each(function(i, el){
            $(this).replaceWith(template(data.votelist[i]));
          })
          self.bindVote();
        }
      })
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
          totalNum = parseInt($totalNum.text());

        $.ajax({
          url: self.option('voteProcUrl'),
          data: {
            voteitem: voteitem,
            voteid: voteid
          },
          dataType: 'JSONP',
          success: function(data){
            if(data.code == 1){
              var $resultItem = $vote.find('.vote-result [data-itemid=' + voteitem + ']');
              $totalNum.text(totalNum + 1);
              $resultItem.attr('data-itemnum', parseInt($resultItem.data('itemnum')) + 1).addClass('voted')
                .find('.itemnum').text($resultItem.data('itemnum') + 1);
              totalNum++;
            }
            $vote.find('.vote-result dd').each(function(){
              var width = $(this).data('itemnum') / totalNum * 100 + '%';
              $(this).find('.nums').css({width: width});
            })
            $vote.find('.vote-main').hide();
            $vote.find('.vote-result').show();
            new Tips({
              content: data.msg,
              importStyle: true
            })
          }
        })
      })
    }

  });

  module.exports = Mvote;

});