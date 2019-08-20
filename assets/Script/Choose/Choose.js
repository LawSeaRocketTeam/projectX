//房间脚本

cc.Class({
    extends: cc.Component,

    properties: {
        pageView : cc.PageView,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        //this.pageView = cc.find("bg/pageview",this.node);
        this.rpMgr = this.pageView.getComponent("ChoosePageViewMgr")
    },

    start () {
        let data = cc.vv.dataMgr.guanQiaData;
        for(let i = 0; i < data.length; i++)
        {
            let util = data[i];
            for(let j = 0; j < util.length; j++){
                let item = util[j];
                if(item.star > 0){
                    this.rpMgr.addItem(1,i+1,item.star)
                }
                else{
                    this.rpMgr.addItem(2)
                }
            }
        }	
        this.pageView.scrollToTop();
    },

    onUnLockClick : function(event, customEventData){
        //获取当前页签
        let idx = this.pageView.getCurrentPageIndex() + 2
        console.log("星星不足，不能解锁第" + idx + "集合，没获得三星的关卡都可以获取星星哦");
    },

    // update (dt) {},
});
