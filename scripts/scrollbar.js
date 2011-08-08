/*
Scrollbar - 定义在区间轴内移动的基本操作。
滚动条控件，继承自基础控件。滚动条控件，内部包含三个部件，分别是向前(滚动条的当前值变小)滚动按钮、向后(滚动条的当前值变大)滚动按钮与滑动按钮。滚动条控件是滚动行为的虚拟实现，不允许直接初始化，它的子类通常情况下也不会被直接初始化，而是作为控件的一部分用于控制父控件的行为。

属性
_nTotal         - 滚动条区域允许设置的最大值
_nStep          - 滚动条移动一次时的基本步长
_nValue         - 滚动条当前设置的值
_oStop          - 定时器的句柄，用于连续滚动处理
_uPrev          - 向前滚动按钮
_uNext          - 向后滚动按钮
_uThumb         - 滑动按钮

滑动按钮属性
_oRange         - 滑动按钮的合法滑动区间
*/
//{if 0}//
(function () {

    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util,

        MATH = Math,
        FLOOR = MATH.floor,
        MAX = MATH.max,
        MIN = MATH.min,

        children = dom.children,
        blank = util.blank,
        extend = util.extend,
        timer = util.timer,

        $fastCreate = core.$fastCreate,
        drag = core.drag,
        getActived = core.getActived,
        getMouseX = core.getMouseX,
        getMouseY = core.getMouseY,
        inheritsControl = core.inherits,

        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = UI_CONTROL.prototype,
        UI_BUTTON = ui.Button,
        UI_BUTTON_CLASS = UI_BUTTON.prototype;
//{/if}//
//{if $phase == "define"}//
    /**
     * 初始化滚动条控件。
     * @protected
     *
     * @param {Object} options 初始化选项
     */
    ///__gzip_original__UI_SCROLLBAR
    ///__gzip_original__UI_SCROLLBAR_CLASS
    ///__gzip_original__UI_VSCROLLBAR
    ///__gzip_original__UI_VSCROLLBAR_CLASS
    ///__gzip_original__UI_HSCROLLBAR
    ///__gzip_original__UI_HSCROLLBAR_CLASS
    var UI_SCROLLBAR = ui.Scrollbar =
        inheritsControl(
            UI_CONTROL,
            'ui-scrollbar',
            function (el, options) {
                //__gzip_original__primary
                //__gzip_original__type
                //__gzip_original__unitOptions
                var primary = options.primary,
                    unitOptions = {userSelect: false, focusable: false},
                    buttonClass = findConstructor(this, 'Button'),
                    thumbClass = findConstructor(this, 'Thumb');

                UI_CONTROL.client.call(this, el, extend(options, unitOptions));

                el.innerHTML =
                    '<div class="' +
                        primary + '-prev ui-scrollbar-prev ' + buttonClass.TYPES +
                        '" style="position:absolute;top:0px;left:0px"></div><div class="' +
                        primary + '-next ui-scrollbar-next ' + buttonClass.TYPES +
                        '" style="position:absolute;top:0px;left:0px"></div><div class="' +
                        primary + '-thumb ' + thumbClass.TYPES +
                        '" style="position:absolute"></div>';

                // 使用 el 代替 children
                el = children(el);

                // 初始化滚动条控件
                this._nValue = this._nTotal = 0;
                this._nStep = 1;

                // 创建向前/向后滚动按钮与滑动按钮
                this._uPrev = $fastCreate(buttonClass, el[0], this, unitOptions);
                this._uNext = $fastCreate(buttonClass, el[1], this, unitOptions);
                this._uThumb = $fastCreate(thumbClass, el[2], this, unitOptions);

                this._oStop = blank;
            }
        ),
        UI_SCROLLBAR_CLASS = UI_SCROLLBAR.prototype,

        /**
         * 初始化滚动条控件的滑动按钮部件。
         * @protected
         *
         * @param {Object} options 初始化选项
         */
        UI_SCROLLBAR_THUMB_CLASS =
            (UI_SCROLLBAR.Thumb = inheritsControl(UI_BUTTON, 'ui-scrollbar-thumb')).prototype,

        /**
         * 初始化滚动条控件的按钮部件。
         * @protected
         *
         * @param {Object} options 初始化选项
         */
        UI_SCROLLBAR_BUTTON_CLASS =
            (UI_SCROLLBAR.Button = inheritsControl(UI_BUTTON, 'ui-scrollbar-button')).prototype;
//{else}//
    /**
     * 控扭控件自动滚动。
     * @private
     *
     * @param {ecui.ui.Scrollbar} scrollbar 滚动条控件
     * @param {number} step 单次滚动步长，为负数表示向前滚动，否则是向后滚动
     * @param {number} interval 触发时间间隔，默认40ms
     */
    function UI_SCROLLBAR_AUTO_SCROLL(scrollbar, step, interval) {
        var value = scrollbar._nValue,
            direction = scrollbar.getMouseDirection();

        // 如果有没有结束的自动滚动，需要先结束，这种情况出现在快速的多次点击时
        scrollbar._oStop();

        if (direction == -1 && step < 0 || direction == 1 && step > 0) {
            scrollbar.setValue(value + step);
        }
        else {
            // 如果因为鼠标位置的原因无法自动滚动，需要强制设置值变化属性
            value = -1;
        }

        // 如果滚动条的值发生变化，将进行下一次的自动滚动，否则滚动条已经到达两端停止自动滚动
        scrollbar._oStop = scrollbar._nValue != value ?
            timer(UI_SCROLLBAR_AUTO_SCROLL, interval || 200, null, scrollbar, step, 40) : blank;
    }

    /**
     * 滚动条值发生改变后的处理。
     * 滚动条的值发生后，将触发父控件的 onscroll 事件，如果事件返回值不为 false，则调用父控件的 $scroll 方法。
     * @private
     *
     * @param {ecui.ui.Scrollbar} scrollbar 滚动条控件
     */
    function UI_SCROLLBAR_CHANGE(scrollbar) {
        // 这里使用 scrollbar 代表滚动条控件的父控件
        scrollbar = scrollbar.getParent();
        if (scrollbar) {
            if (!(scrollbar.onscroll && scrollbar.onscroll() === false)) {
                scrollbar.$scroll();
            }
        }
    }

    /**
     * 控件获得激活事件的默认处理。
     * 滑动按钮获得激活时，触发滑动按钮进入拖拽状态。
     * @protected
     *
     * @param {ecui.ui.Event} event 事件对象
     */
    UI_SCROLLBAR_THUMB_CLASS.$activate = function (event) {
        UI_BUTTON_CLASS.$activate.call(this, event);

        drag(this, event, this._oRange);
    };

    /**
     * 控件拖拽移动事件的默认处理。
     * @protected
     *
     * @param {ecui.ui.Event} event 事件对象
     * @param {number} x X轴坐标
     * @param {number} y Y轴坐标
     */
    UI_SCROLLBAR_THUMB_CLASS.$dragmove = function (event, x, y) {
        UI_BUTTON_CLASS.$dragmove.call(this, event, x, y);

        var parent = this.getParent(),
            value = parent.$calculateValue(x, y);

        // 应该滚动step的整倍数
        parent.$setValue(value == parent._nTotal ? value : value - value % parent._nStep);
        UI_SCROLLBAR_CHANGE(parent);
    };

    /**
     * 设置滑动按钮的合法拖拽区间。
     * @public
     *
     * @param {number} top 允许拖拽的最上部区域
     * @param {number} right 允许拖拽的最右部区域
     * @param {number} bottom 允许拖拽的最下部区域
     * @param {number} left 允许拖拽的最左部区域
     */
    UI_SCROLLBAR_THUMB_CLASS.setRange = function (top, right, bottom, left) {
        this._oRange = {
            top: top,
            right: right,
            bottom: bottom,
            left: left
        };
    };

    /**
     * 控件获得激活事件的默认处理。
     * 滚动条按钮获得激活时，将开始自动滚动。
     * @protected
     *
     * @param {ecui.ui.Event} event 事件对象
     */
    UI_SCROLLBAR_BUTTON_CLASS.$activate = function (event) {
        UI_BUTTON_CLASS.$activate.call(this, event);

        var parent = this.getParent();
        UI_SCROLLBAR_AUTO_SCROLL(parent, parent.getMouseDirection() * MAX(parent._nStep, 5));
    };

    /**
     * 控件失去激活事件的默认处理。
     * 滚动条按钮失去激活时，将停止自动滚动。
     * @protected
     *
     * @param {ecui.ui.Event} event 事件对象
     */
    UI_SCROLLBAR_BUTTON_CLASS.$deactivate = function (event) {
        UI_BUTTON_CLASS.$deactivate.call(this, event);
        this.getParent()._oStop();
    };

    /**
     * 鼠标移出事件的默认处理。
     * 滚动条按钮鼠标移出时，如果控件处于直接激活状态，将暂停自动滚动。
     * @protected
     *
     * @param {ecui.ui.Event} event 事件对象
     */
    UI_SCROLLBAR_BUTTON_CLASS.$mouseout = function (event) {
        UI_BUTTON_CLASS.$mouseout.call(this, event);
        if (getActived() == this) {
            this.getParent()._oStop(true);
        }
    };

    /**
     * 鼠标移入事件的默认处理。
     * 滚动条按钮鼠标移出时，如果控件处于直接激活状态，将恢复自动滚动。
     * @protected
     *
     * @param {ecui.ui.Event} event 事件对象
     */
    UI_SCROLLBAR_BUTTON_CLASS.$mouseover = function (event) {
        UI_BUTTON_CLASS.$mouseover.call(this, event);
        if (getActived() == this) {
            this.getParent()._oStop(true);
        }
    };

    /**
     * 控件获得激活事件的默认处理。
     * 滚动条获得激活时，将开始自动滚动。
     * @protected
     *
     * @param {ecui.ui.Event} event 事件对象
     */
    UI_SCROLLBAR_CLASS.$activate = function (event) {
        UI_CONTROL_CLASS.$activate.call(this, event);
        UI_SCROLLBAR_AUTO_SCROLL(this, this.getMouseDirection() * this.$getPageStep());
    };

    /**
     * 缓存控件的属性。
     * @protected
     *
     * @param {CssStyle} style 主元素的 Css 样式对象
     * @param {boolean} cacheSize 是否需要缓存控件的大小，如果控件是另一个控件的部件时，不缓存大小能加快渲染速度，默认缓存
     */
    UI_SCROLLBAR_CLASS.$cache = function (style, cacheSize) {
        UI_CONTROL_CLASS.$cache.call(this, style, cacheSize);

        this._uPrev.cache(true, true);
        this._uNext.cache(true, true);
        this._uThumb.cache(true, true);
    };

    /**
     * 控件失去激活事件的默认处理。
     * 滚动条失去激活时，将停止自动滚动。
     * @protected
     *
     * @param {ecui.ui.Event} event 事件对象
     */
    UI_SCROLLBAR_CLASS.$deactivate = function (event) {
        UI_CONTROL_CLASS.$deactivate.call(this, event);
        this._oStop();
    };

    /**
     * 隐藏控件。
     * 隐藏滚动条控件时，滚动条控件的当前值需要复位为0，参见 setValue 方法。
     * @protected
     */
    UI_SCROLLBAR_CLASS.$hide = function () {
        UI_CONTROL_CLASS.$hide.call(this);
        UI_SCROLLBAR_CLASS.setValue.call(this, 0);
    };

    /**
     * 鼠标移出事件的默认处理。
     * 滚动条鼠标移出时，如果控件处于直接激活状态，将暂停自动滚动。
     * @protected
     *
     * @param {ecui.ui.Event} event 事件对象
     */
    UI_SCROLLBAR_CLASS.$mouseout = function (event) {
        UI_CONTROL_CLASS.$mouseout.call(this, event);
        if (getActived() == this) {
            this._oStop(true);
        }
    };

    /**
     * 鼠标移入事件的默认处理。
     * 滚动条鼠标移出时，如果控件处于直接激活状态，将恢复自动滚动。
     * @protected
     *
     * @param {ecui.ui.Event} event 事件对象
     */
    UI_SCROLLBAR_CLASS.$mouseover = function (event) {
        UI_CONTROL_CLASS.$mouseover.call(this, event);
        if (getActived() == this) {
            this._oStop(true);
        }
    };

    /**
     * 设置滚动条控件的单页步长。
     * 滚动条控件的单页步长决定在点击滚动条空白区域(即非按钮区域)时滚动一页移动的距离，如果不设置单页步长，默认使用最接近滚动条长度的合理步长(即单项步长最接近总长度的整数倍)。
     * @protected
     *
     * @param {number} step 单页步长
     */
    UI_SCROLLBAR_CLASS.$setPageStep = function (step) {
        this._nPageStep = step;
    };

    /**
     * 设置控件的大小。
     * @protected
     *
     * @param {number} width 宽度，如果不需要设置则将参数设置为等价于逻辑非的值
     * @param {number} height 高度，如果不需要设置则省略此参数
     */
    UI_SCROLLBAR_CLASS.$setSize = function (width, height) {
        UI_CONTROL_CLASS.$setSize.call(this, width, height);
        this.$locate();
    };

    /**
     * 直接设置控件的当前值。
     * $setValue 仅仅设置控件的参数值，不进行合法性验证，也不改变滑动按钮的位置信息，用于滑动按钮拖拽时同步设置当前值。
     * @protected
     *
     * @param {number} value 控件的当前值
     */
    UI_SCROLLBAR_CLASS.$setValue = function (value) {
        this._nValue = value;
    };

    /**
     * 获取滚动条控件的单次滚动步长。
     * getStep 方法返回滚动条控件发生滚动时，移动的最小步长值，通过 setStep 设置。
     * @public
     *
     * @return {number} 单次滚动步长
     */
    UI_SCROLLBAR_CLASS.getStep = function () {
        return this._nStep;
    };

    /**
     * 获取滚动条控件的最大值。
     * getTotal 方法返回滚动条控件允许滚动的最大值，最大值、当前值与滑动按钮控件的实际位置互相影响，通过 setTotal 设置。
     * @public
     *
     * @return {number} 控件的最大值
     */
    UI_SCROLLBAR_CLASS.getTotal = function () {
        return this._nTotal;
    };

    /**
     * 获取滚动条控件的当前值。
     * getValue 方法返回滚动条控件的当前值，最大值、当前值与滑动按钮控件的实际位置互相影响，但是当前值不允许超过最大值，通过 setValue 方法设置。
     * @public
     *
     * @return {number} 滚动条控件的当前值
     */
    UI_SCROLLBAR_CLASS.getValue = function () {
        return this._nValue;
    };

    /**
     * 控件初始化。
     * @public
     */
    UI_SCROLLBAR_CLASS.init = function () {
        UI_CONTROL_CLASS.init.call(this);
        this._uPrev.init();
        this._uNext.init();
        this._uThumb.init();
    };

    /**
     * 设置滚动条控件的单次滚动步长。
     * setStep 方法设置的值必须大于0，否则不会进行操作。
     * @public
     *
     * @param {number} value 单次滚动步长
     */
    UI_SCROLLBAR_CLASS.setStep = function (value) {
        if (value > 0) {
            this._nStep = value;
        }
    };

    /**
     * 设置滚动条控件的最大值。
     * setTotal 方法设置的值不能为负数，当前值如果大于最大值，设置当前值为新的最大值，最大值发生改变将导致滑动按钮刷新。
     * @public
     *
     * @param {number} value 控件的最大值
     */
    UI_SCROLLBAR_CLASS.setTotal = function (value) {
        if (value >= 0 && this._nTotal != value) {
            this._nTotal = value;
            // 检查滚动条控件的当前值是否已经越界
            if (this._nValue > value) {
                // 值发生改变时触发相应的事件
                this._nValue = value;
                UI_SCROLLBAR_CHANGE(this);
            }
            this.$flushThumb();
        }
    };

    /**
     * 设置滚动条控件的当前值。
     * setValue 方法设置的值不能为负数，也不允许超过使用 setTotal 方法设置的控件的最大值，如果当前值不合法，将自动设置为最接近合法值的数值，当前值发生改变将导致滑动按钮控件刷新。
     * @public
     *
     * @param {number} value 控件的当前值
     */
    UI_SCROLLBAR_CLASS.setValue = function (value) {
        value = MIN(MAX(0, value), this._nTotal);
        if (this._nValue != value) {
            // 值发生改变时触发相应的事件
            this._nValue = value;
            UI_SCROLLBAR_CHANGE(this);
            this.$flushThumb();
        }
    };

    /**
     * 滚动条控件当前值移动指定的步长次数。
     * 参数 value 必须是整数, 正数则向最大值方向移动，负数则向0方向移动，允许移动的区间在0-最大值之间，参见 setStep、setTotal 与 setValue 方法。
     * @public
     *
     * @param {number} n 移动的步长次数
     */
    UI_SCROLLBAR_CLASS.skip = function (n) {
        this.setValue(this._nValue + n * this._nStep);
    };
//{/if}//
//{if $phase == "define"}//
    /**
     * 初始化垂直滚动条控件。
     * @public
     *
     * @param {Object} options 初始化选项
     */
    var UI_VSCROLLBAR = ui.VScrollbar = inheritsControl(UI_SCROLLBAR, 'ui-v-scrollbar'),
        UI_VSCROLLBAR_CLASS = UI_VSCROLLBAR.prototype;
//{else}//
    /**
     * 计算滑动按钮拖拽时的当前值。
     * 滑动按钮拖拽时，根据位置计算对应的当前值，然后通过 $setValue 方法直接设置。
     * @protected
     *
     * @param {number} x 滑动按钮实际到达的X轴坐标
     * @param {number} y 滑动按钮实际到达的Y轴坐标
     */
    UI_VSCROLLBAR_CLASS.$calculateValue = function (x, y) {
        //__gzip_original__range
        var thumb = this._uThumb,
            range = thumb._oRange;
        return (y - range.top) / (range.bottom - this._uPrev.getHeight() - thumb.getHeight()) * this._nTotal;
    };

    /**
     * 滑动按钮刷新。
     * 当滚动条控件的大小或最大值/当前值发生变化时，滑动按钮的大小与位置需要同步改变，参见 setSize、setValue 与 setTotal 方法。
     * @protected
     */
    UI_VSCROLLBAR_CLASS.$flushThumb = function () {
        // 计算滑动按钮高度与位置
        var thumb = this._uThumb,
            total = this._nTotal,
            height = this.getHeight(),
            prevHeight = this._uPrev.getHeight(),
            bodyHeight = this.getBodyHeight(),
            thumbHeight = MAX(FLOOR(bodyHeight * height / (height + total)), thumb.getMinimumHeight() + 5);

        if (total) {
            thumb.$setSize(0, thumbHeight);
            thumb.setPosition(0, prevHeight + FLOOR((this._nValue / total) * (bodyHeight - thumbHeight)));
            thumb.setRange(prevHeight, 0, bodyHeight + prevHeight, 0);
        }
    };

    /**
     * 获取单页的步长。
     * 如果使用 $setPageStep 方法设置了单页的步长，$getPageStep 方法直接返回设置的步长，否则 $getPageStep 返回最接近滚动条控件长度的步长的整数倍。
     * @protected
     *
     * @return {number} 单页的步长
     */
    UI_VSCROLLBAR_CLASS.$getPageStep = function () {
        var height = this.getHeight();
        return this._nPageStep || height - height % this._nStep;
    };

    /**
     * 设置控件的大小。
     * @protected
     *
     * @param {number} width 宽度，如果不需要设置则将参数设置为等价于逻辑非的值
     * @param {number} height 高度，如果不需要设置则省略此参数
     */
    UI_VSCROLLBAR_CLASS.$setSize = function (width, height) {
        UI_SCROLLBAR_CLASS.$setSize.call(this, width, height);

        //__gzip_original__next
        var bodyWidth = this.getBodyWidth(),
            prevHeight = this.$cache$paddingTop,
            next = this._uNext;

        // 设置滚动按钮与滑动按钮的信息
        this._uPrev.$setSize(bodyWidth, prevHeight);
        next.$setSize(bodyWidth, this.$cache$paddingBottom);
        this._uThumb.$setSize(bodyWidth);
        next.setPosition(0, this.getBodyHeight() + prevHeight);

        this.$flushThumb();
    };

    /**
     * 获取鼠标相对于滑动按钮的方向。
     * 鼠标如果在滑动按钮之前，返回 -1，鼠标如果在滑动按钮之后，返回 1，否则返回 0。
     * @protected
     *
     * @return {number} 鼠标相对于滑动按钮的方向数值
     */
    UI_VSCROLLBAR_CLASS.getMouseDirection = function () {
        return getMouseY(this) < this._uThumb.getY() ?
            -1 : getMouseY(this) > this._uThumb.getY() + this._uThumb.getHeight() ? 1 : 0;
    };
//{/if}//
//{if $phase == "define"}//
    /**
     * 初始化水平滚动条控件。
     * @public
     *
     * @param {Object} options 初始化选项
     */
    var UI_HSCROLLBAR = ui.HScrollbar = inheritsControl(UI_SCROLLBAR, 'ui-h-scrollbar'),
        UI_HSCROLLBAR_CLASS = UI_HSCROLLBAR.prototype;
//{else}//
    /**
     * 计算滑动按钮拖拽时的当前值。
     * 滑动按钮拖拽时，根据位置计算对应的当前值，然后通过 $setValue 方法直接设置。
     * @protected
     *
     * @param {number} x 滑动按钮实际到达的X轴坐标
     * @param {number} y 滑动按钮实际到达的Y轴坐标
     */
    UI_HSCROLLBAR_CLASS.$calculateValue = function (x, y) {
        //__gzip_original__range
        var thumb = this._uThumb,
            range = thumb._oRange;
        return (x - range.left) / (range.right - this._uPrev.getWidth() - thumb.getWidth()) * this._nTotal;
    };

    /**
     * 滑动按钮刷新。
     * 当滚动条控件的大小或最大值/当前值发生变化时，滑动按钮的大小与位置需要同步改变，参见 setSize、setValue 与 setTotal 方法。
     * @protected
     */
    UI_HSCROLLBAR_CLASS.$flushThumb = function () {
        // 计算滑动按钮高度与位置
        var thumb = this._uThumb,
            total = this._nTotal,
            width = this.getWidth(),
            prevWidth = this._uPrev.getWidth(),
            bodyWidth = this.getBodyWidth(),
            thumbWidth = MAX(FLOOR(bodyWidth * width / (width + total)), thumb.getMinimumWidth() + 5);

        if (total) {
            thumb.$setSize(thumbWidth);
            thumb.setPosition(prevWidth + FLOOR((this._nValue / total) * (bodyWidth - thumbWidth)), 0);
            thumb.setRange(0, bodyWidth + prevWidth, 0, prevWidth);
        }
    };

    /**
     * 获取单页的步长。
     * 如果使用 $setPageStep 方法设置了单页的步长，$getPageStep 方法直接返回设置的步长，否则 $getPageStep 返回最接近滚动条控件长度的步长的整数倍。
     * @protected
     *
     * @return {number} 单页的步长
     */
    UI_HSCROLLBAR_CLASS.$getPageStep = function () {
        var width = this.getWidth();
        return width - width % this._nStep;
    };

    /**
     * 设置控件的大小。
     * @protected
     *
     * @param {number} width 宽度，如果不需要设置则将参数设置为等价于逻辑非的值
     * @param {number} height 高度，如果不需要设置则省略此参数
     */
    UI_HSCROLLBAR_CLASS.$setSize = function (width, height) {
        UI_SCROLLBAR_CLASS.$setSize.call(this, width, height);

        //__gzip_original__next
        var bodyHeight = this.getBodyHeight(),
            prevWidth = this.$cache$paddingLeft,
            next = this._uNext;

        // 设置滚动按钮与滑动按钮的信息
        this._uPrev.$setSize(prevWidth, bodyHeight);
        next.$setSize(this.$cache$paddingRight, bodyHeight);
        this._uThumb.$setSize(0, bodyHeight);
        next.setPosition(this.getBodyWidth() + prevWidth, 0);

        this.$flushThumb();
    };

    /**
     * 获取鼠标相对于滑动按钮的方向。
     * 鼠标如果在滑动按钮之前，返回 -1，鼠标如果在滑动按钮之后，返回 1，否则返回 0。
     * @protected
     *
     * @return {number} 鼠标相对于滑动按钮的方向数值
     */
    UI_HSCROLLBAR_CLASS.getMouseDirection = function () {
        return getMouseX(this) < this._uThumb.getX() ?
            -1 : getMouseX(this) > this._uThumb.getX() + this._uThumb.getWidth() ? 1 : 0;
    };
//{/if}//
//{if 0}//
})();
//{/if}//