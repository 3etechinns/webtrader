﻿/**
 * Created by amin on October 30, 2015.
 */
define(["jquery",  "websockets/binary_websockets", "common/menu", "jquery-growl"], function ($, liveapi, menu) {

    liveapi
        .cached.send({ trading_times: new Date().toISOString().slice(0, 10) })
        .then(function (data) {

            markets = menu.extractMenu(data);
            markets = menu.sortMenu(markets);

            var root = $("<ul>").appendTo($("#nav-menu").find(".trade")); /* add to trade menu */
            menu.refreshMenu(root, markets, function (li) {
                console.warn(li);
            });
        })
        .catch(function (err) {
            $.growl.error({ message: err.message });
            console.error(err);
        });

    return {};
});
