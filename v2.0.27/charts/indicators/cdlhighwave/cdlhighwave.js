define(["jquery","jquery-ui","color-picker"],function(a){function b(){a(this).dialog("close"),a(this).find("*").removeClass("ui-state-error")}function c(c,d){require(["text!charts/indicators/cdlhighwave/cdlhighwave.html"],function(e){e=a(e),e.appendTo("body"),e.dialog({autoOpen:!1,resizable:!1,width:350,modal:!0,my:"center",at:"center",of:window,buttons:[{text:"OK",click:function(){var c=a(a(".cdlhighwave").data("refererChartID")).highcharts().series[0];c.addIndicator("cdlhighwave",{cdlIndicatorCode:"cdlhighwave",onSeriesID:c.options.id}),b.call(e)}},{text:"Cancel",click:function(){b.call(this)}}]}),a.isFunction(d)&&d(c)})}return{open:function(b){return 0==a(".cdlhighwave").length?void c(b,this.open):void a(".cdlhighwave").data("refererChartID",b).dialog("open")}}});