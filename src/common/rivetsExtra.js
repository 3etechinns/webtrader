﻿/**
 * Created by amin on November 25, 2015.
 */

define(['jquery', 'rivets', 'jquery-ui'], function ($, rv) {

    /* Rivets js does not allow manually observing properties from javascript,
       Use "rv.bind().observe('path.to.object', callback)" to subscribe */
    rivets._.View.prototype.observe = function (keypath, callback) {
        var model = this.models,
            inx;
        while ((inx = keypath.indexOf('.')) !== -1) {
            model = model[keypath.substring(0,inx)];
            keypath = keypath.substring(inx + 1);
            console.warn(JSON.stringify(model), keypath);
        };
        this.adapters['.'].observe(model, keypath, function () {
            callback(model[keypath]);
        });
    };

    /************************************* formatters ***************************************/
    /* rivets formatter to check equallity of two values */
    rv.formatters.eq = function (value, other) {
        return value === other;
    }

    /* rivets formater to capitalize string */
    rv.formatters.capitalize = {
        read: function (value) {
            return value.charAt(0).toUpperCase() + value.slice(1);
        },
        publish: function (value) {
            return value.toLowerCase();
        }
    }

    /* notify another function on property changes */
    rv.formatters['instant-notify'] = function() {
        var args = [].slice.call(arguments, 0);
        var value = args[0];
        for (var i = 1; i < args.length ; ++i)
            args[i](value);
        return value;
    }

    /* Debouncing enforces that a function not be called again until a certain amount of time has passed without it being called.
       As in "execute this function only if 100 milliseconds have passed without it being called." */
    rv.formatters.notify = function(value, callback, timeout) {
        timeout = timeout || 250;
        clearTimeout(callback._timer_notify);
        callback._timer_notify = setTimeout(callback.bind(this,value), timeout);
        return value;
    }

    /*************************************  binding *****************************************/
    /* turn current select item into a jquery-ui-selectmenu, update value on change */
    rv.binders.selectmenu = {
        priority: 100,
        publishes: true,
        bind: function (el) {
            console.warn('selectmenu.bind()');
            var publish = this.publish,
                select = $(el);
            select.selectmenu({
                change: function () {
                    console.warn('selectmenu.change()', select.val());
                    publish(select.val());
                    select.trigger('change');
                }
            });
        },
        unbind: function(el){
            $(el).selectmenu( "destroy" )
        },
        routine: function (el, value) {
            console.warn('selectmenu.routine()', value);
            $(el).val(value).selectmenu('refresh');
        }
    };

    /* refersh the selectmenu on array changes */
    rv.binders.selectrefresh = {
        priority: 99,
        routine: function(el,array) {
            $(el).selectmenu('refresh');
        }
    }

    /* turn input element into jquery-ui-spinner, model = {min:, max, value:} */
    rv.binders.spinner = {
        priority: 98,
        publishes: true,
        bind: function (el) {
            console.warn('spinner.bind()');
            var model = this.model;
            var publish = this.publish;
            var input = $(el);
            var onchange = function () {
                var value = input.val();
                publish(value | 0);
            }
            input.spinner({
                min: model.min || 1,
                max: model.max || null,
                stop: onchange
            });
            input.spinner('value', model.value || model.min || 1);
        },
        unbind: function (el) {
            $(el).spinner('destroy');
        },
        routine: function(el,value){
            console.warn('spinner.routing()', value);
            $(el).spinner('value', value);
        }
    };

    /* trun input element in jquery-ui-datepicker */
    rv.binders.datepicker = {
        priority: 97,
        publishes: true,
        bind: function (el) {
            console.warn('datepicker.bind()');
            var input = $(el);
            var publish = this.publish;
            var model = this.model;
            var styles = (model && model.styles) || { marginTop: '10px', marginLeft: '-250px' }; 

            var options = {
                showOn: model.showOn || 'focus',
                numberOfMonths: model.numberOfMonths || 2,
                maxDate: model.maxDate || 0,
                minDate: model.minDate || new Date(2010, 0, 1),
                dateFormat: model.dateFormat || 'yy-mm-dd',
                showAnim: model.showAnim ||  'drop',
                showButtonPanel: model.showButtonPanel || true,
                changeMonth: model.changeMonth || true,
                changeYear: model.changeYear || true,
                onSelect: function () { $(this).change(); },
                beforeShow: function (input, inst) { inst.dpDiv.css(styles); }
            };

            var dpicker = input.datepicker(options);
            input.on('change', function () {
                var value = input.val();
                console.warn('datepicker change > ', value);
                publish(value);
                input.blur(); // remove focus from input
            });

            $.datepicker._gotoToday = function (id) {
                $(id).datepicker('setDate', new Date()).change().datepicker('hide');
            };
        },
        unbind: function(el){
            $(el).datepicker('destroy');
        },
        routine: function (el, value) {
            $(el).datepicker("setDate", value);
        }
    }

    /* truen input element in to jquery-ui-timepicker */
    rv.binders.timepicker = {
        priority: 96,
        publishes: true,
        bind: function (el) {
            var input = $(el);
            var publish = this.publish;
            var model = this.model;
            var allways_ok = function () { return true };

            var styles = model.styles || { marginTop: '3px', marginLeft: '-250px' }; 
            input.timepicker({
                showPeriod: model.showPeriod || false,
                showLeadingZero: model.showLeadingZero || true,
                showCloseButton: model.showCloseButton || true,
                showNowButton: model.showNowButton || true,
                onHourShow: model.onHourShow || allways_ok,
                onMinuteShow: model.onMinuteShow || allways_ok,
                beforeShow: function (input, inst) {
                    inst.tpDiv.css(styles);
                },
                onSelect: function () {
                    var value = input.val();
                    console.warn('timepicker changed >', value);
                    publish(value);
                }
            });
        },
        unbind: function (el) {
            $(el).timepicker('destroy');
        },
        routine: function (el, value) {
            $(el).val(value);
        }
    }

    /* add a css class to corresponding jquery-ui widget from the dummy html element */
    rv.binders['jq-class'] = {
        priority: 95,
        routine: function (el, value) {
            console.warn('rv.binders.jq-class.routine()', value);
            el = $(el);
            var menu = $('#' + el.attr('id') + '-menu'); // get the id of widget
            menu.removeClass(el.data('jq-class'));
            el.data({ 'jq-class': value });
            menu.addClass(value);
        }
    }
    return rv;
});
