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
        radius:30,
        spBg:cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.targetsMgr = cc.find("Canvas").getComponent("TargetsMgr");
        //画靶心
        var g = this.getComponent(cc.Graphics);
        var r = this.radius
        var d = 2 * r;
        g.lineWidth = 2;
        g.strokeColor.fromHEX('#ff0000');    
        //g.circle(0, 0, r);
        //g.stroke();
        g.moveTo(-r, 0);
        g.lineTo(r, 0);
        g.stroke();
        g.moveTo(0, -r);
        g.lineTo(0, r);
        g.stroke();
        g.close();

        this.shootCount = 0;    //射击次数
        this.hitCount = 0;      //命中次数
    },

    start () {

    },

    //获取当前射击点在地图上的位置
    getShootPoint : function(){
        //先把标靶节点转换成世界坐标
        let posWorld = this.node.convertToWorldSpaceAR(this.node.position);
        //把世界坐标转换成在spBG上的坐标
        let posConverSpBg = this.spBg.convertToNodeSpaceAR(posWorld);
        return posConverSpBg;
    },

    //射击
    shootTarget : function(){
       //检测射击点是否在目标内
       this.shootCount++;
       if(this.targetsMgr.checkTargetsBeShoot(this.getShootPoint())){
           this.hitCount++;
       }
       cc.vv.gameNode.emit("game_set_hitrate")
    },

    getHitRate : function(){
        return Math.floor(this.hitCount / this.shootCount * 100);
    }

    // update (dt) {},
});
