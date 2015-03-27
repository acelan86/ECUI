/**
 * input
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path:    input.js
 * desc:    单行文本输入框 
 * author:  acelan(xiaobin8@staff.sina.com.cn)
 * date:    2012-04-09
 * 
 * options.placeholder || input.placeholder :默认文本属性
 * 
 */
(function () {

    var core = ecui,
        ui = core.ui,

        inheritsControl = core.inherits,

        UI_INPUT_CONTROL = ui.InputControl,


        UI_INPUT = ui.Input = inheritsControl(
            UI_INPUT_CONTROL,
            'ui-input',
            function (el, options) {
                
            },
            function (el, options) {
                var placeholder = this._placeholder = options.placeholder || el.getAttribute('placeholder') || '';
                if (!el.value && placeholder) {
                    this._isPlaceholder = 1;
                    el.value = placeholder;
                    this.alterClass('+virtual');
                };
                
            }
        ),

        UI_INPUT_CLASS = UI_INPUT.prototype;


        UI_INPUT_CLASS.$blur = function (event) {
            var value = UI_INPUT_CONTROL.prototype.getValue.call(this),
                input = this.getInput(),
                placeholder = this._placeholder;

            UI_INPUT_CONTROL.prototype.$blur.call(this, event);

            if (value) {
                this._isPlaceholder = 0;
                input.value = value;
            } else {
                this._isPlaceholder = 1;
                input.value = placeholder;
                this.alterClass('+virtual');
            }
            
        };

        UI_INPUT_CLASS.$focus = function (event) {
            var value = this.getValue(),
                input = this.getInput();
            UI_INPUT_CONTROL.prototype.$focus.call(this, event);
            input.value = value;
            this.alterClass('-virtual');
            input.focus();
        };


        UI_INPUT_CLASS.getValue = function () {
            var value = UI_INPUT_CONTROL.prototype.getValue.call(this),
                placeholder = this._placeholder;

            return this._isPlaceholder ? '' : value;
        };

        UI_INPUT_CLASS.setValue = function (value){
            var value = value || '',
                input = this.getInput(),
                placeholder = this._placeholder;

            UI_INPUT_CONTROL.prototype.setValue.call(this, value);

            if (placeholder) {
                if (value) {
                    this._isPlaceholder = 0;
                    input.value = value;
                } else {
                    this._isPlaceholder = 1;
                    input.value = placeholder;
                    this.alterClass('+virtual');
                }
            } else {
                this._isPlaceholder = 0;
                input.value = value;
            }
        }
})();
