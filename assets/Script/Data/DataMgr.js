//游戏里面所有数据存储管理的的地方

var encrypt = require("encryptjs");
var secretkey = "project_x_20190809"
var OP_SETTING_NAME = "OP_SETTING_NAME"
var GUANQIA_DATA_NAME = "GUANQIA_DATA"


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
        //游戏关卡数据
        let gqData = cc.sys.localStorage.getItem(GUANQIA_DATA_NAME);
        if(gqData != undefined){
            this.guanQiaData = JSON.parse(encrypt.decrypt(gqData,secretkey,256));
        }
        else{
            //每个关卡是一个集合，一个集合有10个项
            this.guanQiaData = [];
            this.addGuanQiaUtil();
        }
    },

    //存储操作模式
    saveOpSetting : function(_op,_sensi){
        this.opSetting.op = _op;
        this.opSetting.sensi = _sensi;
        let jsonData = JSON.stringify(this.opSetting);
        let encryData = encrypt.encrypt(jsonData,secretkey,256);
        cc.sys.localStorage.setItem(OP_SETTING_NAME,encryData);
    },

    //添加关卡集合初始数据
    addGuanQiaUtil : function(){
        let util = [];
        for(let i = 0; i < 10; i++){
            let item = {star:0};
            if(i == 0){
                item.star = 1;
            }
            util.push(item);
        }
        this.guanQiaData.push(util);
    },

    //存储关卡数据到文件
    saveGuanQiaData : function(){
        let jsonData = JSON.stringify(this.guanQiaData);
        let encryData = encrypt.encrypt(jsonData,secretkey,256);
        cc.sys.localStorage.setItem(GUANQIA_DATA_NAME,encryData);
    }

});
