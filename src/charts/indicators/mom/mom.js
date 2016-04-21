﻿/**
 * Created by Majboob.M on 2/2/16.
 */

define(["jquery", "jquery-ui", 'color-picker', 'ddslick'], function ($) {

    function closeDialog() {
        $(this).dialog("close");
        $(this).find("*").removeClass('ui-state-error');
    }

    function init(containerIDWithHash, _callback) {

        require(['css!charts/indicators/mom/mom.css']);

        var defaultLevels = [];

        require(['text!charts/indicators/mom/mom.html'], function ($html) {

            var defaultStrokeColor = '#cd0a0a';

            $html = $($html);
            //$html.hide();
            $html.appendTo("body");
            $html.find("input[type='button']").button();

            $html.find("#mom_stroke").colorpicker({
                part: {
                    map: { size: 128 },
                    bar: { size: 128 }
                },
                select: function (event, color) {
                    $("#mom_stroke").css({
                        background: '#' + color.formatted
                    }).val('');
                    defaultStrokeColor = '#' + color.formatted;
                },
                ok: function (event, color) {
                    $("#mom_stroke").css({
                        background: '#' + color.formatted
                    }).val('');
                    defaultStrokeColor = '#' + color.formatted;
                }
            });

            var selectedDashStyle = "Solid";
            $('#mom_dashStyle').ddslick({
                imagePosition: "left",
                width: 118,
                background: "white",
                onSelected: function (data) {
                    $('#mom_dashStyle .dd-selected-image').css('max-width', '85px');
                    selectedDashStyle = data.selectedData.value
                }
            });
            $('#mom_dashStyle .dd-option-image').css('max-width', '85px');

            $html.dialog({
                autoOpen: false,
                resizable: false,
                width: 350,
                modal: true,
                my: 'center',
                at: 'center',
                of: window,
                dialogClass: 'mom-ui-dialog',
                buttons: [
                    {
                        text: "OK",
                        click: function () {
                             var $elem = $(".mom_input_width_for_period");
                             if (!_.isInteger(_.toNumber($elem.val())) || !_.inRange($elem.val(),
                                             parseInt($elem.attr("min")),
                                             parseInt($elem.attr("max")) + 1)) {
                                 require(["jquery", "jquery-growl"], function ($) {
                                     $.growl.error({
                                         message: "Only numbers between " + $elem.attr("min")
                                                 + " to " + $elem.attr("max")
                                                 + " is allowed for " + $elem.closest('tr').find('td:first').text() + "!"
                                     });
                                 });
                                 $elem.val($elem.prop("defaultValue"));
                                 return;
                             };

                            var options = {
                                period: parseInt($html.find(".mom_input_width_for_period").val()),
                                stroke: defaultStrokeColor,
                                strokeWidth: parseInt($html.find("#mom_strokeWidth").val()),
                                dashStyle: selectedDashStyle,
                                appliedTo: parseInt($html.find("#mom_appliedTo").val()),
                                levels: []
                            };
                            //Add MOM for the main series
                            $($(".mom").data('refererChartID')).highcharts().series[0].addIndicator('mom', options);

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
                width : 120
            });

            if (typeof _callback == "function") {
                _callback(containerIDWithHash);
            }

        });

    }

    return {

        open: function (containerIDWithHash) {

            if ($(".mom").length == 0) {
                init(containerIDWithHash, this.open);
                return;
            }

            $(".mom").data('refererChartID', containerIDWithHash).dialog("open");

        }

    };

});
