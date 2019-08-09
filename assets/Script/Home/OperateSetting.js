
cc.Class({
    extends: cc.Component,

    properties: {
        sensi : 5,  //灵敏度
        op : 0 ,    //0左手准星 1右手准星
        txtOp :cc.Label,
        txtSensi :cc.Label,
        sensiSlider : cc.Slider,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this._setSensi(cc.vv.dataMgr.opSetting.sensi);
        this._setOp(cc.vv.dataMgr.opSetting.op);
        this.sensiSlider.progress = this.sensi / 10;
        this.sensiSlider.node.on("slide",this.sliderCallBack,this);
    },

    _setOp : function(_op){
        this.op = _op;
        if(this.op == 0){
            this.txtOp.string = "左手准星"
        }
        else{
            this.txtOp.string = "右手准星"
        }
    },

    _setSensi : function(_sensi){
        this.sensi = _sensi
        this.txtSensi.string = _sensi;
    },

    _save(){
      if(this.op == cc.vv.dataMgr.opSetting.op && this.sensi == cc.vv.dataMgr.opSetting.sensi){
          //数值没变，直接return
          return
      }  
      else{
          cc.vv.dataMgr.saveOpSetting(this.op,this.sensi);
      }
    },

    sliderCallBack : function(slider){
        let progress = Math.ceil(slider.progress * 10);
        if(progress < 1){
            progress = 1;
        }
        this._setSensi(progress)
    },

    onCloseClick:function(event, customEventData){
        this._save();
        this.node.active = false;
    },

    onChangeClick : function(event, customEventData){
        this._setOp(!this.op);
    }

    // update (dt) {},
});
