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
        lbCoin : cc.Label,
        lbKill : cc.Label,
        lbRate : cc.Label,
        lbCombo : cc.Label,
        lbReaction : cc.Label,
        lbName : cc.Label,
        nCoin : cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    showJieSuan : function(_isSucc){
        this.node.active = true;
        if(_isSucc){
            this.lbName.string = cc.vv.i18n.t("js_success")
            this.nCoin.active = true;
        }
        else{
            this.lbName.string = cc.vv.i18n.t("js_failed")
            this.nCoin.active = false;
        }
    },

    onMenuClick:function(event, customEventData){   
        cc.director.loadScene("loginScene");
    },

    onNextClick:function(event, customEventData){
    },

    // update (dt) {},
});
