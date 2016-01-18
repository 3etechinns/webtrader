﻿/**
 * Created by amin on October 29, 2015.
 */
define(["jquery", "windows/windows", "websockets/binary_websockets", "lodash", "datatables", "jquery-growl", 'common/util'],
    function ($, windows, liveapi, _) {
    'use strict';

    var profitWin = null,
        table = null,
        datepicker = null;

    function init($menuLink) {
        require(["css!profittable/profitTable.css"]);
        require(['text!profittable/profitTable.html']); // Don't wait for liveapi to finish, trigger loading .html file now.
        $menuLink.click(function () {
            if (!profitWin)
                liveapi.cached.authorize()
                    .then(initProfitWin)
                    .catch(function (err) {
                        console.error(err);
                    });
            else
                profitWin.moveToTop();
        });
    }

    var refreshTable = function (yyyy_mm_dd) {
        var processing_msg = $('#' + table.attr('id') + '_processing').css('top','200px').show();

        var request = {
            profit_table: 1,
            description: 1,
            sort: 'DESC'
        };

        /* if a date is specified get the transactions for that date */
        if (yyyy_mm_dd)
            request.date_from = request.date_to = yyyy_mm_dd;
        else /* otherwise get the most recent 50 transactions */
            request.limit = 50;

        /* refresh the table with result of { profit_table:1 } from WS */
        var refresh = function (data) {
            var transactions = (data.profit_table && data.profit_table.transactions) || [];
            var rows = transactions.map(function (trans) {
                var profit = (parseFloat(trans.sell_price) - parseFloat(trans.buy_price)).toFixed(2); /* 2 decimal points */
                var svg = profit > 0 ? 'up' : profit < 0 ? 'down' : 'equal';
                var img = '<img class="arrow" src="images/' + svg + '-arrow.svg"/>';
                return [
                    epoch_to_string(trans.purchase_time, { utc: true }),
                    trans.transaction_id,
                    img + trans.longcode,
                    trans.buy_price,
                    epoch_to_string(trans.sell_time, { utc: true }),
                    trans.sell_price,
                    profit,
                    trans, /* we will use it when handling arrow clicks to show view transaction dialog */
                ];
            });
            table.api().rows().remove();
            table.api().rows.add(rows);
            table.api().draw();
            processing_msg.hide();
        };

        liveapi.send(request)
        .then(refresh)
        .catch(function (err) {
            refresh({});
            $.growl.error({ message: err.message });
            console.error(err);
        });
    }

    var on_arrow_click = function(e){
      if(e.target.tagName !== 'IMG')
        return;
      var tr = e.target.parentElement.parentElement;
      var transaction = table.api().row(tr).data();
      transaction = _.last(transaction);
      require(['viewtransaction/viewTransaction'], function(viewTransaction){

          /* TODO: remove this hack when backend provided symbol */
          var splits = transaction.shortcode.split('_');
          var symbol = splits[1] !== 'R' ? splits[1] : 'R_' + splits[2];

          /* TODO: remove this hack when backend provided duration */
          var longcode = transaction.longcode.split(' ');
          var duration_type = ['ticks', 'ticks.', 'seconds', 'minutes', 'hours', 'days'].filter(function(t){ return _.includes(longcode, t) })[0];
          var duration = longcode[longcode.indexOf(duration_type) - 1];

          viewTransaction.init({
              duration: duration,
              duration_type: duration_type,
              symbol: symbol,
              contract_id: transaction.contract_id,
              longcode: transaction.longcode,
              sell_time: transaction.sell_time,
              purchase_time: transaction.purchase_time,
              buy_price: transaction.buy_price,
              sell_price: transaction.sell_price
          });
      })
    }

    function initProfitWin() {
        profitWin = windows.createBlankWindow($('<div/>'), {
            title: 'Profit Table',
            width: 750,
            minWidth:700,
            minHeight:90,
            destroy: function() { table && table.DataTable().destroy(true); },
            close: function() {  profitWin = null; },
            refresh: function() { datepicker.clear(); refreshTable(); },
            'data-authorized': 'true'
        });
        require(['text!profittable/profitTable.html'], function (html) {

            table = $(html);
            table.appendTo(profitWin);

            table = table.dataTable({
                data: [],
                "columnDefs": [ {
                    "targets": 6,
                    "createdCell": function (td, cellData) {
                        var css_class = (cellData < 0) ? 'red' : (cellData > 0) ? 'green' : 'bold';
                        if (css_class)
                            $(td).addClass(css_class);
                    }
                }],
                paging: false,
                ordering: false,
                searching: true,
                processing: true
            });
            table.parent().addClass('hide-search-input');

            // Apply the a search on each column input change
            table.api().columns().every(function () {
                var column = this;
                $('input', this.header()).on('keyup change', function () {
                    if (column.search() !== this.value)
                        column.search(this.value) .draw();
                });
            });

            refreshTable();
            datepicker = profitWin.addDateToHeader({
                title: 'Jump to: ',
                date: null, /* set date to null */
                changed: refreshTable,
                cleared: refreshTable
            });

            profitWin.dialog('open');
            profitWin.on('click', on_arrow_click);
        });
    }

    return {
        init: init
    }
});
