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
        //let ConfigMgr = cc.find("MgrNode").getComponent("ConfigMgr")
        //let data = ConfigMgr.getJsonData("room")
        //cc.log("data : " + JSON.stringify(data))

        for(let i = 1; i <= 15; i++)
        {
            //let itemInfo = data.children[i - 1]
           // cc.log("itemInfo : " + JSON.stringify(itemInfo))
           // if(itemInfo.desc != "暂缺")
           // {
                this.rpMgr.addItem(1,i)
           // }
           // else
          //  {
           //     this.rpMgr.addItem(2)
          //  }
        }	
        this.pageView.scrollToTop();
        //this.pageView.
    },

    // update (dt) {},
});
