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
        floatNode : cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    show : function(_text,_leftBtTxt,_leftFunc,_rightBtTxt,_rightFunc){
        if(_leftBtTxt == undefined && _rightBtTxt == undefined){
            //如果左右按钮皆为空，默认用飘窗
            this.floatNode.active = true;
            let lbTxt = this.floatNode.getChildByName("lbTxt").getComponent(cc.Label);
            lbTxt.string = _text;
            let ac1 = cc.moveTo(3,cc.v2(this.floatNode.x - 0,this.floatNode.y + 400));
            let ac2 = cc.fadeOut(3);
            let ac3 = cc.spawn(ac1,ac2);
            let ac4 = cc.callFunc(function () {
                this.node.removeFromParent();
            }, this, "");
            let ac5 = cc.sequence(ac3,ac4);
            this.floatNode.runAction(ac5);
        }
        else{

        }
    }

    // update (dt) {},
});
