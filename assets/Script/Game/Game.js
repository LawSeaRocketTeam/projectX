var Common = require("Common")

cc.Class({
    extends: cc.Component,

    properties: {
        spBg : cc.Node,
        shootNode : cc.Node,
        initCount: 4,   //初始化生成个数
        generateDelta:1,    //每过多长时间生成1个
    },

    // LIFE-CYCLE CALLBACKS:
    onLoad () {
        //
        cc.vv = {};
        cc.vv.gameNode = this.node;
        //cc.game.setFrameRate(45);
        this.targetsMgr = this.getComponent("TargetsMgr");
        this.shootCtrl = this.shootNode.getComponent("ShootController");
        this.mapMgr = this.spBg.getComponent("MapMgr");
        this.jieSuanNode = cc.find("Canvas/NodeJieSuan");
        this.UINode = cc.find("Canvas/UINode");
        //开启碰撞检测系统
        cc.director.getCollisionManager().enabled = true;

        //修改设计区域大小
        this.ShootTouchNode = cc.find("Canvas/ShootTouchNode");
        this.ShootTouchNode.width = cc.winSize.width / 2;
        //监听时间
        this.node.on("event_gameover",this._on_gameOver,this);
        //cc.director.getCollisionManager().enabledDebugDraw = true;
     },

    start () {

    },

    update (dt) {

    },

    _on_gameOver: function () {
        this.jieSuanNode.active = true;
        this.UINode.active = false;
        this.targetsMgr.removeAllTargets();
    },

    //生成时间目标
    //param1:目标类型(长期或者短期怪)
    //param2：存活时间 -1为永远存活
    //param3:移动速度
    //param4:缩放大小
    //生成数量
    // _generateTermTarget : function(_type,_activeTime,_speed,_scale,_count){
    //     if(_type != Common.TargetType.ShortTerm && _type != Common.TargetType.LongTerm){
    //         return;
    //     }
    //     let target = this.targetsMgr.getIdleTarget();
    //     let targetController = target.getComponent("TargetController");
    //     //在射击点附近取一个点,在该点附近生成对应个数的目标
    //     let shootPoint = this.shootCtrl.getShootPoint();
    //     //在射击点300个像素范围内取一个点
    //     let rangePoint = Common.randomFromPoint(shootPoint,500);
    //     //在shootPoint指定范围内,生成怪
    //     for(i = 0; i < _count; i++){
    //         let genPoint = Common.randomFromPoint(rangePoint,300);
    //         //检测节点是否跟其他目标有重叠
    //         let target = this.targetsMgr.checkPointIsInTargets(genPoint);
    //         if(target != undefined){
                
    //         }
    //         cc.sequence(cc.delayTime(i * 0.2),cc.callFunc(function(){

    //         },this,""));
    //     }
    //     targetController.refresh(_type,cc.v2(200,200),_activeTime,_speed,_scale);
    //     target.parent = this.spBg
    // },

    // onGenerateLongTermClick : function()
    // {
    //     // var target = this.targetsMgr.getIdleTarget();
    //     // var targetController = target.getComponent("TargetController");
    //     // targetController.refresh(1,cc.v2(200,200),30,30,50);
    //     // target.parent = this.spBg

    //     this.mapMgr.generateTermTargetsNearShootPos(50,4,Common.TargetType.LongTerm,-1,0.2);
    // },

    // onGenerateShortTermClick : function()
    // {
    //     // var target = this.targetsMgr.getIdleTarget();
    //     // var targetController = target.getComponent("TargetController");
    //     // targetController.refresh(1,cc.v2(200,200),30,30,50);
    //     // target.parent = this.spBg

    //     this.mapMgr.generateTermTargetsNearShootPos(50,4,Common.TargetType.ShortTerm,10,0.2);
    // },

    onRestartClick:function(event, customEventData){
        this.jieSuanNode.active = false;
        this.UINode.active = true;
        this.spBg.position = cc.v2(0,0)
    },
    
    onGenerateClick:function(event, customEventData){
        if(customEventData == Common.TargetType.ShortTerm){
            this.mapMgr.generateTermTargetsNearShootPos(50,4,Common.TargetType.ShortTerm,10,0.2);
        }
        else if(customEventData == Common.TargetType.LongTerm){
            this.mapMgr.generateTermTargetsNearShootPos(50,4,Common.TargetType.LongTerm,-1,0.2);
        }
        else if(customEventData == Common.TargetType.RandomMove){
            this.mapMgr.generateMoveTargetNearShootPos(Common.TargetType.RandomMove,50,300,100);
        }
        else if(customEventData == Common.TargetType.HideRandomMove){
            let tarCtrl = this.mapMgr.generateMoveTargetNearShootPos(Common.TargetType.HideRandomMove,50,300,100);
            tarCtrl.setShowAndHideTime(5,3);
        }
        else if(customEventData == Common.TargetType.IntRandomMove){
            let tarCtrl = this.mapMgr.generateMoveTargetNearShootPos(Common.TargetType.IntRandomMove,50,300,100);
            tarCtrl.setMoveAndStopTime(5,1.5);
        }
        else if(customEventData == Common.TargetType.Move){
            let tarCtrl = this.mapMgr.generateMoveTargetNearShootPos(Common.TargetType.Move,50,300,100);
            let arr = [];
            arr.push(tarCtrl.node.position);
            //随机生成三个点
            for(let i = 0; i < 3; i++){
                let x = Common.randomFrom(-1500,1500,true);
                let y = Common.randomFrom(-800,800,true);
                arr.push(cc.v2(x,y));
            }
            tarCtrl.setMoveArray(arr);
        }
        else if(customEventData == Common.TargetType.HideMove){
            let tarCtrl = this.mapMgr.generateMoveTargetNearShootPos(Common.TargetType.HideMove,50,300,100);
            let arr = [];
            arr.push(tarCtrl.node.position);
            //随机生成三个点
            for(let i = 0; i < 3; i++){
                let x = Common.randomFrom(-1500,1500,true);
                let y = Common.randomFrom(-800,800,true);
                arr.push(cc.v2(x,y));
            }
            tarCtrl.setMoveArray(arr);
            tarCtrl.setShowAndHideTime(5,3);
        }
        else if(customEventData == Common.TargetType.SplitMove){
            this.mapMgr.generateMoveTargetNearShootPos(Common.TargetType.SplitMove,50,150,100);
        }
        else if(customEventData == Common.TargetType.People){
            this.mapMgr.generateMoveTargetNearShootPos(Common.TargetType.People,50,300,100);
        }
        else if(customEventData == Common.TargetType.SpyMove){
            let tarCtrl = this.mapMgr.generateMoveTargetNearShootPos(Common.TargetType.SpyMove,50,300,100);
            tarCtrl.setSpyAndManTime(3,3);
        }
    },
});
