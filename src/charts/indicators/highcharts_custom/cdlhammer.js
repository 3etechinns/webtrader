﻿/**
 * Created by Mahboob.M on 12/29/15
 */
define(['indicator_base', 'highstock'], function (indicatorBase) {

    var cdlhammerOptionsMap = {}, cdlhammerSeriesMap = {};

    function calculateIndicatorValue(data, index) {
        var candleOne_Index = index;

        var candleOne_Open = indicatorBase.extractPriceForAppliedTO(indicatorBase.OPEN, data, candleOne_Index),
			candleOne_Close = indicatorBase.extractPriceForAppliedTO(indicatorBase.CLOSE, data, candleOne_Index),
            candleOne_Low = indicatorBase.extractPriceForAppliedTO(indicatorBase.LOW, data, candleOne_Index),
			candleOne_High = indicatorBase.extractPriceForAppliedTO(indicatorBase.HIGH, data, candleOne_Index);

        var isCandleOne_Bullish = candleOne_Close > candleOne_Open,
			isCandleOne_Bearish = candleOne_Close < candleOne_Open;

        var realBodySize = Math.abs(candleOne_Close - candleOne_Open);
        var candleSize = Math.abs(candleOne_Low - candleOne_High);
        var lowerShadow = isCandleOne_Bullish ? Math.abs(candleOne_Low - candleOne_Open) : Math.abs(candleOne_Low - candleOne_Close);
        var higherShadow = isCandleOne_Bullish ? Math.abs(candleOne_High - candleOne_Close) : Math.abs(candleOne_High - candleOne_Open);

        var isBullishContinuation = realBodySize < (candleSize * 0.20) //the open, high, and close are roughly the same price. means it has a small body.
                                    && lowerShadow > (realBodySize * 2) //there is a long lower shadow, twice the length as the real body.
                                    && higherShadow < (realBodySize /2); //little or no upper Shadow
        //Hammer is bullish only
        var isBearishContinuation = false;
        return {
            isBullishContinuation: isBullishContinuation,
            isBearishContinuation: isBearishContinuation
        };
    }

    return {
        init: function () {

            (function (H, $, indicatorBase) {

                //Make sure that HighStocks have been loaded
                //If we already loaded this, ignore further execution
                if (!H || H.Series.prototype.addCDLHAMMER) return;

                H.Series.prototype.addCDLHAMMER = function (cdlhammerOptions) {

                    //Check for undefined
                    //Merge the options
                    var seriesID = this.options.id;
                    cdlhammerOptions = $.extend({
                        parentSeriesID: seriesID
                    }, cdlhammerOptions);

                    var uniqueID = '_' + new Date().getTime();

                    //If this series has data, add CDLHAMMER series to the chart
                    var data = this.options.data || [];
                    if (data && data.length > 0) {

                        //Calculate CDLHAMMER data
                        /*
                         * Formula(OHLC or Candlestick) -
                         */
                        var cdlhammerData = [];
                        for (var index = 2 ; index < data.length; index++) {

                            //Calculate CDLHAMMER - start
                            var bull_bear = calculateIndicatorValue(data, index);
                            //Hammer is bullish only
                            if (bull_bear.isBullishContinuation) {
                                cdlhammerData.push({
                                    x: data[index].x || data[index][0],
                                    title: '<span style="color : blue">H</span>',
                                    text: 'Hammer : Bull'
                                });
                            };
                        };

                        var chart = this.chart;

                        cdlhammerOptionsMap[uniqueID] = cdlhammerOptions;

                        var series = this;
                        cdlhammerSeriesMap[uniqueID] = chart.addSeries({
                            id: uniqueID,
                            name: 'CDLHAMMER',
                            data: cdlhammerData,
                            type: 'flags',
                            onSeries: seriesID,
                            shape: 'flag',
                            turboThreshold: 0
                        }, false, false);

                        $(cdlhammerSeriesMap[uniqueID]).data({
                            isIndicator: true,
                            indicatorID: 'cdlhammer',
                            parentSeriesID: cdlhammerOptions.parentSeriesID
                        });

                        //We are update everything in one shot
                        chart.redraw();

                    }

                    return uniqueID;

                };

                H.Series.prototype.removeCDLHAMMER = function (uniqueID) {
                    var chart = this.chart;
                    cdlhammerOptionsMap[uniqueID] = null;
                    chart.get(uniqueID).remove(false);
                    cdlhammerSeriesMap[uniqueID] = null;
                    //Recalculate the heights and position of yAxes
                    chart.redraw();
                };

                H.Series.prototype.preRemovalCheckCDLHAMMER = function (uniqueID) {
                    return {
                        isMainIndicator: true,
                        isValidUniqueID: cdlhammerOptionsMap[uniqueID] != null
                    };
                };

                /*
                 *  Wrap HC's Series.addPoint
                 */
                H.wrap(H.Series.prototype, 'addPoint', function (pcdlhammereed, options, redraw, shift, animation) {

                    pcdlhammereed.call(this, options, redraw, shift, animation);
                    if (indicatorBase.checkCurrentSeriesHasIndicator(cdlhammerOptionsMap, this.options.id)) {
                        updateCDLHAMMERSeries.call(this, options[0]);
                    }

                });

                /*
                 *  Wrap HC's Point.update
                 */
                H.wrap(H.Point.prototype, 'update', function (pcdlhammereed, options, redraw, animation) {

                    pcdlhammereed.call(this, options, redraw, animation);
                    if (indicatorBase.checkCurrentSeriesHasIndicator(cdlhammerOptionsMap, this.series.options.id)) {
                        updateCDLHAMMERSeries.call(this.series, this.x, true);
                    }

                });


                /**
                 * This function should be called in the context of series object
                 * @param time - The data update values
                 * @param isPointUpdate - true if the update call is from Point.update, false for Series.update call
                 */
                function updateCDLHAMMERSeries(time, isPointUpdate) {
                    var series = this;
                    var chart = series.chart;

                    //Add a new CDLHAMMER data point
                    for (var key in cdlhammerSeriesMap) {
                        if (cdlhammerSeriesMap[key] && cdlhammerSeriesMap[key].options && cdlhammerSeriesMap[key].options.data && cdlhammerSeriesMap[key].options.data.length > 0
                            && cdlhammerOptionsMap[key].parentSeriesID == series.options.id) {
                            //This is CDLHAMMER series. Add one more CDLHAMMER point
                            //Calculate CDLHAMMER data
                            //Find the data point
                            var data = series.options.data;
                            var dataPointIndex = indicatorBase.findIndexInDataForTime(data, time);
                            if (dataPointIndex >= 1) {

                                //Calculate CDLHAMMER - start
                                var bull_bear = calculateIndicatorValue(data, dataPointIndex);
                                //Calculate CDLHAMMER - end
                                var bullBearData = null;
                                //Hammer is bullish only
                                if (bull_bear.isBullishContinuation) {
                                    bullBearData = {
                                        x: data[dataPointIndex].x || data[dataPointIndex][0],
                                        title: '<span style="color : blue">H</span>',
                                        text: 'Hammer : Bull'
                                    }
                                };

                                var whereToUpdate = -1;
                                for (var sIndx = cdlhammerSeriesMap[key].data.length - 1; sIndx >= 0 ; sIndx--) {
                                    if ((cdlhammerSeriesMap[key].data[sIndx].x || cdlhammerSeriesMap[key].data[sIndx][0]) == (data[dataPointIndex].x || data[dataPointIndex][0])) {
                                        whereToUpdate = sIndx;
                                        break;
                                    }
                                }
                                if (bullBearData) {
                                    if (isPointUpdate) {
                                        if (whereToUpdate >= 0) {
                                            cdlhammerSeriesMap[key].data[whereToUpdate].remove();
                                        }
                                    }
                                    cdlhammerSeriesMap[key].addPoint(bullBearData);
                                } else {
                                    if (whereToUpdate >= 0) {
                                        cdlhammerSeriesMap[key].data[whereToUpdate].remove();
                                    }
                                }
                            }
                        }
                    }
                }

            })(Highcharts, jQuery, indicatorBase);

        }
    }

});
