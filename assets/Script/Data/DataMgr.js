//游戏里面所有数据存储管理的的地方

var encrypt = require("encryptjs");
var secretkey = "project_x_20190809"
var OP_SETTING_NAME = "OP_SETTING_NAME"
var GUAN_QIA_DATA_FILENAME = "Resource/Json/chooseData.json"


cc.Class({
    extends: cc.Component,

    ctor : function() {
        this.opSetting = {op:0,sensi:5}; //操作设置
        this.gameSetting = {};  //游戏设置
        let opSettingData = cc.sys.localStorage.getItem(OP_SETTING_NAME);
        if(opSettingData != undefined){
            opSettingData = JSON.parse(encrypt.decrypt(opSettingData,secretkey,256));
            this.opSetting.op = opSettingData.op;
            this.opSetting.sensi = opSettingData.sensi;
        }

        //从文件读取关卡数据
        cc.loader.loadRes("Resource/Json/chooseData",function(err,jsonAsset){
            this.guanQiaData = jsonAsset.json;
        })
    },

    //存储操作模式
    saveOpSetting : function(_op,_sensi){
        this.opSetting.op = _op;
        this.opSetting.sensi = _sensi;
        let jsonData = JSON.stringify(this.opSetting);
        let encryData = encrypt.encrypt(jsonData,secretkey,256);
        cc.sys.localStorage.setItem(OP_SETTING_NAME,encryData);
    },

    //存储关卡数据到文件
    saveGuanQiaDataToFile(){
        if(cc.sys.isNative) {
            //cc.log("Path:"+jsb.fileUtils.getWritablePath());
            jsb.fileUtils.writeToFile(this.guanQiaData,jsb.fileUtils.getWritablePath() + GUAN_QIA_DATA_FILENAME);
            //cc.log("fullPathForFilename:"+jsb.fileUtils.fullPathForFilename("resources/data.json"));
         }
    }

});
