define(['jquery', "websockets/binary_websockets", 'navigation/menu', 'lodash', 'common/util', 'affiliates/touch-device-fix'], function( $, liveapi, menu, _ ) {
	//showOptions- used to hide/show share and comparison in chart options
	var init_chart_options = function (dialog, timePeriod, type, instrumentName, instrumentCode, showOptions){
			var id = dialog.attr('id');
			/* initialize chartOptions & table-view once chart is rendered */
			require(["charts/chartOptions", "charts/tableView"], function (chartOptions, tableView) {
				var table_view = tableView.init(dialog);
				chartOptions.init(id, timePeriod, type, table_view.show, instrumentName, instrumentCode, showOptions);
			});
	};

	//This fixed the chartX error. Should be removed with file touch-device-fix.
	fixTouchEvent();

	Highcharts.setOptions(
		{
			global: {
            	timezoneOffset: getLang() == 'ja' ? -9 * 60 : 0 // Converting chart time to JST.
        	},
			plotOptions: {
				candlestick: {
					lineColor: 'rgba(0,0,0,1)',
					color: 'rgba(215,24,24,1)',
					upColor: 'rgba(2,146,14,1)',
					upLineColor: 'rgba(0,0,0,1)'
				}
			}
		});

	return {
		init: function() {
			/* when we are on affiliates route we need to disable overflow-x */
			$('body').addClass('affiliates');

			// get chart window html.
	        require(['text!charts/chartWindow.html'], function(html) {
	            var newTabId = "webtrader-dialog-1",
	                timePeriod = getParameterByName('timePeriod') || '1d',
	                type = timePeriod == '1t' ? 'line' : 'candlestick';

	            var $html = $(html);
	            $html.attr("id", newTabId)
	                .find('div.chartSubContainerHeader').attr('id', newTabId + "_header").end()
	                .find('div.chartSubContainer').attr('id', newTabId + "_chart").end();

        		// load market information (instruments) from API.
				//Trigger async loading of instruments and trade menu and refresh
				require(["instruments/instruments", "jquery-growl"], function (instruments) {
					instruments
						.init()
						.then(function(_instrumentJSON) {
							if (!$.isEmptyObject(_instrumentJSON)) {
								var instrumentCode = getParameterByName('instrument');
								var instrumentObject = getObjects(_instrumentJSON, 'symbol', instrumentCode);
								if (instrumentObject && instrumentObject.length > 0 && instrumentObject[0].symbol && instrumentObject[0].display_name) {
									// validate the parameters here.
									if (validateParameters()) {
										var instrumentCode = instrumentObject[0].symbol;
										var instrumentName = instrumentObject[0].display_name;
										var delayAmount = instrumentObject[0].delay_amount || 0;
										var showOptions = !(getParameterByName("hideOptions").toLowerCase() == 'true');
										//Render in normal way
										require(["charts/charts", "charts/chartWindow"], function(charts, chartWindow) {
											var options = {
												instrumentCode : instrumentCode,
												instrumentName : instrumentName,
												timePeriod : timePeriod,
												type : type,
												delayAmount : delayAmount,
												name: newTabId
											};
											chartWindow.add_chart_options(newTabId, options);
											charts.drawChart("#" + newTabId + "_chart", {
												instrumentCode : instrumentCode,
												instrumentName : instrumentName,
												timePeriod : timePeriod,
												type : type,
												delayAmount : delayAmount
											});
											init_chart_options($html, timePeriod, type, instrumentName, instrumentCode, showOptions);
											_.defer(function() {
												charts.triggerReflow("#" + newTabId + "_chart");
											});
										});

									} else {
										require(["jquery", "jquery-growl"], function($) {
											$.growl.error({
												message: "Invalid parameter(s)!"
											});
										});
										$html.find('div.chartSubContainerHeader').hide();
									}
								} else {
									require(["jquery", "jquery-growl"], function($) {
										$.growl.error({
											message: "Instrument Code Unknown/Unavailable!"
										});
									});
									$html.find('div.chartSubContainerHeader').hide();
								}
							}
						})
						.catch(function (e) {
							require(["jquery", "jquery-growl"], function($) {
								$.growl.error({
									message: "Error getting market information!"
								});
							});
							$html.find('div.chartSubContainerHeader').hide();
						});
				});

	            $(".mainContainer").append($html);
				$('#' + newTabId + " .chartSubContainer").height($(window).height() - 50).width($(window).width());
				$('#' + newTabId + " .table-view").width($(window).width());
	            $(window).resize(function() {
					$('#' + newTabId + " .chartSubContainer").height($(window).height() - 50).width($(window).width());
					$('#' + newTabId + " .table-view").width($(window).width());
	            });

	        });
		}
	};
});
