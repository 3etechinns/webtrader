﻿/**
 * Created by amin on November 25, 2015.
 */

define(['lodash', 'jquery', 'rivets', 'jquery-ui'], function (_, $, rv) {

    /* Rivets js does not allow manually observing properties from javascript,
       Use "rv.bind().observe('path.to.object', callback)" to subscribe */
    rivets._.View.prototype.observe = function (keypath, callback) {
        var model = this.models,
            inx;
        while ((inx = keypath.indexOf('.')) !== -1) {
            model = model[keypath.substring(0,inx)];
            keypath = keypath.substring(inx + 1);
        };
        this.adapters['.'].observe(model, keypath, function () {
            callback(model[keypath]);
        });
    };

    /************************************* formatters ***************************************/
    /* rivets formatter to check if a value is one of the given arguments */
    rv.formatters['one-of'] = function() {
        var args = [].slice.call(arguments, 0),
            value = args[0];
        for (var i = 1; i < args.length ; ++i)
          if(args[i] === value)
            return true;
        return false;
    }
    /* rivets formatter to check equallity of two values */
    rv.formatters.eq = function (value, other) {
        return value === other;
    };
    /* formatter to check not-equality of values */
    rv.formatters['not-eq'] = function (value, other) {
        return value !== other;
    };
    /* rivets formatter to replace a falsy value with a default one */
    rv.formatters['or'] = function (value, other) {
        return value || other;
    };

    /* rivets formater to capitalize string */
    rv.formatters.capitalize = {
        read: function (value) {
          return _.capitalize(value);
        },
        publish: function (value) {
          return value.toLowerCase();
        }
    };
    /* call toFixed on a fload number */
    rv.formatters['to-fixed'] = function (value, digits) {
        return (value * 1).toFixed(digits || 2);
    }
    /* notify another function on property changes */
    rv.formatters['notify'] = function() {
        var args = [].slice.call(arguments, 0);
        var value = args[0];
        for (var i = 1; i < args.length ; ++i)
          _.defer(args[i],value);
        return value;
    }
    /* rv 2-way formatter for checkboxes */
    rv.formatters.checkbox = {
      read: function(value, first, second) {
        value = _.trim(value, " '\"");
        return value === first;
      },
      publish: function(value, first, second){
        first = _.trim(first, " '\"");
        second = _.trim(second, " '\"");
        return value ? first : second;
      }
    }

    /* ternary operator (condition ? first : second) */
    rv.formatters['ternary'] = function(condition, first, second){
      return condition ? first : second;
    }
    /* formatter to add a currency symbol before the value */
    rv.formatters.currency = function(value, currency){
      var currency_symbols = {
        'USD': '$', /* US Dollar */ 'EUR': '€', /* Euro */ 'CRC': '₡', /* Costa Rican Colón */
        'GBP': '£', /* British Pound Sterling */ 'ILS': '₪', /* Israeli New Sheqel */
        'INR': '₹', /* Indian Rupee */ 'JPY': '¥', /* Japanese Yen */
        'KRW': '₩', /* South Korean Won */ 'NGN': '₦', /* Nigerian Naira */
        'PHP': '₱', /* Philippine Peso */ 'PLN': 'zł', /* Polish Zloty */
        'PYG': '₲', /* Paraguayan Guarani */ 'THB': '฿', /* Thai Baht */
        'UAH': '₴', /* Ukrainian Hryvnia */ 'VND': '₫', /* Vietnamese Dong */
      };
      return (currency_symbols[currency] || currency) + value;
    }
    /* formatter to convert epoch to utc-time in hh:mm:ss format */
    rv.formatters['utc-time'] = function(epoch){
      var d = new Date(epoch * 1000); /* since unixEpoch is simply epoch / 1000, we  multiply the argument by 1000 */
      return ("00" + d.getUTCHours()).slice(-2) + ":" +
             ("00" + d.getUTCMinutes()).slice(-2) + ":" +
             ("00" + d.getUTCSeconds()).slice(-2);
    }
    /* formatter to bold last character */
    rv.formatters['bold-last-character'] = function(str){
      str = str + '';
      return str.substring(0, str.length - 1) + '<strong>' + _.last(str) + '</strong>';
    }

    /* Debouncing enforces that a function not be called again until a certain amount of time has passed without it being called.
       As in "execute this function only if 100 milliseconds have passed without it being called." */
    rv.formatters.debounce = function(value, callback, timeout) {
        timeout = timeout || 250;
        clearTimeout(callback._timer_notify);
        callback._timer_notify = setTimeout(callback.bind(undefined,value), timeout);
        return value;
    }

    /*************************************  binding *****************************************/
    /* turn current select item into a jquery-ui-selectmenu, update value on change */
    rv.binders.selectmenu = {
        priority: 100,
        publishes: true,
        bind: function (el) {
            var publish = this.publish,
                select = $(el);
            select.selectmenu({
                change: function () {
                    publish(select.val());
                    select.trigger('change');
                }
            });
        },
        unbind: function(el){
            $(el).selectmenu( "destroy" )
        },
        routine: function (el, value) {
            $(el).val(value);
            $(el).selectmenu('refresh');
        }
    };

    /* refersh the selectmenu on array changes */
    rv.binders.selectrefresh = {
        priority: 99,
        routine: function(el,array) {
            $(el).selectmenu('refresh');
        }
    }

    /* extend jquery ui spinner to support multiple buttons */
    $.widget('ui.webtrader_spinner', $.ui.spinner, {
        _buttonHtml: function () {
            var btn = function(dir, icon, step, radius, right){
                icon = 'ui-icon-' + icon + '-1-' + (dir === 'up' ? 'n' : 's');
                right = 'right: ' + (right || '0px') + ';';
                radius = radius || '5px';
                radius = 'border-radius: 0 ' + (dir == 'up' ? radius + ' 0' : '0 ' + radius) + ' 0';

                return "<button step='" + step + "' class='ui-spinner-button ui-spinner-" + dir +
                        "' style='" + right + radius + "'>" +
                          "<span class='ui-icon " + icon +"'>&#9650;</span>" +
                       "</button>";
            }

            var ret = '';
            ret += btn('up', 'triangle', this.options.step_big || this.options.step, '5px');
            ret += btn('down', 'triangle', '-' +(this.options.step_big || this.options.step), '5px');
            return ret;
        }
    });
    /* turn input element into jquery-ui-spinner, model = {min:, max, value:},
        the element can have attributes like 'step' and in additoin an new attribute named 'step-big'.
        the value of these attrebutes will be used to increment/decrement on button press.  */
    rv.binders.spinner = {
        priority: 98,
        publishes: true,
        bind: function (el) {
            var model = this.model;
            var publish = this.publish;
            var input = $(el);
            input.webtrader_spinner({
                stop: function () {
                    var value = input.val();
                    publish(value * 1);
                },
                spin: function (e,ui) {
                    var step = $(e.currentTarget).attr('step') + '';
                    var decimals = (step.split('.')[1] || []).length;
                    value = $(this).val()*1 + step*1;
                    $(this).val(value.toFixed(decimals));
                    e.preventDefault();
                },
                step: input.attr('step') || 1,
                step_big: input.attr('step-big') || null
            });
            input.webtrader_spinner('value', model.value || model.min || 1);
        },
        unbind: function (el) {
            $(el).spinner('destroy');
        },
        routine: function(el,value){
            $(el).webtrader_spinner('value', value * 1);
        }
    };

    /* bind values to jquery ui spinner options like 'min', 'max', ... */
    rv.binders['spinner-*'] = function(el,value) {
        $(el).webtrader_spinner('option', this.args[0], value);
    }

    /* binder for jquery ui tooltip */
    rv.binders.tooltip = {
        priority: 97,
        bind: function (el) {
            $(el).attr('title',' ');
            $(el).tooltip();
        },
        unbind: function (el) {
            $(el).tooltip('destory');
        },
        routine: function (el, value) {
            $(el).tooltip('option', 'content', value);
        }
    }
    /* bindar for jqueyr ui tooltip options */
    rv.binders['tooltip-*'] = function (el, value) {
        $(el).tooltip('option', this.args[0], value);
    }

    /* trun input element in jquery-ui-datepicker */
    rv.binders.datepicker = {
        priority: 94,
        publishes: true,
        bind: function (el) {
            var input = $(el);
            var publish = this.publish;
            var model = this.model;
            var styles = { marginTop: input.attr('marginTop') || '0px', marginLeft: input.attr('marginLeft') || '0px' };

            var options = {
                showOn: model.showOn || 'focus',
                numberOfMonths: input.attr('numberOfMonths')*1 || 2,
                maxDate: model.maxDate || 0,
                minDate: model.minDate || new Date(2010, 0, 1),
                dateFormat: model.dateFormat || 'yy-mm-dd',
                showAnim: model.showAnim ||  'drop',
                showButtonPanel: model.showButtonPanel || true,
                changeMonth: model.changeMonth || true,
                changeYear: model.changeYear || true,
                onSelect: function () { $(this).change(); },
                beforeShow: function (input, inst) { inst.dpDiv.css(styles); },
                dateFormat: "yy-mm-dd"
            };

            var dpicker = input.datepicker(options);
            input.on('change', function () {
                var value = input.val();
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
        /* value could be Date() object or a string in yyyy-mm-dd format */
        routine: function (el, value) {
            $(el).datepicker("setDate", value);
        }
    }

    /* truen input element in to jquery-ui-timepicker */
    rv.binders.timepicker = {
        priority: 93,
        publishes: true,
        bind: function (el) {
            var input = $(el);
            var publish = this.publish;
            var model = this.model;
            var allways_ok = function () { return true };

            var styles = { marginTop: input.attr('marginTop') || '0px', marginLeft: input.attr('marginLeft') || '0px' };
            var update = function () {
                var value = input.val();
                publish(value);
            };

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
                onClose: update
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
        priority: 92,
        routine: function (el, value) {
            el = $(el);
            var menu = $('#' + el.attr('id') + '-menu'); // get the id of widget
            menu.removeClass(el.data('jq-class'));
            el.data({ 'jq-class': value });
            menu.addClass(value);
        }
    }

    /* bindar for css attributes */
    rv.binders['css-*'] = function (el, value) {
        var style = {};
        style[this.args[0]] = value;
        $(el).css(style);
    }

    rv.binders['show'] = function(el, value) {
        el.style.display = value ? '' : 'none';
        return value;
    };
    /* binder to add or remove disabled attribute */
    rv.binders.disabled = function(el,value){
      if(value) $(el).attr('disabled', 'disabled');
      else $(el).removeAttr('disabled');
    }

    /* binder to scroll to buttom automatically */
    rv.binders['auto-scroll-bottom'] = {
      priority: 91, /* run after native bindings */
      routine: function(el) {
        $(el).animate({ scrollTop: el.scrollHeight - $(el).height() }, 'slow');
      }
    }

    /* binder with high priority to apply attributes first */
    rv.binders['attr-*'] = {
      priority: 10*1000,
      routine: function(el,value){
        el.setAttribute(this.args[0],value);
      }
    }
    return rv;
});
