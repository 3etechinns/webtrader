/*
 * Created by amin on July 16, 2016.
 */

define(['jquery', 'websockets/binary_websockets', 'windows/windows', 'common/rivetsExtra', 'lodash', 'moment'], function($, liveapi, windows, rv, _, moment) {
    require(['text!cashier/withdraw.html']);
    require(['css!cashier/withdraw.css']);

    let win = null;
    let win_view = null;

    let error_handler = err => {
      console.error(err);
      $.growl.error({ message: err.message });
    };

    class Withdraw {
      init = li => {
        li.click(() => {
            if(!win)
              require(['text!cashier/withdraw.html'], this._init_win);
            else
              win.moveToTop();
        });
      }

      _init_win = root => {
        root = $(root);
        win = windows.createBlankWindow(root, {
            title: 'Withdraw funds',
            resizable: true,
            collapsable: false,
            minimizable: true,
            maximizable: true,
            width: 700,
            height: 400,
            'data-authorized': true,
            close: () => {
              win.dialog('destroy');
              win.trigger('dialogclose'); // TODO: figure out why event is not fired.
              win.remove();
              win = null;
            },
            open: () => { },
            destroy: () => {
              win_view && win_view.unbind();
              win_view = null;
            }
        });

        this._init_state(root);
        win.dialog('open');

        /* update dialog position, this way when dialog is resized it will not move*/
        var offset = win.dialog('widget').offset();
        offset.top = 110;
        win.dialog("option", "position", { my: offset.left, at: offset.top });
        win.dialog('widget').css({
            left: offset.left + 'px',
            top: offset.top + 'px'
        });
        win.fixFooterPosition();
        win.track({
          module_id: 'withdraw',
          is_unique: true
        });
      };

      _init_state = root => {
        var state = {
          route: { value: 'menu'},
          empty_fields: {
            validate: false,
            clear: _.debounce(() => ( state.empty_fields.validate = false ), 4000),
            show: () => {
              state.empty_fields.validate = true;
              state.empty_fields.clear();
            }
          },
          menu: {
            choice: ''
          },
        };
        let {route, menu} = state;

        let routes = { menu : 400, transfer: 400, standard: 400, agent: 400, verify: 400 };
        route.update = r => {
          route.value = r;
          win.dialog('option', 'height', routes[r]);
        };

        menu.button_click = choice => { /* choice is 'transfer', 'agent' or 'standard' */
          menu.choice = choice;
          route.update(choice !== 'transfer' ? 'verify' : 'transfer');
          if(choice === 'transfer')
            return;
          const email = local_storage.get('authorize').email;
          const type = choice === 'agent' ? 'paymentagent_withdraw' : 'payment_withdraw';
          liveapi.send({
            verify_email: email,
            type: type
          })
          .then(() => $.growl.notice({ message: 'Verification code sent to '.i18n() + email }))
          .catch(err => {
            error_handler(err);
            route.update('menu');
          });
        };

        win_view = rv.bind(root[0], state);
      };
    };

    return new Withdraw();
});
