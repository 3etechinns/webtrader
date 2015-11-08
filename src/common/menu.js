﻿/**
 * Created by amin on October 30, 2015.
 */

define(['jquery', 'navigation/navigation', 'common/util'], function ($, navigation) {
    'use strict';

    function sortMarkets(markets) {
        var sort_fn = sortAlphaNum('display_name');
        //Sort market
        if($.isArray(markets)) {
            markets.sort(sort_fn);
            markets.forEach(function (market) {
                if($.isArray(market.submarkets)) {
                    // Sort sub-markets
                    market.submarkets.sort(sort_fn);
                    market.submarkets.forEach(function (submarket) {
                        if($.isArray(submarket.instruments)) {
                            // Sort instruments
                            submarket.instruments.sort(sort_fn);
                        }
                    });
                }
            });
        }
    }

    /* recursively creates menu into root element, set on_click to register menu item clicks */
    function refreshMenu( root, data , on_click) {

        data.forEach(function (value) {
            var isDropdownMenu = value.submarkets || value.instruments;
            var caretHtml = "<span class='nav-submenu-caret'></span>";
            var menuLinkHtml = isDropdownMenu ? value.display_name + caretHtml : value.display_name;
            var $menuLink = $("<a href='#'>" + menuLinkHtml + "</a>");
            if(isDropdownMenu) {
                $menuLink.addClass("nav-dropdown-toggle");
            }

            var newLI = $("<li>").append($menuLink)
                                .data("symbol", value.symbol)//TODO This is invalid for root level object
                                .data("delay_amount", value.delay_amount)//TODO This is invalid for root level object
                                .appendTo( root);

            if (isDropdownMenu) {
                var newUL = $("<ul>");
                newUL.appendTo(newLI);
                refreshMenu( newUL, value.submarkets || value.instruments, on_click );
            }
            else if(on_click )
                $menuLink.click(function () {
                    /* pass the <li> not the <a> tag */
                    var li = $(this).parent();
                    on_click(li);
                });
        });

        navigation.updateDropdownToggles();
    }

    return {
        /* you can filter the symbols with the options parameter, for example:
            options: {
                filter: function(sym) { return sym.feed_license !== 'realtime'; }
            }
        }*/
        extractMenu: function (trading_times_data, options) {
            var markets = trading_times_data.trading_times.markets.map(function (m) {
                var market = {
                    name: m.name,
                    display_name: m.name
                };
                market.submarkets = m.submarkets.map(function (sm) {
                    var submarket = {
                        name: sm.name,
                        display_name: sm.name
                    };
                    var symbols = sm.symbols;
                    if (options && options.filter) /* filter the symbols */
                        symbols = symbols.filter(options.filter);
                     submarket.instruments = symbols.map(function (sym) {
                        return {
                            symbol: sym.symbol,
                            display_name: sym.name,
                            delay_amount: sym.delay_amount || 0,
                            events: sym.events,
                            times: sym.times,
                            settlement: sym.settlement,
                            feed_license: sym.feed_license || 'realtime'
                        };
                    });
                    return submarket;
                });
                return market;
            });

            return markets;
        },

        sortMenu: sortMarkets,
        refreshMenu: refreshMenu
    }
});
