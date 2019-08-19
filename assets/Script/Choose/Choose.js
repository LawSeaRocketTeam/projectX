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
                    this.rpMgr.addItem(1,i+1)
                }
                else{
                    this.rpMgr.addItem(2)
                }
            }
        }	
        this.pageView.scrollToTop();
    },

    // update (dt) {},
});
