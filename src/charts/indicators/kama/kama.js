﻿/**
 * Created by Mahboob.M on 12/20/15.
 */

define(["jquery", 'common/rivetsExtra', "jquery-ui", 'color-picker', 'ddslick'], function ($, rv) {

    function closeDialog() {
        $(this).dialog("close");
        $(this).find("*").removeClass('ui-state-error');
    }

    function init(containerIDWithHash, _callback) {

        require(['css!charts/indicators/kama/kama.css']);

        require(['text!charts/indicators/kama/kama.html', 'text!charts/indicators/indicators.json'], function ($html, data) {

            var defaultStrokeColor = '#cd0a0a';

            $html = $($html);
            //$html.hide();
            $html.appendTo("body");

            data = JSON.parse(data);
            var current_indicator_data = data.kama;
            var state = {
                "title": current_indicator_data.long_display_name,
                "description": current_indicator_data.description
            }
            rv.bind($html[0], state);

            $html.find("input[type='button']").button();

            $html.find("#kama_stroke").colorpicker({
                position: {
                    at: "right+100 bottom",
                    of: "element",
                    collision: "fit"
                },
                part: {
                    map: { size: 128 },
                    bar: { size: 128 }
                },
                select: function (event, color) {
                    $("#kama_stroke").css({
                        background: '#' + color.formatted
                    }).val('');
                    defaultStrokeColor = '#' + color.formatted;
                },
                ok: function (event, color) {
                    $("#kama_stroke").css({
                        background: '#' + color.formatted
                    }).val('');
                    defaultStrokeColor = '#' + color.formatted;
                }
            });

            var selectedDashStyle = "Solid";
            $('#kama_dashStyle').ddslick({
                imagePosition: "left",
                width: 150,
                background: "white",
                onSelected: function (data) {
                    $('#kama_dashStyle .dd-selected-image').css('max-width', '115px');
                    selectedDashStyle = data.selectedData.value
                }
            });
            $('#kama_dashStyle .dd-option-image').css('max-width', '115px');

            $html.dialog({
                autoOpen: false,
                resizable: false,
                width: 350,
                height: 400,
                modal: true,
                my: 'center',
                at: 'center',
                of: window,
                dialogClass: 'kama-ui-dialog',
                buttons: [
                    {
                        text: "OK",
                        click: function () {
                            var isValid = true;
                            $(".kama_input_width_for_period").each(function () {
                                 var $elem = $(this);
                                 if (!_.isInteger(_.toNumber($elem.val())) || !_.inRange($elem.val(), parseInt($elem.attr("min")), parseInt($elem.attr("max")) + 1)) {
                                    require(["jquery", "jquery-growl"], function ($) {
                                        $.growl.error({
                                            message: "Only numbers between " + $elem.attr("min")
                                                    + " to " + $elem.attr("max")
                                                    + " is allowed for " + $elem.closest('tr').find('td:first').text() + "!"
                                        });
                                    });
                                    $elem.val($elem.prop("defaultValue"));
                                    isValid = false;
                                    return;
                                }
                            });

                            if (!isValid) return;

                            var options = {
                                period: parseInt($html.find("#kama_period").val()),
                                fastPeriod: parseInt($html.find("#kama_fast_period").val()),
                                slowPeriod: parseInt($html.find("#kama_slow_period").val()),
                                stroke: defaultStrokeColor,
                                strokeWidth: parseInt($html.find("#kama_strokeWidth").val()),
                                dashStyle: selectedDashStyle,
                                appliedTo: parseInt($html.find("#kama_appliedTo").val())
                            }
                            //Add KAMA for the main series
                            $($(".kama").data('refererChartID')).highcharts().series[0].addIndicator('kama', options);

                            closeDialog.call($html);
                        }
                    },
                    {
                        text: "Cancel",
                        click: function () {
                            closeDialog.call(this);
                        }
                    }
                ]
            });
            $html.find('select').selectmenu({
                width : 150
            });

            if ($.isFunction(_callback)) {
                _callback(containerIDWithHash);
            }


        });

    }

    return {

        open: function (containerIDWithHash) {

            if ($(".kama").length == 0) {
                init(containerIDWithHash, this.open);
                return;
            }

            $(".kama").data('refererChartID', containerIDWithHash).dialog("open");

        }

    };

});
