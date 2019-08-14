//房间pageview页面管理器

cc.Class({
    extends: cc.Component,

    properties: {
        item_prefab:{  //项的资源预制体
            type:cc.Prefab,
            default:null,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.content = cc.find("view/content",this.node);
        this.itemList = []
        this.pageCount = 1
        this.MAX_PAGE_COUNT = 10
        this.MAX_COLOUM = 2
    },

    start () {

    },

    /*
        Func: 添加item
        p1:显示类型，1.开启状态 2.关闭状态
        p2:开启状态下的显示文本
    */
    addItem : function(_type,_content){
        
        let itemPrefab = cc.instantiate(this.item_prefab);
        let label = cc.find("bg/l_guanqia",itemPrefab)
        let img_suo = cc.find("bg/suo",itemPrefab)
        if(_type == 1)
        {
            img_suo.active = false
            label.active = true
            label.getComponent(cc.Label).string = _content
        }
        else if(_type == 2)
        {
            img_suo.active = true
            label.active = false
        }
        this.itemList.push(itemPrefab)
        //以下是排版代码
        let curPage = Math.ceil(this.itemList.length / this.MAX_PAGE_COUNT)
        if(curPage > this.pageCount)
        {
            cc.log("!!!!!!!!!!!!!!!!!!!!!!!!!add page")
            let page1 = cc.find("view/content/page_1",this.node)
            let newPage = cc.instantiate(page1)
            newPage.removeAllChildren()
            //let name = "page_" + curPage
            //创建新页面
            this.pageCount = curPage
            //this.content.add(newPage,1,name)
            newPage.name = "page_" + curPage
            this.node.getComponent(cc.PageView).addPage(newPage)
        }
        let pageUrl = "view/content/page_" + this.pageCount
        let page = cc.find(pageUrl,this.node)
        page.addChild(itemPrefab)
        let idx = this.itemList.length % this.MAX_PAGE_COUNT
        if(idx == 0)
        {
            idx = this.MAX_PAGE_COUNT
        }
        let initPosX = 90
        let initPosY = -106
        let gapW = 30
        let gapH = 35
        let row = Math.ceil(idx / 5)
        let col = idx % this.MAX_COLOUM
        let itemBg = itemPrefab.getChildByName("bg")
        let itemWidth = itemBg.width
        let itemHeight = itemBg.height
        if(col == 0)
        {
            col = this.MAX_COLOUM
        }
        //cc.log("row = " + row + " col = " + col)
        //cc.log("width = " + itemPrefab.width  + " height = " + itemPrefab.height)
        let posX = initPosX + (itemWidth + gapW) * (col - 1)
        let posY = initPosY - (itemHeight + gapH) * (row - 1)
       // cc.log("posX = " + posX + " posY = " + posY)
        itemPrefab.setPosition(cc.v2(posX,posY))
    }

    // update (dt) {},
});
