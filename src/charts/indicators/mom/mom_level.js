﻿/**
 * Created by Mahboob.M on 2/2/16.
 */

define(["jquery", "jquery-ui", 'color-picker', 'ddslick'], function ($) {

    var callBackAfterOKPressed = undefined;
    function closeDialog() {
        $(this).dialog("close");
        $(this).find("*").removeClass('ui-state-error');
    }

    function init( containerIDWithHash, _callback ) {

        var Level = function (level, stroke, strokeWidth, dashStyle) {
            this.level = level;
            this.stroke = stroke;
            this.strokeWidth = strokeWidth;
            this.dashStyle = dashStyle;
        };

        require(['text!charts/indicators/mom/mom_level.html'], function ( $html ) {

            var defaultStrokeColor = '#cd0a0a';

            $html = $($html);
            //$html.hide();
            $html.appendTo("body");
            $html.find("input[type='button']").button();

            $html.find("#mom_level_stroke").colorpicker({
                part:	{
                    map:		{ size: 128 },
                    bar:		{ size: 128 }
                },
                select:			function(event, color) {
                    $("#mom_level_stroke").css({
                        background: '#' + color.formatted
                    }).val('');
                    defaultStrokeColor = '#' + color.formatted;
                },
                ok:             			function(event, color) {
                    $("#mom_level_stroke").css({
                        background: '#' + color.formatted
                    }).val('');
                    defaultStrokeColor = '#' + color.formatted;
                }
            });

            var selectedDashStyle = "Solid";
            $('#mom_level_dashStyle').ddslick({
                imagePosition: "left",
                width: 118,
                background: "white",
                onSelected: function (data) {
                    $('#mom_level_dashStyle .dd-selected-image').css('max-width', '85px');
                    selectedDashStyle = data.selectedData.value
                }
            });
            $('#mom_level_dashStyle .dd-option-image').css('max-width', '85px');

            $html.dialog({
                autoOpen: false,
                resizable: false,
                width: 280,
                modal: true,
                my: 'center',
                at: 'center',
                of: window,
                dialogClass: 'mom-ui-dialog',
                buttons: [
                    {
                        text: "OK",
                        click: function() {

                            if (callBackAfterOKPressed) {
                                callBackAfterOKPressed([new Level(parseFloat($html.find(".mom_level_input_width_for_level").val()),
                                    defaultStrokeColor, parseInt($html.find("#mom_level_strokeWidth").val()),
                                    selectedDashStyle)]);
                            }

                            closeDialog.call($html);
                        }
                    },
                    {
                        text: "Cancel",
                        click: function() {
                            closeDialog.call(this);
                        }
                    }
                ]
            });
            $html.find('select').selectmenu();

            if ($.isFunction(_callback))
            {
                _callback( containerIDWithHash, callBackAfterOKPressed );
            }

        });

    }

    return {

        open : function ( containerIDWithHash, _callback ) {

            callBackAfterOKPressed = _callback;
            if ($(".mom_level").length == 0)
            {
                init( containerIDWithHash, this.open );
                return;
            }

            $(".mom_level").dialog( "open" );

        }

    };

});
