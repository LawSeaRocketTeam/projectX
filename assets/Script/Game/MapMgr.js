//地图管理器，管理添加在地图上的精灵
//把4000 * 2000的地图划分成块区域，每一块为 400 * 250
//划成块是便于对驻留怪生成的管理，对移动怪无效

var Common = require("Common");

cc.Class({
    extends: cc.Component,

    properties: {
        max_w:4000,     //可移动总宽
        max_h:2000,     //可移动总高
        block_w:125,    //设置的大小要跟地图的宽整除
        block_h:125,    //设置的大小要跟地图的高整除
        block_gen_count:4,  
        shootNode:cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        var canvas = cc.find("Canvas")
        this.targetsMgr = canvas.getComponent("TargetsMgr");
        this.arrBlocks = [];    //存储块的数组
        this.blockHCount = Math.floor(this.max_h / this.block_h);
        this.blockWCount = Math.floor(this.max_w / this.block_w);
        //扩大地图大小，避免在高分别率机器看到边界
        //this.node.width = this.max_w * 1.5;
        //this.node.height = this.max_h * 1.5;
        for(let i = 0;i < this.blockHCount; i++){
            for(let j = 0; j < this.blockWCount; j++){
                let block = new Object();
                block.pos = cc.v2(-this.max_w/2 + j*this.block_w,-this.max_h/2 + i*this.block_h);
                block.targets = [];
                this.arrBlocks.push(block);
            }
        }
        //cc.director.getCollisionManager().enabled = true;
        //console.log("map block = \n" +JSON.stringify(this.arrBlocks));
        cc.vv.gameNode.emit("map_load_finish");
    },
    
    //获取该块九宫格内一个空闲的块(-1,+1,-blockWCount,+blockWCount,0,-blockWCount+1,blockWCount-1,-blockWCount-1,blockWCount+1)
    /**
     *          bw-1   bw    bw+1 
     *          -1     0     +1
     *         -bw-1  -bw   -bw+1
     */
    //如果该点九宫格内的格都满了，则取九宫内其中一点再取下去
    _getNearEmptyBlockIdx : function(_idx){
        let tmp = [-1,1,-this.blockWCount,this.blockWCount,0,-this.blockWCount+1,this.blockWCount-1,-this.blockWCount-1,this.blockWCount+1];
        //随机打乱数组，造成每次取的相邻顺序都不一样
        tmp.sort(function(){return Common.seededRandom() > 0.5 ? -1:1;})
        console.log("----------------tmp array = " + tmp);
        for(let v of tmp){
            let nearIdx = _idx + v;
            if(nearIdx >= this.arrBlocks.length || nearIdx < 0){
                continue;
            }
            if(this.arrBlocks[nearIdx].targets.length == 0){
                return nearIdx;
            }
        }
        return this._getNearEmptyBlockIdx(_idx + tmp[0]);
    },

    //获取地图上某个点所在的块下标
    getPointInBlockIdx(_pos){
        for(let i = 0; i < this.arrBlocks.length; i++){
            let block = this.arrBlocks[i];
            let bRect = cc.rect(block.pos.x,block.pos.y,this.block_w,this.block_h);
            if(bRect.contains(_pos)){
                return i;
            }
        }
        return -1;
    },


    //在指定的区块生成半径为_radius的指定最大数量为_count的目标
    //当空间不够时，生成数会少于_count
    //_type:目标类型
    //_activeTime 对于短期驻留怪，存活时间
    //_genDipTime 在同一块区生成多个时，间隔多久生成1个,默认0
    //ret 返回生成了多少个目标
    generateTargetsInBlockByIdx :function(_idx,_radius,_count,_type,_activeTime,_genDipTime){
        _activeTime = _activeTime|| -1;
        _genDipTime = _genDipTime|| 0;  
        let block = this.arrBlocks[_idx];
        let hasGenCount = 0;
        //初始化布局数组
        //理论上应该是每个坐标点创建的,因为生成半径没有太小，节省计算量，所以除以10了
        let position = new Array();
        for(let i = 0; i < this.block_w; i++){
            position[i]=new Array();
            for(let j = 0; j < this.block_h; j++){
                position[i][j] = {radius:0,isPlanted:0,isSet:0};
            }
        }
        //最大半径
        let targetRadiusMax = _radius;
        //会用10倍随机点去生成对应数
        for(let i = 0; i < _count * 10; i++){
            //在合适的范围，随机选择一个位置来做圆心，最好画出来的圆不能超过区块
            //
            let targetX = Common.randomFrom(targetRadiusMax,this.block_w - targetRadiusMax);
            let targetY = Common.randomFrom(targetRadiusMax,this.block_h - targetRadiusMax);
            if(position[targetX][targetY].isSet == 1){
                //如果该位置已经生成目标则跳过后续操作
                continue;
            }
            //半径随机
            //let targetRadius = targetRadiusMax * Math.random();
            //targetRadius = Math.max(10,treeRadius);//保持一个最小值
            //position[targetX][targetY].radius = targetRadius;
            let targetRadius = _radius;
            //初始设定可以生成
            position[targetX][targetY].radius = targetRadius;
            position[targetX][targetY].isPlanted = 1;
            let checkStartX = Math.max(targetX - Math.ceil(targetRadius) - targetRadiusMax,0);
            let checkStartY = Math.max(targetY - Math.ceil(targetRadius) - targetRadiusMax,0);
            let checkEndX = Math.min(targetX + Math.ceil(targetRadius) + targetRadiusMax,this.block_w);
            let checkEndY = Math.min(targetY + Math.ceil(targetRadius) + targetRadiusMax,this.block_h);
            for(let x = checkStartX; x < checkEndX; x++){
                for(let y = checkStartY; y < checkEndY; y++){
                    if((targetX == x && targetY == y) == false){
                        //比较两点间距离和两点半径和的大小 判断是否重叠
                        let targetDistanceSquared = (targetX - x) * (targetX - x) + (targetY - y) * (targetY - y);
                        let radiusSumSquared = (position[x][y].radius + targetRadius) * (position[x][y].radius + targetRadius);
                        if(targetDistanceSquared < radiusSumSquared){
                            //发生碰撞则标记不可生成
                            if(position[x][y].radius != 0){
                                //防止那些在圆内的点被误认为是碰撞点
                                position[targetX][targetY].radius = 0;
                                position[targetX][targetY].isPlanted = 0;
                            }
                        }
                    }
                }
            }
            if(position[targetX][targetY].isPlanted == 1){
                position[targetX][targetY].isSet = 1;
                hasGenCount++;
                let delayTime = hasGenCount * _genDipTime;
                
                let target = this.targetsMgr.getIdleTarget();
                let targetController = target.getComponent("TargetController");
                targetController.setBlock(block);
                this.scheduleOnce(function() {
                    //生成目标
                    let x = block.pos.x + targetX;
                    let y = block.pos.y + targetY;
                    //let tc = target.getComponent("TargetController");
                    targetController.refresh(_type,cc.v2(x,y),_radius,_activeTime);
                    target.parent = this.node
                }.bind(this), delayTime);
            }
            //当到达数量后，则可退出循环
            if(hasGenCount == _count) break;
        }
        return hasGenCount;
    },

    //在射击点九宫内寻找空白块生成驻守目标
    //_activeTime 对于短期驻留怪，存活时间
    //_genDipTime 在同一块区生成多个时，间隔多久生成1个,默认0
    generateTermTargetsNearShootPos : function(_radius,_count,_type,_activeTime,_genDipTime){
        _activeTime = _activeTime || -1; 
        _genDipTime = _genDipTime || 0;
        let shootCtrl = this.shootNode.getComponent("ShootController");
        let pos = shootCtrl.getShootPoint();
        let shootBlockIdx = this.getPointInBlockIdx(pos); 
        let hasGen = 0
        //直到生成到目标数量为止，如果太多可能会导致卡死，因为九宫格都没位置了
        while(hasGen < _count)
        {
            let nearBlockIdx = this._getNearEmptyBlockIdx(shootBlockIdx);
            if(nearBlockIdx != -1){ 
                let genCount = _count - hasGen < this.block_gen_count ? _count - hasGen : this.block_gen_count
                hasGen += this.generateTargetsInBlockByIdx(nearBlockIdx,_radius,genCount,_type,_activeTime,_genDipTime);
            }
        }
    },

    //创建移动类型目标
    //p1:目标类型
    //P2:目标半径大小
    //P3：速度 像素/秒
    //p4: 位置
    //P5：移动方向
    generateTarget : function(_type,_radius,_speed,_pos,_dirDeg){
        _dirDeg = _dirDeg || Common.randomFrom(0,360,true);
        let shootCtrl = this.shootNode.getComponent("ShootController");
        let pos = _pos;
        var target = this.targetsMgr.getIdleTarget();
        var targetController = target.getComponent("TargetController");
        targetController.refresh(_type,pos,_radius,-1,_speed,_dirDeg);
        target.parent = this.node
        return targetController;
    },

    //创建移动类型目标
    //p1:目标类型
    //P2:目标半径大小
    //P3：速度 像素/秒
    //p4: 围绕射击点多少像素范围内生成
    //P5：移动方向
    generateMoveTargetNearShootPos : function(_type,_radius,_speed,_genRange,_dirDeg){      
        _genRange = _genRange || 300;
        let shootCtrl = this.shootNode.getComponent("ShootController");
        let pos = shootCtrl.getShootPoint();
        let xDip = Common.seededRandom(-_genRange,_genRange,true);
        let yDip = Common.seededRandom(-_genRange,_genRange,true);
        pos = cc.v2(pos.x + xDip,pos.y + yDip);
        return this.generateTarget(_type,_radius,_speed,pos,_dirDeg);
    },

    start () {

    },

    // update (dt) {},
});
