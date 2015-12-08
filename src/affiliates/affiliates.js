define(['jquery', "websockets/binary_websockets", 'common/menu', 'common/util'], function( $, liveapi, menu ) {
	return {
		init: function() {
			// get chart window html.
	        require(['text!charts/chartWindow.html'], function(html) {
	            var newTabId = "webtrader-dialog-1",
	                timePeriod = getParameterByName('timePeriod') || '1d',
	                type = timePeriod == '1t' ? 'line' : 'candlestick';

	            var $html = $(html);
	            $html.attr("id", newTabId)
	                .find('div.chartSubContainerHeader').attr('id', newTabId + "_header").end()
	                .find('div.chartSubContainer').attr('id', newTabId + "_chart").end();

	            require(["charts/chartOptions"], function(chartOptions) {
	                chartOptions.init(newTabId, timePeriod, type);
	            });

	            // load market information (instruments) from API.
	            liveapi
	              .cached.send({ trading_times: new Date().toISOString().slice(0, 10) })
	              .then(function (_instrumentJSON) {
                    
                    _instrumentJSON = menu.extractChartableMarkets(_instrumentJSON);
	                if (!$.isEmptyObject(_instrumentJSON)) {
	                    var instrumentCode = getParameterByName('instrument');
	                    var instrumentObject = getObjects(_instrumentJSON, 'symbol', instrumentCode);
	                    if (instrumentObject && instrumentObject.length > 0 && instrumentObject[0].symbol && instrumentObject[0].display_name) {
	                        // validate the parameters here.
	                        if (validateParameters()) {
	                            var instrumentCode = instrumentObject[0].symbol;
	                            var instrumentName = instrumentObject[0].display_name;
								var delayAmount = instrumentObject[0].delay_amount || 0;

								/**
								 * Additional requirements to render tick charts ONLY when following parameters are passed
								 * 	startTime - optional
								 * 	endTime - mandatory
								 * 	entrySpotTime - mandatory
								 * 	barrierPrice - mandatory
								 */
								var startTime = getParameterByName('startTime');
								var endTime = getParameterByName('endTime');
								var entrySpotTime = getParameterByName('entrySpotTime');
								var barrierPrice = getParameterByName('barrierPrice');
								if (endTime && entrySpotTime && barrierPrice) {

									if (delayAmount > 0) {
										$.growl.error({
											message: "Delayed instruments cannot be rendered!"
										});
									} else if (timePeriod.toUpperCase() !== '1T') {
										$.growl.error({
											message: "Only tick charts are supported in this route!"
										});
									} else {
										require(["charts/charts"], function(charts) {
											charts.drawChart("#" + newTabId + "_chart", {
												instrumentCode : instrumentCode,
												instrumentName : instrumentName,
												timePeriod : timePeriod,
												type : type,
												delayAmount : delayAmount
											});
										});
									}

								} else {

									//Render in normal way
									require(["charts/charts"], function(charts) {
										charts.drawChart("#" + newTabId + "_chart", {
											instrumentCode : instrumentCode,
											instrumentName : instrumentName,
											timePeriod : timePeriod,
											type : type,
											delayAmount : delayAmount
										});
									});

								}

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

	            $(".mainContainer").append($html);
	            resizeElement('#' + newTabId);
	            resizeElement('#' + newTabId + " .chartSubContainer");
	            $(window).resize(function() {
	                resizeElement('#' + newTabId);
	                resizeElement('#' + newTabId + " .chartSubContainer");
	            });

	        });
		}
	};
});