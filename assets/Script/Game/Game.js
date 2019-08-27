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
        this.node.on("event_game_jiesuan",this._on_game_jiesuan,this);
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
        this.isGameInit = false
        this.spBg.position = cc.v2(0,0) 
    },

    update (dt) {
        if(this.isGameInit){
            this._updateMonsters(dt);
        }
    },

    //根据怪物的配置数据，对怪物的定期刷新
    _updateMonsters : function(_dt){
        for(let k in this.uMonsterCfgData){
            let monsterData = this.uMonsterCfgData[k];
            if(monsterData.updateDelta == undefined){
                //新增一个累计时间记录
                monsterData.updateDelta = 0;
                //如果初始生成时间为0，则生成一个怪
                if(monsterData.initGenTime == 0){
                    //生成怪
                    this._generateMonster(monsterData,50);
                }
            }
            monsterData.updateDelta += _dt;
            if(monsterData.updateDelta > monsterData.refreshInteval){
                //判断是否能同时存在
                if(monsterData.isCoexist){
                    //生成怪
                    this._generateMonster(monsterData,50);
                    //重置更新累计时间
                    monsterData.updateDelta = 0
                }
                else{
                    //判断场上是否有同类型怪
                }
            }
        }
    },

    _updateTimer : function(){
        if(this.limitTime != undefined && this.limitTime > 0){
            this.limitTime--;
            this.lbLimitTime.string = this.limitTime;
            if(this.limitTime == 0){
                if(this.gqCfgData != 2){
                    cc.vv.gameNode.emit("event_game_jiesuan",{isSucc:false});
                }
            }
        }
    },

    //初始化游戏
    _initGame : function(){
        this.UINode.active = true;
        for(let i = 1; i < 4; i++){
            cc.find("lbLimit" + i,this.UINode).active = false
        }
        //显示限制条件
        let limitIdx = 1;
        //限时
        if(this.gqCfgData.limitTime != -1){
            let path = "lbLimit" + limitIdx
            let nameNode = cc.find("lbLimit" + limitIdx,this.UINode)
            let lbName = nameNode.getComponent(cc.Label);
            nameNode.active = true;
            lbName.string = cc.vv.i18n.t("game_time")
            this.lbLimitTime = cc.find(path + "/lbLimitValue",this.UINode).getComponent(cc.Label);
            this.limitTime = 20;
            this.lbLimitTime.string = this.limitTime;
            limitIdx++;
        }
        //限制子弹
        if(this.gqCfgData.limitBullet != -1){
            let path = "lbLimit" + limitIdx
            let nameNode = cc.find("lbLimit" + limitIdx,this.UINode)
            let lbName = nameNode.getComponent(cc.Label);
            nameNode.active = true;
            lbName.string = cc.vv.i18n.t("bullet_count")
            this.lbLimitBullet = cc.find(path + "/lbLimitValue",this.UINode).getComponent(cc.Label);
            this.limitBullet = this.gqCfgData.limitBullet;
            limitIdx++;
        }
        //失误限制
        if(this.gqCfgData.limitMissCount != -1){
            let path = "lbLimit" + limitIdx
            let nameNode = cc.find("lbLimit" + limitIdx,this.UINode)
            let lbName = nameNode.getComponent(cc.Label);
            nameNode.active = true;
            lbName.string = cc.vv.i18n.t("miss_count")
            this.lbLimitMiss = cc.find(path + "/lbLimitValue",this.UINode).getComponent(cc.Label);
            this.limitMiss = this.gqCfgData.limitMissCount;
            limitIdx++;
        }
        //开启一个一秒执行一次的定时器，用作倒计时
        this.schedule(this._updateTimer,1);
        this.isGameInit = true;
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
            this._initGame();
        }, this, "");
        let ac3 = cc.sequence(ac1,ac2);
        this.introduceNode.runAction(ac3)
    },

    //判断是否达到胜利条件
    _isWin : function(){
        if(this.gqCfgData.gTargetType == 1){

        }
        else if(this.gqCfgData.gTargetType == 2){

        }
        else if(this.gqCfgData.gTargetType == 3){
            
        }
        else if(this.gqCfgData.gTargetType == 4){
            
        }
    },

    //判断是否触发失败条件
    _isLose : function(){

    },

    _generateMonster : function(_monsterData,_radius){
        if(_monsterData.monsterType == Common.TargetType.ShortTerm){
            this.mapMgr.generateTermTargetsNearShootPos(_radius,1,Common.TargetType.ShortTerm,_monsterData.timer);
        }
        else if(_monsterData.monsterType == Common.TargetType.LongTerm){
            this.mapMgr.generateTermTargetsNearShootPos(_radius,1,Common.TargetType.LongTerm);
        }
        else if(_monsterData.monsterType == Common.TargetType.RandomMove){
            this.mapMgr.generateMoveTargetNearShootPos(Common.TargetType.RandomMove,_radius,_monsterData.speed,150);
        }
        else if(_monsterData.monsterType == Common.TargetType.HideRandomMove){
            let tarCtrl = this.mapMgr.generateMoveTargetNearShootPos(Common.TargetType.HideRandomMove,_radius,_monsterData.speed,150);
            tarCtrl.setShowAndHideTime(_monsterData.showDelta,_monsterData.hideDelta);
        }
        else if(_monsterData.monsterType == Common.TargetType.IntRandomMove){
            let tarCtrl = this.mapMgr.generateMoveTargetNearShootPos(Common.TargetType.IntRandomMove,_radius,_monsterData.speed,150);
            tarCtrl.setMoveAndStopTime(_monsterData.stopInterval,_monsterData.stopDelta);
        }
        else if(_monsterData.monsterType == Common.TargetType.Move){
            let tarCtrl = this.mapMgr.generateMoveTargetNearShootPos(Common.TargetType.Move,_radius,_monsterData.speed,150);
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
        else if(_monsterData.monsterType == Common.TargetType.HideMove){
            let tarCtrl = this.mapMgr.generateMoveTargetNearShootPos(Common.TargetType.HideMove,_radius,_monsterData.speed,150);
            let arr = [];
            arr.push(tarCtrl.node.position);
            //随机生成三个点
            for(let i = 0; i < 3; i++){
                let x = Common.randomFrom(-1500,1500,true);
                let y = Common.randomFrom(-800,800,true);
                arr.push(cc.v2(x,y));
            }
            tarCtrl.setMoveArray(arr);
            tarCtrl.setShowAndHideTime(_monsterData.showDelta,_monsterData.hideDelta);
        }
        else if(_monsterData.monsterType == Common.TargetType.SplitMove){
            this.mapMgr.generateMoveTargetNearShootPos(Common.TargetType.SplitMove,_radius,_monsterData.speed,150);
        }
        else if(_monsterData.monsterType == Common.TargetType.People){
            this.mapMgr.generateMoveTargetNearShootPos(Common.TargetType.People,_radius,_monsterData.speed,150);
        }
        else if(_monsterData.monsterType == Common.TargetType.SpyMove){
            let tarCtrl = this.mapMgr.generateMoveTargetNearShootPos(Common.TargetType.SpyMove,_radius,_monsterData.speed,150);
            tarCtrl.setSpyAndManTime(_monsterData.manShowInterval,_monsterData.manShowDelta);
        }
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
        /**
         * {
            "uMonsterId": 101,
            "monsterId": 10001,
            "img": "",
            "monsterType": 1,
            "initGenTime": 0,
            "isCoexist": 1,
            "refreshInteval": 3,
            "isRefreshDied": 0,
            "isGenOnStart": 0,
            "genPos": 0,
            "movEndPos": -1,
            "timer": -1,
            "initHideTime": -1,
            "hideDelta": -1,
            "showDelta": -1,
            "initStop": -1,
            "stopInterval": -1,
            "stopDelta": -1,
            "speed": -1,
            "isSplit": 0,
            "childId": -1,
            "initManTime": -1,
            "manShowDelta": -1,
            "manShowInterval": -1,
            "manShowCount": -1,
            "monsterHp": 1
        },
         */
        this.uMonsterCfgData = cc.vv.dataMgr.getMonsterCfgDataByUid(this.gqCfgData.uMonsterId); //怪物集配置数据
        this.uMenCfgData = cc.vv.dataMgr.getMenCfgDataByUid(this.gqCfgData.uManId); //平民集配置数据
        this.uSupplyCfgData = cc.vv.dataMgr.getSupplyCfgDataByUid(this.gqCfgData.uSupplyId);    //补给集配置数据
        
    },

    //操作测试
    _testGame : function() {
        //生成10个长期驻守目标
        this.mapMgr.generateTermTargetsNearShootPos(50,10,Common.TargetType.LongTerm,-1,0);
    },

    //------------------------------------------------------------监听事件Begin-------------------------------

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

    _on_game_jiesuan: function (event) {
        let param = event;
        let jieSuanUI = this.jieSuanNode.getComponent('JieSuan');
        jieSuanUI.showJieSuan(param.isSucc);
        this.UINode.active = false;
        this.targetsMgr.removeAllTargets();
    },
     //------------------------------------------------------------监听事件End------------------------------------



    //---------------------------------------------------点击事件回调begin-----------------------------------------

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
    
    //--------------------------------------------------点击事件回调End----------------------------------------------


    // onGenerateClick:function(event, customEventData){
    //     if(customEventData == Common.TargetType.ShortTerm){
    //         this.mapMgr.generateTermTargetsNearShootPos(50,4,Common.TargetType.ShortTerm,10,0.2);
    //     }
    //     else if(customEventData == Common.TargetType.LongTerm){
    //         this.mapMgr.generateTermTargetsNearShootPos(50,4,Common.TargetType.LongTerm,-1,0.2);
    //     }
    //     else if(customEventData == Common.TargetType.RandomMove){
    //         this.mapMgr.generateMoveTargetNearShootPos(Common.TargetType.RandomMove,50,300,100);
    //     }
    //     else if(customEventData == Common.TargetType.HideRandomMove){
    //         let tarCtrl = this.mapMgr.generateMoveTargetNearShootPos(Common.TargetType.HideRandomMove,50,300,100);
    //         tarCtrl.setShowAndHideTime(5,3);
    //     }
    //     else if(customEventData == Common.TargetType.IntRandomMove){
    //         let tarCtrl = this.mapMgr.generateMoveTargetNearShootPos(Common.TargetType.IntRandomMove,50,300,100);
    //         tarCtrl.setMoveAndStopTime(5,1.5);
    //     }
    //     else if(customEventData == Common.TargetType.Move){
    //         let tarCtrl = this.mapMgr.generateMoveTargetNearShootPos(Common.TargetType.Move,50,300,100);
    //         let arr = [];
    //         arr.push(tarCtrl.node.position);
    //         //随机生成三个点
    //         for(let i = 0; i < 3; i++){
    //             let x = Common.randomFrom(-1500,1500,true);
    //             let y = Common.randomFrom(-800,800,true);
    //             arr.push(cc.v2(x,y));
    //         }
    //         tarCtrl.setMoveArray(arr);
    //     }
    //     else if(customEventData == Common.TargetType.HideMove){
    //         let tarCtrl = this.mapMgr.generateMoveTargetNearShootPos(Common.TargetType.HideMove,50,300,100);
    //         let arr = [];
    //         arr.push(tarCtrl.node.position);
    //         //随机生成三个点
    //         for(let i = 0; i < 3; i++){
    //             let x = Common.randomFrom(-1500,1500,true);
    //             let y = Common.randomFrom(-800,800,true);
    //             arr.push(cc.v2(x,y));
    //         }
    //         tarCtrl.setMoveArray(arr);
    //         tarCtrl.setShowAndHideTime(5,3);
    //     }
    //     else if(customEventData == Common.TargetType.SplitMove){
    //         this.mapMgr.generateMoveTargetNearShootPos(Common.TargetType.SplitMove,50,150,100);
    //     }
    //     else if(customEventData == Common.TargetType.People){
    //         this.mapMgr.generateMoveTargetNearShootPos(Common.TargetType.People,50,300,100);
    //     }
    //     else if(customEventData == Common.TargetType.SpyMove){
    //         let tarCtrl = this.mapMgr.generateMoveTargetNearShootPos(Common.TargetType.SpyMove,50,300,100);
    //         tarCtrl.setSpyAndManTime(3,3);
    //     }
    // },
});
