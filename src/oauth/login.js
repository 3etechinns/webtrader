/*
 * Created by amin on May 1, 2016.
 */

define(['websockets/binary_websockets', 'windows/windows', 'common/rivetsExtra', 'lodash'], function(liveapi, windows, rv, _) {
    require(['text!oauth/login.html']);
    require(['text!oauth/app_id.json']);
    require(['css!oauth/login.css']);
    var login_win = null;
    var login_win_view = null; // rivets view

    function init() {
      if(login_win){
        login_win.moveToTop();
        return;
      }

      require(['text!oauth/login.html', 'text!oauth/app_id.json'], function(root, app_id) {
        app_id = JSON.parse(app_id);
        root = $(root);
        login_win = windows.createBlankWindow(root, {
            title: 'Log in',
            resizable:false,
            collapsable:false,
            minimizable: false,
            maximizable: false,
            width: 408,
            height: 150,
            close: function () {
              login_win.dialog('destroy');
              login_win.remove();
              login_win = null;
            },
            open: function () { },
            destroy: function() {
              login_win_view && login_win_view.unbind();
              login_win_view = null;
            }
        });
        login_win.parent().css('overflow', 'visible');
        init_state(root, app_id.beta); // TODO: figure out if we are on main site
        login_win.dialog('open');

        /* update dialog position, this way when dialog is resized it will not move*/
        var offset = login_win.dialog('widget').offset();
        offset.top = 40;
        login_win.dialog("option", "position", { my: offset.left, at: offset.top });
        login_win.dialog('widget').css({
            left: offset.left + 'px',
            top: offset.top + 'px'
        });
      });
    }

    function init_state(root, app_id) {
      var state = {
        route: { value: 'login' },
        login: { disabled: false },
        registeration: {
          email: '',
          disabled: false,
          validate: { value: false },
          email_show_explanation: function() {
            var email = state.registeration.email;
            return (email === '' && !state.registeration.validate.value) || validateEmail(email);
          },
        },
        account: {
          empty_fields: {
            validate: false,
            clear: _.debounce(function() {
              state.account.empty_fields.validate = false;
            }, 2000),
            show: function() {
              state.account.empty_fields.validate = true;
              state.account.empty_fields.clear();
            }
          },
          email_show_explanation: function() {
            var email = state.account.email;
            return (email === '' && !state.account.empty_fields.validate) || validateEmail(email);
          },
          password_error_message: function() {
            var password = state.account.password;
            if(password === '') return state.account.empty_fields.validate ? '* Please enter your password' : '';
            if(password.length < 6) return '* Password must be 6 characters minimum';
            if(!/\d/.test(password) || !/[a-z]/.test(password) || !/[A-Z]/.test(password)) return '* Password must contain lower and uppercase letters with numbers';
            return '';
          },
          email: '',
          verification: '',
          password: '',
          repeat_password:  '',
          residence: 'my',
          residence_list: [ { text: 'Malaysia', value: 'my'}],
          disabled: false, /* is button disabled */
        }
      };

      state.login.login = function() {
          state.login.disabled = true;
          window.location = 'https://www.binary.com/oauth2/authorize?app_id=' + app_id + '&scope=read,trade,payments,admin';
      }

      state.route.update = function(route){
        var routes = {
          login: {
            title: 'Log in',
            height: 150
          },
          registeration: {
            title: 'Registeration',
            height: 180,
          },
          account: {
            title: 'Account opening',
            height: 470
          },
          confirm: {
            title: 'Confirm',
            height: 400
          },
          welcome: {
            title: 'Welcome',
            height: 400
          }
        };
        state.route.value = route;
        var title = routes[route].title;
        var height = routes[route].height;
        login_win.dialog('option', 'title', title);
        login_win.dialog('option', 'height', height);
      };

      state.registeration.validate.clear = _.debounce(function(){
        state.registeration.validate.value = false;
      }, 2000);

      state.registeration.validate.show = function() {
        state.registeration.validate.value = true;
        state.registeration.validate.clear();
      }

      /* { verify_email: 'emial' } step */
      state.registeration.create = function() {
        var email = state.registeration.email;
        if(email == '' || !validateEmail(email)) {
          state.registeration.validate.show();
          return;
        }

        state.registeration.disabled = true;
        liveapi.send({verify_email: email, type: 'account_opening'})
                .then(function(data) {
                  state.registeration.disabled = false;
                  if(data.verify_email) {
                    $.growl.notice({ message: 'Verification code sent to ' + email });
                    state.route.update('account');
                  }
                  else  {
                    throw { message: 'Email verification failed (' + data.msg_type + ')' };
                  }
                })
                .catch(function(err) {
                  console.error(err);
                  $.growl.error({ message: err.message });
                  state.registeration.disabled = false;
                });
      }

      /* { new_account_virtual: 1 } step */
      state.account.open = function() {
        state.account.empty_fields.show();
        var email = state.account.email,
            verification = state.account.verification,
            password = state.account.password,
            repeat_password = state.account.repeat_password,
            residence = state.account.residence;
        var ok = validateEmail(email) && verification !== '' && password === repeat_password && password.length >= 6;
        ok = ok && /\d/.test(password) && /[a-z]/.test(password) && /[A-Z]/.test(password)  && residence.length === 2;

        if(!ok) { return; }

        var request = {
          new_account_virtual: 1,
          verification_code: verification,
          client_password: password,
          residence: residence,
          // affilate_token: '???'
        };
        state.account.disabled = true;
        liveapi.send(request)
               .then(function(data) {
                  console.warn(data);
                  state.account.disabled = false;
               })
               .catch(function(err){
                  console.error(err);
                  $.growl.error({ message: err.message });
                  state.account.disabled = false;
               });
      }

      login_win_view = rv.bind(root[0], state);

      liveapi.cached.send({residence_list: 1})
             .then(function(data) {
               console.warn(data);
               state.account.residence_list = data.residence_list;
               state.account.residence = data.residence_list[0].value;
               _.defer(function() { state.account.residence = 'us' }, 0);
             })
             .catch(function(err){
                console.error(err);
                $.growl.error({ message: err.message });
             });
    }

    return {
      init: init
    }
});
