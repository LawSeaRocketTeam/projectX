var Common = require("Common")
//const i18n = require('LanguageData');

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
       // i18n.init( cc.sys.language)
        cc.vv.gameNode = this.node;
        //cc.game.setFrameRate(45);
        this.targetsMgr = this.getComponent("TargetsMgr");
        this.shootCtrl = this.shootNode.getComponent("ShootController");
        this.mapMgr = this.spBg.getComponent("MapMgr");
        this.jieSuanNode = cc.find("Canvas/NodeJieSuan");
        this.UINode = cc.find("Canvas/UINode");
        this.btNode = cc.find("Canvas/Node_button");
        this.btBack = cc.find("bt_back",this.UINode);
        this.introduceNode = cc.find("Canvas/NodeIntroduce");
        this.lbHitRate = cc.find("Canvas/UINode/lb_hitValue").getComponent(cc.Label);
        //开启碰撞检测系统
        cc.director.getCollisionManager().enabled = true;

        //修改射击区域大小
        this.ShootTouchLeftNode = cc.find("Canvas/ShootTouchLeftNode");
        this.ShootTouchRightNode = cc.find("Canvas/ShootTouchRightNode");
        this.ShootTouchLeftNode.width = cc.winSize.width / 2;
        this.ShootTouchRightNode.width = cc.winSize.width / 2;
        //监听时间
        this.node.on("event_gameover",this._on_gameOver,this);
        this.node.on("map_load_finish",this._mapLoadFinish,this);
        this.node.on("game_all_targets_clear",this._allTargetClear,this);
        this.node.on("game_set_hitrate",this._setHitRate,this)
        //cc.director.getCollisionManager().enabledDebugDraw = true;
        //TEST模式
     },

    start () {
        if(cc.vv.dataMgr.opSetting.op == 0){
            //左手准星
            this.ShootTouchLeftNode.active = true;
            this.ShootTouchRightNode.active = false;
        }
        else{
            //右手准星
            this.ShootTouchLeftNode.active = false;
            this.ShootTouchRightNode.active = true;
        }
    },

    update (dt) {

    },

    //初始化关卡数据
    _initTaskData : function(){
        this.guanQiaId = cc.vv.sceneParam.id;
        /** this.gqCfgData 数据结构
         *  {
            "gId": 1011,
            "gTargetType": 1,   1为射击指定数量的目标(ID,数量) 2为坚持X秒(秒) 3为完成X次完美射击(数量) 4为守护要塞(堡垒id)
            "typeParam": "10001,10",
            "limitTime": 120,   限时
            "limitBullet": -1,  子弹限制
            "limitTarget": -1,  限制目标(平民ID)
            "limitMissCount": -1,   失误次数上限
            "limitDisappear": -1,   限制消失（怪物id,怪物id）
            "uMonsterId": 101,  怪物集id
            "uManId": -1,       平民集id
            "uSupplyId": -1,    补给集id
            "goldAward": 50     获得奖励
            },
         */
        this.gqCfgData = cc.vv.dataMgr.getGuanQiaCfgDataById(this.guanQiaId);
        this.taskParam = this.gqCfgData.typeParam.split(',');   //不同任务类型有不同的参数
        this.uMonsterCfgData = cc.vv.dataMgr.getMonsterCfgDataByUid(this.gqCfgData.uMonsterId); //怪物集配置数据
        this.uMenCfgData = cc.vv.dataMgr.getMenCfgDataByUid(this.gqCfgData.uManId); //平民集配置数据
        this.uSupplyCfgData = cc.vv.dataMgr.getSupplyCfgDataByUid(this.gqCfgData.uSupplyId);    //补给集配置数据
    },

    //显示关卡任务介绍
    _showTaskIntroduce : function(){
        this.introduceNode.active = true;
        this.UINode.active = false;
        let lbContent = cc.find("lbIntroduce",this.introduceNode).getComponent(cc.Label)
        let content = ""
        if(this.gqCfgData.gTargetType == 1){
            content = cc.vv.i18n.t("game_task_info_content1")
            content = Common.stringFormat(content,this.gqCfgData.limitTime,this.taskParam[1]);
        }
        lbContent.string = content
        let ac1 = cc.fadeOut(3);
        let ac2 = cc.callFunc(function(){
            this.UINode.active = true;
        }, this, "");
        let ac3 = cc.sequence(ac1,ac2);
        this.introduceNode.runAction(ac3)
    },

    //地图管理控件加载完毕
    _mapLoadFinish : function(){
        if(cc.vv.sceneParam.gameMode == "test"){
            //为操控的游戏测试模式
            this.btNode.active = false;
            this.btBack.active = true;
            this._testGame();
        }
        else if(cc.vv.sceneParam.gameMode == "guanka"){
            //this.btNode.active = true;
            this.btBack.active = false;
            this._initTaskData();
            this._showTaskIntroduce();
        }
    },

    //操作测试
    _testGame : function() {
        //生成10个长期驻守目标
        this.mapMgr.generateTermTargetsNearShootPos(50,10,Common.TargetType.LongTerm,-1,0);
    },

    //所有目标被清空
    _allTargetClear : function(){
        if(cc.vv.sceneParam.gameMode == "test"){
            this._testGame();
        }
    },

    //设置命中率
    _setHitRate : function(){
        this.lbHitRate.string = this.shootCtrl.getHitRate() + "%"
    },

    _on_gameOver: function () {
        this.jieSuanNode.active = true;
        this.UINode.active = false;
        this.targetsMgr.removeAllTargets();
    },

    onRestartClick:function(event, customEventData){
        //this.jieSuanNode.active = false;
        //this.UINode.active = true;
        this.spBg.position = cc.v2(0,0)        
        cc.director.loadScene("loginScene");
    },

    onBackClick : function(event, customEventData){
        this.targetsMgr.removeAllTargets();
        cc.vv.sceneParam.showLayer = "opSetting";
        cc.director.loadScene("loginScene");
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
