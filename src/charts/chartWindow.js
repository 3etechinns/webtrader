/**
 * Created by arnab on 2/13/15.
 */

define(["jquery","jquery.dialogextend"], function ($) {

    "use strict";

    var chartDialogCounter = 0;

    function _trigger_Resize_Effects() {
        //console.log($(this).width() - 10);
        $(this).find(".chartSubContainer").width($(this).width() - 30);
        $(this).find(".chartSubContainer").height($(this).height() - 10);

        //$(window).resize();
        var containerIDWithHash = "#" + $(this).find(".chartSubContainer").attr("id");
        require(["charts/charts"], function(charts) {
            charts.triggerReflow(containerIDWithHash);
        });

    }

    /* events that this module will fire */
    var events = {
        onCreate: $.Callbacks(),  // on new chart created
        onRemove: $.Callbacks()   // on chart removed
    }
    return {

        createBlankWindow: function(title,options,callback){
            $.get("charts/chartWindow.html", function ($html) {
                $html = $($html);
                var id = "chart-dialog-" + ++chartDialogCounter;

                options = $.extend({
                    autoOpen: false,
                    resizable: true,
                    minWidth: 350,
                    minHeight: 400,
                    width: 350,
                    height: 400,
                    my: 'center',
                    at: 'center',
                    of: window,
                    title: title,
                    close: function () { },
                    resize: _trigger_Resize_Effects
                }, options || {});

                var blankWindow = $html.attr("id", id)
                    .dialog(options)
                    .dialogExtend({
                        "maximize": _trigger_Resize_Effects,
                        "restore": _trigger_Resize_Effects,
                        "minimize": _trigger_Resize_Effects,
                        "resize": _trigger_Resize_Effects
                    })
                    .find('div.chartSubContainerHeader').attr('id', id + "_header").end()
                    .find('div.chartSubContainer').attr('id', id + "_body").end(); // NOTE: changed 'id_chart' to 'id_body'

                blankWindow.on('dialogclose', events.onRemove.fire.bind(null, title, blankWindow)); // trigger the corresponding event
                events.onCreate.fire(title,blankWindow); // trigger new chart created event
                
                blankWindow.dialog('open');
                _trigger_Resize_Effects.call(blankWindow);
                if (callback)
                    callback(blankWindow);
            })
        },

        addNewWindow: function( instrumentCode, instrumentName, timePeriod, _callback, type ) {

            //first add a new li
            var newTabId = "chart-dialog-" + ++chartDialogCounter;
            //console.log(newTabId)
            $.get("charts/chartWindow.html" , function( $html ) {

                var title = instrumentName + " (" + timePeriod + ")";
                $html = $($html);
                var newWindow = $html.attr("id", newTabId)
                    .dialog({
                        autoOpen: false,
                        resizable: true,
                        minWidth: 335,
                        minHeight: 400,
                        width: 335,
                        height: 400,
                        my: 'center',
                        at: 'center',
                        of: window,
                        title: title,
                        close : function() {
                            //console.log('Destroying dialog ' + newTabId);
                            var containerIDWithHash = "#" + newTabId + "_chart";
                            var timeperiod = $(containerIDWithHash).data("timeperiod");
                            var instrumentCode = $(containerIDWithHash).data('instrumentCode');
                            $(this).dialog('destroy');//completely remove this dialog
                            require(["charts/charts"], function (charts) {
                                charts.destroy( "#" + newTabId + "_chart", timeperiod, instrumentCode );
                            });
                        },
                        resize: _trigger_Resize_Effects
                    })
                    .dialogExtend({
                        "maximize": _trigger_Resize_Effects,
                        "restore": _trigger_Resize_Effects,
                        "minimize": _trigger_Resize_Effects,
                        "resize": _trigger_Resize_Effects
                    })
                    .find('div.chartSubContainerHeader').attr('id', newTabId + "_header").end()
                    .find('div.chartSubContainer').attr('id', newTabId + "_chart").end()
                    ;

                newWindow.on('dialogclose', events.onRemove.fire.bind(null, title, newWindow)); // trigger the corresponding event
                events.onCreate.fire(title,newWindow); // trigger new chart created event

                require(["charts/chartOptions"], function(chartOptions) {
                    chartOptions.init(newTabId, timePeriod, type);
                });

                $('#' + newTabId).dialog( 'open' );
                _trigger_Resize_Effects.call($('#' + newTabId));

                require(["charts/charts"], function (charts) {
                    charts.drawChart( "#" + newTabId + "_chart", instrumentCode, instrumentName, timePeriod, type );
                });

                if ( _callback )
                _callback( $('#' + newTabId) );

            });

        },

        totalWindows : function() {
            return $("div.chart-dialog").length;
        },

        /**
         * @param callerContext - Should be the Jquery object for dialog
         */
        triggerResizeEffects : function( callerContext ) {
            _trigger_Resize_Effects.call( callerContext );
        },

        events: events
    };

});
