//房间脚本

cc.Class({
    extends: cc.Component,

    properties: {
        pageView : cc.PageView,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.rpMgr = this.pageView.getComponent("ChoosePageViewMgr")
    },

    start () {
        this.refreshPageView();
        this.pageView.scrollToTop();
    },

    //刷新页面
    refreshPageView : function(){
        this.pageView.removeAllPages();
        let data = cc.vv.dataMgr.guanQiaData;
        for(let i = 0; i < data.length; i++)
        {
            let util = data[i];
            for(let j = 0; j < util.length; j++){
                let item = util[j];
                if(item.star > 0){
                    this.rpMgr.addItem(1,j+1,item.star,i,j)
                }
                else{
                    this.rpMgr.addItem(2,i,j)
                }
            }
        }
        //滚动到最新页
        this.pageView.scrollToPage(data.length - 1);
    },

    //检测是否能开启下一个集合
    //所有关卡都通过并且达到一定的星星数
    checkIsCanOpenNextUtils : function(){
        //获取当前页签
        let idx = this.pageView.getCurrentPageIndex();
        let data = cc.vv.dataMgr.guanQiaData;
        let curUtil = data[idx];
        let starCount = 0;
        for(let j = 0; j < curUtil.length; j++){
            let item = curUtil[j];
            if(item.star == 0)
               return false;
            starCount += item.star;
        }
        if(starCount < 18)//先随便写个数，之后跟配置
            return false;
        return true;
    },

    onUnLockClick : function(event, customEventData){
        let idx = this.pageView.getCurrentPageIndex()+2;
        if(this.checkIsCanOpenNextUtils()){
            //添加新的集合，隐藏当前页面锁
            cc.vv.dataMgr.addGuanQiaUtil();
            this.refreshPageView();
        }
        else{
            console.log("星星不足，不能解锁第" + idx + "集合，没获得三星的关卡都可以获取星星哦");
        }
        
    },

    OnPageViewItemClick: function(event,customEventData){
        cc.director.loadScene("gameScene");
    },

    onBackClick : function(event, customEventData){
        this.node.active = false;
    }
    // update (dt) {},
});
