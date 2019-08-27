//所有目标的管理器
//var Queue = require("Queue");
var TargetIdx = 1;
cc.Class({
    extends: cc.Component,

    properties: {
        targetPrefab : cc.Prefab,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        
    },

    start () {
        this.cached_targets = new cc.NodePool();
        this.use_targets = [];  // 正在场上的节点
        this.beKilled_targetsId = [];
    },

    refresh : function(){
        this.cached_targets.clear();
        this.use_targets.length = 0;
        this.beKilled_targetsId.length = 0;
    },

    //获取处于闲置状态的target
    getIdleTarget : function(){
        var target = undefined;
        if(this.cached_targets.size() == 0)
        {
            target = cc.instantiate(this.targetPrefab);
            target.name = "tPrefab" + TargetIdx++;
            //var targetController = target.getComponent("TargetController");
            //console.log("create new node");
            //return target;
        }
        else{
            //console.log("get cached_targets");
            target = this.cached_targets.get();
        }
        this.use_targets.push(target);
        return target;
    },

    //从正在使用数组中移除目标
    _removeTargetInUse : function(_target){
        this.use_targets.forEach(function(item, index, arr) {
            if(item == _target) {
                arr.splice(index, 1);
            }
        });
        if(this.use_targets.length == 0){
            cc.vv.gameNode.emit("game_all_targets_clear");
        }
        
    },

    addIdleTarget : function(_target){
       // _target.node.active = false;
        let targetCtrl = _target.getComponent("TargetController");
        targetCtrl.removeFromBlock();
        this._removeTargetInUse(_target);
        //添加进对象池会自动从父对象remove
        this.cached_targets.put(_target);
    },

    removeAllTargets : function(){
        for(let i = 0; i < this.use_targets.length; i++){
            this.cached_targets.put(this.use_targets[i]);
        }
        this.use_targets = [];
        this.cached_targets.clear();
    },

    //检测某点是否在各个目标内
    //是则返回目标
    checkPointIsInTargets : function(_point){
        this.use_targets.forEach(function(item, index, arr) {
            let tc = item.getComponent("TargetController");
            if(tc.checkIsInPoint(_point)){
                return item;
            }
        });
        return undefined;
    },

    //检测是否有目标被射中
    //param1：射击坐标点
    //ret true击中目标 false打空
    checkTargetsBeShoot : function(_shootPoint){
        var ret = false
        this.use_targets.forEach(function(item, index, arr) {
            let tc = item.getComponent("TargetController");
            if(tc.checkIsInPoint(_shootPoint)){
                tc.beShoot();
                ret = true;
            }
        });
        return ret
    },

    //返回场上的目标个数
    getInUseTargetsCount : function(){
        return this.use_targets.length;
    },

    //统计被击杀的目标
    addBeKillId : function(_id){
        let bFind = false;
        for(let i in this.beKilled_targetsId){
            let v = this.beKilled_targetsId[i];
            if(v.id == _id){
                v.count++;
            }
        }
        if(!bFind){
            let tmp = {id:_id,count:1}
            this.beKilled_targetsId.push(tmp);
        }
    },

    //获取指定目标被击杀的个数
    getBeKillCountById : function(_id){
        for(let i in this.beKilled_targetsId){
            let v = this.beKilled_targetsId[i];
            if(v.id == _id){
                return v.count;
            }
        }
        return 0;
    },

    //获取被击杀的所有目标的个数
    getBeKillCount : function(){
        let sum = 0;
        for(let i in this.beKilled_targetsId){
            let v = this.beKilled_targetsId[i];
            sum += v.count;
        }
        return sum;
    },

    // update (dt) {},

    onDestroy() {
        this.cached_targets.clear();
        this.beKilled_targetsId.length = 0;
    }
});
