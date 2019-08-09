// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        icon:cc.Node,
        operateSettingLayer : cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

     onLoad () {
         cc.vv = {} //存储游戏全局的东西
         var DataMgr = require("DataMgr");
         cc.vv.dataMgr = new DataMgr();
         
     },

    start () {
        this.operateSettingLayer.active = false
        let action1 = cc.moveTo(5,cc.v2(230,287));
        let action2 = cc.moveTo(5,cc.v2(-230,287));
        let action3 = cc.sequence(action1,action2);
        this.icon.runAction(cc.repeatForever(action3));
    },

    onGuanKaClick:function(event, customEventData){
        cc.director.loadScene("gameScene");
    },

    onWuJinClick:function(event, customEventData){

    },

    onOperaSettingClick:function(event, customEventData){
        this.operateSettingLayer.active = true;
    }

    // update (dt) {},
});
