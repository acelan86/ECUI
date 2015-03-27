/*
MessageBox - 消息框功能。
*/
//{if 0}//
(function () {

    var core = ecui,
        dom = core.dom,

        createDom = dom.create,

        createControl = core.create,
        disposeControl = core.dispose;
//{/if}//
//{if $phase == "define"}//
    var ECUI_MESSAGEBOX,
        ECUI_MESSAGEBOX_BUTTONS = [];
//{else}//
    /**
     * 消息框点击事件处理。
     * @private
     * 
     * @param {Event} event 事件对象
     */
    function ECUI_MESSAGEBOX_ONCLICK(event) {
        ECUI_MESSAGEBOX.hide();
        if (this._fAction) {
            this._fAction.call(null, event);
        }
    }

    /**
     * 消息框显示提示信息，仅包含确认按钮。
     * @protected
     * 
     * @param {string} text 提示信息文本
     * @param {Array} buttonTexts 按钮的文本数组
     * @param {Array} 按钮配置
     *          {String} text 文本
     *          {String} className 按钮样式
     *          {Function} action 点击事件处理函数
     * @param {Number} opacity 不透明度
     */
    core.$messagebox = function (text, options) {
        var i = 0,
            options = options || {},
            title = options.title || '',
            buttons = options.buttons || [],
            opacity = options.opacity || 0.5,
            length = buttons.length,
            closeButton = options.closeButton || false,
            body,
            bottom,
            o;
        if (!ECUI_MESSAGEBOX) {
            ECUI_MESSAGEBOX = createControl(
                'Form',
                {
                    main: createDom('ui-form ui-messagebox', 'width:300px;'),
                    parent: document.body,
                    hideForm : true,
                    autoCenter: true,
                    closeButton: closeButton
                }
            );

            body = ECUI_MESSAGEBOX.getContent();
            body.innerHTML = '<div class="ui-messagebox-text"></div>' + '<div class="ui-messagebox-bottom"></div>';
        } else {  
            body = ECUI_MESSAGEBOX.getContent();
            
        }
        if (options.type == 'info') {
            ECUI_MESSAGEBOX.alterClass('+info');
        } else {
            ECUI_MESSAGEBOX.alterClass('-info');
        }
        bottom = body.lastChild;

        if (!ECUI_MESSAGEBOX.isShow()) {
            while (length > ECUI_MESSAGEBOX_BUTTONS.length) {
                ECUI_MESSAGEBOX_BUTTONS.push(
                    createControl('Button', {element: createDom('ui-button', '', 'span'), parent: bottom})
                );
            }

            disposeControl(body = body.firstChild);
            body.innerHTML = text;

            for (; o = ECUI_MESSAGEBOX_BUTTONS[i]; i++) {
                if (i < length) {
                    o.setContent(buttons[i].text);
                    o.$show();
                    o._fAction = buttons[i].action;
                    o.onclick = ECUI_MESSAGEBOX_ONCLICK;
                    if (buttons[i].className) {
                        o.setClass(buttons[i].className);
                    }
                    else {
                        o.setClass(o.getPrimary());
                    }
                }
                else {
                    o.$hide();
                }
            }

            ECUI_MESSAGEBOX.setTitle(title || '提示');
            ECUI_MESSAGEBOX.showModal(opacity);
        }
        return ECUI_MESSAGEBOX;
    };

    /**
     * 消息框显示提示信息，仅包含确认按钮。
     * @public
     * 
     * @param {string} text 提示信息文本
     * @param {Function} onok 确认按钮点击事件处理函数
     */
    core.alert = function (text, onok) {
        core.$messagebox(text, {
            title : '提示',
            buttons : [
                {text: '确定', className: 'ui-button-g', action: onok}
            ]
        });
    };

    /**
     * 消息框显示提示信息，包含确认/取消按钮。
     * @public
     * 
     * @param {string} text 提示信息文本
     * @param {Function} onok 确认按钮点击事件处理函数
     * @param {Function} oncancel 取消按钮点击事件处理函数
     */
    core.confirm = function (text, onok, oncancel) {
        core.$messagebox(text, {
            title : '提示',
            buttons : [
                {text: '确定', className: 'ui-button-g', action: onok},
                {text: '取消', action: oncancel}
            ]
        });
    };

    /**
     * 普通模态提示条
     */
    core.info = function (text) {
        return core.$messagebox(text, {
            type : 'info'
        });
    };
//{/if}//
//{if 0}//
})();
