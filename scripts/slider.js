/*
Slider - 设定百分比基本操作。
继承自基础控件。

初始化的例子:
<div ecui="type:slider;rate:10,20,30,40"></div>

*/
//{if 0}//
(function () {

    var core = ecui,
        ui = core.ui,

        undefined,

        getKey = core.getKey,
        inheritsControl = core.inherits,
        query = core.query,
        drag = core.drag,

        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = UI_CONTROL.prototype;
//{/if}//
//{if $phase == "define"}//
    /**
     * 初始化slider控件。
     * options 对象支持的属性如下：
     * @public
     *
     * @param [array] rate 初始化属性
     */
    var sliderW,_margin;
    var UI_SLIDER = ui.Slider =
        inheritsControl(
            UI_CONTROL,
            'ui-slider',
            function (el, options) {
                options.rate = options.rate.split(",");
                if(eval(options.rate.join("+"))!==100){
                    alert("slider控件初始值错误");
                }else{
                    var len = options.rate.length;
                    var sliderHolder = [];
                    var pos = 0, textPos = 0;
                    for(var i = 0; i< len; i++){
                        pos += options.rate[i]/100 * (el.offsetWidth - 16);
                        textPos = pos - options.rate[i]/2*(el.offsetWidth-16)/100;
                        sliderHolder.push('<div ecui="type:slidertext" style="left:'+ textPos +'px">'+ options.rate[i] +'%</div>')
                        if(i<len-1){
                            sliderHolder.push('<div ecui="type:sliderholder" style="left:'+ pos +'px"></div>');
                        }
                    }
                    el.innerHTML = '<div ecui="id:slider" class="ui-'+ options.type +'-bg">'+ sliderHolder.join('') +'</div>';
                    el.innerHTML += '<input type="hidden" name="rate" id="rate" value="'+ options.rate +'" />';
                    ecui.init(el);
                    sliderW = el.offsetWidth;
                    _margin = 10;
                }
            }
        ),
        UI_SLIDER_CLASS = UI_SLIDER.prototype;
    
    var UI_SLIDERHOLDER = ui.Sliderholder =
        inheritsControl(
            UI_CONTROL,
            'ui-slider-holder'
        ),
        UI_SLIDERHOLDER_CLASS = UI_SLIDERHOLDER.prototype;
    var UI_SLIDERTEXT = ui.Slidertext =
        inheritsControl(
            UI_CONTROL,
            'ui-slider-text'
        ),
        UI_SLIDERTEXT_CLASS = UI_SLIDERTEXT.prototype;
//{else}//
    /**
     * slider控件拖拽对象。
     * @private
     *
     * @param {ecui.ui.Slider} control 拖拽控件
     */
    UI_SLIDERHOLDER_CLASS.$activate = function (event) {
        var leftPos = 10,rightPos = sliderW;
        if(this.getMain().previousSibling.previousSibling){
            leftPos = this.getMain().previousSibling.previousSibling.offsetLeft + _margin*2 + 1;
        }
        if(this.getMain().nextSibling.nextSibling){
            rightPos = this.getMain().nextSibling.nextSibling.offsetLeft + _margin;
        }
        var range = {
            left    : leftPos,
            right   : rightPos
        }
        //console.log(range);
        drag(this, event, range);
    };
    
    UI_SLIDERHOLDER_CLASS.ondragstart = function (event) {
        
    };
    UI_SLIDERHOLDER_CLASS.ondragmove = function (event, x, y) {
        var step = sliderW / 100;
        var holderList = ecui.query({type: UI_SLIDERHOLDER});
        var listlen = holderList.length;
        var rate = [],
            percent=0;
        for(var i = 0; i<listlen; i++){
            if (i == 0){
                percent = Math.round((holderList[i].getX() + _margin)/sliderW*100);
            }else{
                percent = Math.round((holderList[i].getX() - holderList[i-1].getX())/sliderW*100);
            }
            rate.push(percent);
        }
        last = 100 - eval(rate.join('+'));
        rate.push(last);
        UI_SLIDER_CLASS._renderPercentHandler(rate);
        //return false;
    };
    /**
     * slider控件比例调整渲染。
     * @private
     *
     */
    UI_SLIDERHOLDER_CLASS.ondragend = function (event) {
        
    };
    UI_SLIDER_CLASS._renderPercentHandler = function(rate,autoAdjust){
        var rateLen = rate.length;
        var pos = 0, textPos = 0;
        for(var i = 0;i < rateLen; i++){
            ecui.query({type: UI_SLIDERTEXT})[i].setContent(rate[i]+"%");
            pos += rate[i]/100 * (sliderW - _margin*2);
            textPos = pos - rate[i]/2*(sliderW - _margin)/100;
            ecui.query({type: UI_SLIDERTEXT})[i].setPosition(textPos);
            if(autoAdjust && i < rateLen - 1){
                ecui.query({type: UI_SLIDERHOLDER})[i].setPosition(pos);
            }
            T.g('rate').value = rate;
        }
        
    }
    UI_SLIDER_CLASS.setAverage = function(){
        var perList = ecui.query({type: UI_SLIDERTEXT});
        var listlen = perList.length;
        avg = Math.floor(100/listlen);
        var rate = [];
        for(var i = 0; i < listlen-1; i++){
            rate.push(avg);
        }
        rate.push(100-eval(rate.join('+')));
        this._renderPercentHandler(rate,true);
    }
//{/if}//
//{if 0}//
})();

