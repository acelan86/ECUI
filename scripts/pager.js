/*
Pager - 分页控件。
分页控件，配合表格控件使用，翻页时触发change事件，可在其中进行表格数据的更新。

分页控件直接HTML初始化的例子:
<div type="type:pager;pageSize:10;maxNum:40" class="ui-pager"></div>

属性
_eInput  - 页数输入框

*/
//{if 0}//
(function() {

    var core = ecui,
        dom = core.dom,
        string = core.string,
        array = core.array,
        ui = core.ui,
        util = core.util,

        undefined,
        MATH = Math,

        pushArray = array.push,
        createDom = dom.create,
        first = dom.first,
        children = dom.children,
        findConstructor = util.findConstructor,
        extend = util.extend,

        $fastCreate = core.$fastCreate,
        inheritsControl = core.inherits,
        triggerEvent = core.triggerEvent,

        UI_CONTROL = ui.Control,
        UI_BUTTON = ui.Button,
        UI_SELECT = ui.Select,
        UI_INPUT = ui.Input,
        UI_ITEM = ui.Item,
        UI_ITEMS = ui.Items,
        UI_CONTROL_CLASS = UI_CONTROL.prototype,
        UI_BUTTON_CLASS = UI_BUTTON.prototype,
        UI_ITEM_CLASS = UI_ITEM.prototype;
    //{/if}//
    //{if $phase == "define"}//
    ///__gzip_original__UI_INPUT_CONTROL
    ///__gzip_original__UI_INPUT_CONTROL_CLASS
    /**
    * 初始化分页控件。
    * options 对象支持的属性如下：
    * pageSize   每页的最大记录数
    * maxNum     记录总数 
    * index      当前页码
    * @public
    *
    * @param {Object} options 初始化选项
    */
    var UI_PAGER = ui.Pager =
        inheritsControl(
            UI_CONTROL,
            'ui-pager',
            function(el, options) {

            },
            function(el, options) {
                var html = [], i,
                    type = this.getTypes()[0],
                    len;

                this._nHfNum = options.hfNum || 5;
                len = this._nHfNum * 2 + 1;
                html.push('<div class="' + type + '-button-prv ' + type + '-button">上一页</div><div class="' + type + '-items">');
                html.push((new Array(len + 1)).join('<div class="' + type + '-item"></div>'));
                html.push('</div><div class="' + type + '-button-nxt ' + type + '-button">下一页</div>');
                html.push('<em style="display:none">每页显示</em><select class="' + type + '-select' + UI_SELECT.TYPES + '">');
                len = UI_PAGER.pageSizes;
                for (i = 0; i < len.length; i++) {
                    html.push('<option value="' + len[i] + '">' + len[i] + '条</option>');
                }
                html.push('</select>');

                html.push('<div class="' + type + '-total">共' + options.maxnum + '条 </div>');
                html.push('<div type="text" class="' + type + '-input"></div>');
                html.push(
                           '<div class="' + type + '-jump-button">' +
                           '</div>'
                         );
                el.innerHTML = html.join('');
                el = children(el);

                this._nIndex = options.index || 0;
                this._nPageSize = options.pagesize;
                this._nMaxNum = options.maxnum;

                this._uPrvBtn = $fastCreate(this.Button, el[0], this);
                this.$setBody(el[1]);
                this._uNxtBtn = $fastCreate(this.Button, el[2], this);
                //this._uPageSet = $fastCreate(this.Select, el[4], this);
                this._eInput = $fastCreate(this.Input, el[6], this, { value: this._nIndex + 1 });
                this.JumpButton = $fastCreate(this.JumpButton, el[7], this, { text: "确定" });
                this.$initItems();

                if (options.hidePageSize === true) {
                    el[3].style.display = 'none';
                    //this._uPageSet.$hide();
                }
            }
        ),
        UI_PAGER_CLASS = UI_PAGER.prototype,
        UI_PAGER_BUTTON = UI_PAGER_CLASS.Button =
        inheritsControl(
            UI_BUTTON,
            'ui-pager-button',
            function(el, options) {
                var type = this.getTypes()[0],
                    o = createDom(type + '-icon');

                el.insertBefore(o, el.firstChild);
            }
        ),
        UI_PAGER_BUTTON_CLASS = UI_PAGER_BUTTON.prototype,
        UI_PAGER_JUMP_BUTTON_CLASS = (UI_PAGER_CLASS.JumpButton = inheritsControl(UI_BUTTON, "ui-pager-jump-button")).prototype,
        UI_PAGER_SELECT_CLASS = (UI_PAGER_CLASS.Select = inheritsControl(UI_SELECT, null)).prototype,
        UI_PAGER_INPUT_CLASS = (UI_PAGER_CLASS.Input = inheritsControl(UI_INPUT, "ui-pager-input")).prototype,
        UI_PAGER_ITEM_CLASS = (UI_PAGER_CLASS.Item = inheritsControl(UI_ITEM, 'ui-pager-item')).prototype;
    //{else}//

    extend(UI_PAGER_CLASS, UI_ITEMS);

    UI_PAGER.pageSizes = [10, 20, 50, 80];

    /**
    * 分页按钮事件处理函数
    * 根据按钮的step属性确定需要切换的页码
    * @private
    */
    function UI_PAGER_BTN_CLICK(event) {
        var par = this.getParent(),
            curIndex = par._nIndex,
            maxNum = par.getMaxPageNum(),
            n = this.getStep();

        UI_CONTROL_CLASS.$click.call(this);

        if (n.charAt(0) == '+') {
            curIndex += parseInt(n.substring(1), 10);
            if (curIndex == par._nIndex) {
                curIndex = maxNum - 1;
            }
            else if (curIndex >= maxNum) {
                curIndex = par._nIndex;
            }
        }
        else if (n.charAt(0) == '-') {
            curIndex -= parseInt(n.substring(1), 10);
            if (curIndex == par._nIndex) {
                curIndex = 0;
            }
            else if (curIndex < 0) {
                curIndex = par._nIndex;
            }
        }
        else {
            curIndex = parseInt(n, 10);
        }
        par.go(curIndex);
    }

    /**
    * 控件刷新
    * 根据当前的页码重置按钮
    * @private
    */
    function UI_PAGER_REFRESH(con) {
        var items = con.getItems(),
            max = con.getMaxPageNum(),
            idx = con._nIndex + 1,
            start = idx - con._nHfNum > 0 ? idx - con._nHfNum : 1,
            end, i, item;
        //con._uPageSet.setValue(con._nPageSize);

        if (idx == 1) {
            con._uPrvBtn.disable();
        }
        else {
            con._uPrvBtn.enable();
        }

        if (idx == max || max == 0) {
            con._uNxtBtn.disable();
        }
        else {
            con._uNxtBtn.enable();
        }

        if (start + con._nHfNum * 2 > max && max - con._nHfNum * 2 >= 1) {
            start = max - con._nHfNum * 2;
        }

        con._eInput.setValue(idx);

        for (i = 0; item = items[i]; i++) {
            end = start + i;
            item.setContent(end);
            item.setStep(end - 1);
            item.setSelected(idx == end);
            if (end > max) {
                item.hide();
            }
            else {
                item.show();
            }
        }
    }

    /**
    * 设置页码按钮的选择状态
    * @public
    *
    * @param {Boolean} flag 是否选中
    */
    UI_PAGER_ITEM_CLASS.setSelected = function(flag) {
        this.alterClass((flag ? '+' : '-') + 'selected');
    };

    /**
    * 设置按钮的步进
    * +/-n 向前/后翻n页
    * +0 尾页 -0 首页
    * @public
    *
    * @param {String} n 步进
    */
    UI_PAGER_BUTTON_CLASS.setStep = UI_PAGER_ITEM_CLASS.setStep = function(n) {
        this._sStep = n + '';
    };

    /**
    * 获取步进
    * @public
    *
    * @return {String} 步进
    */
    UI_PAGER_BUTTON_CLASS.getStep = UI_PAGER_ITEM_CLASS.getStep = function() {
        return this._sStep;
    };

    /**
    * @override
    */
    UI_PAGER_BUTTON_CLASS.$click = UI_PAGER_ITEM_CLASS.$click = UI_PAGER_BTN_CLICK;

    /**
    * 跳转按钮的点击事件处理
    * @override
    */
    UI_PAGER_JUMP_BUTTON_CLASS.$click = function(event) {
        var par = this.getParent(),
            input = par._eInput, i;

        UI_BUTTON_CLASS.$click.call(this);

        i = parseInt(input.getValue(), 10);
        if (i != par._nIndex + 1) {
            if (i > 0 && i <= par.getMaxPageNum()) {
                par.go(i - 1);
            }
        }
    };
    /**
    文本框按键处理
    */
    UI_PAGER_INPUT_CLASS.onkeydown = function(event) {
        var par = this.getParent(),
            input = par._eInput, i = input.getValue(),
            keyCode = event.which;
        if (!((keyCode >= 48 && keyCode <= 57) ||
                     (keyCode >= 96 && keyCode <= 105) ||
                      keyCode == 46 || keyCode == 8)) {
            event.returnValue = false;
        }
        if (keyCode == 13) {
            if (i > 0 && i <= par.getMaxPageNum()) {
                par.go(i - 1);
            }
        }
    }
    UI_PAGER_SELECT_CLASS.onchange = function() {
        var par = this.getParent(),
            value = this.getValue();
        if (triggerEvent(par, 'sizechange', null, [value])) {
            par._nIndex = 0;
            par._nPageSize = value;
            UI_PAGER_REFRESH(par);
        }
    };

    /**
    * 得到最大的页数
    * @public
    *
    * @return {Number} 最大的页数
    */
    UI_PAGER_CLASS.getMaxPageNum = function() {
        return MATH.ceil(this._nMaxNum / this._nPageSize);
    };

    /**
    * 得到最大的记录数
    * @public
    *
    * @return {Number} 最大的记录数
    */
    UI_PAGER_CLASS.getMaxNum = function() {
        return this._nMaxNum;
    };
    /**
    * 得到当前的页码
    * begin with zero
    * @public
    *
    * @return {Number} 当前的页面 
    */
    UI_PAGER_CLASS.getIndex = function() {
        return this._nIndex;
    };

    /**
    * 设置当前的页面
    * 设置后需要调用render刷新控件
    * 不会对参数进行验证，建议使用go完成翻页
    * @public
    *
    * @param {Number} i 目标页码
    */
    UI_PAGER_CLASS.setIndex = function(i) {
        this._nIndex = i;
    }

    /**
    * 翻页
    * 不会对参数进行有效检查
    * @public
    *
    * @param {Number} i 目标页码
    */
    UI_PAGER_CLASS.go = function(i) {
        if (!triggerEvent(this, 'change', null, [i])) {
            return;
        }
        this._nIndex = i;
        this.render();
    };

    /**
    * 初始化函数
    * 初始化设置并根据初始参数设置控件各部件的状态
    *
    * @override
    */
    UI_PAGER_CLASS.init = function() {
        this._uPrvBtn.setStep('-1');
        this._uNxtBtn.setStep('+1');
        //this._uPageSet.init();
        UI_PAGER_REFRESH(this);
        UI_CONTROL_CLASS.init.call(this);
    }

    /**
    * 控件刷新
    *
    * @override
    */
    UI_PAGER_CLASS.render = function() {
        UI_PAGER_REFRESH(this);
        UI_CONTROL_CLASS.render.call(this);
    };
    //{/if}//
    //{if 0}//
})();
//{/if}//
