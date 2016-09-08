/*
 * Created by amin on June 14, 2016.
 */

define(['jquery', 'websockets/binary_websockets', 'windows/windows', 'common/rivetsExtra', 'lodash', 'moment', 'text!navigation/countries.json'], function($, liveapi, windows, rv, _, moment, countries) {
    countries = JSON.parse(countries);
    require(['text!realaccount/realaccount.html']);
    require(['css!realaccount/realaccount.css']);
    var real_win = null;
    var real_win_view = null; // rivets view
    var real_win_li = null;

    var error_handler = function(err) {
      console.error(err);
      $.growl.error({ message: err.message });
    };

    function init(li) {
      real_win_li = li;
      li.click(function () {
          if(!real_win)
            require(['text!realaccount/realaccount.html'], init_real_win);
          else
            real_win.moveToTop();
      });
    }

    function init_real_win(root) {
      root = $(root).i18n();
      real_win = windows.createBlankWindow(root, {
          title: 'Real account opening'.i18n(),
          resizable:false,
          collapsable:false,
          minimizable: true,
          maximizable: false,
          width: 350,
          height: 930,
          close: function () {
            real_win.dialog('destroy');
            real_win.trigger('dialogclose'); // TODO: figure out why event is not fired.
            real_win.remove();
            real_win = null;
          },
          open: function () { },
          destroy: function() {
            real_win_view && real_win_view.unbind();
            real_win_view = null;
          }
      });

      init_state(root);
      real_win.dialog('open');

      /* update dialog position, this way when dialog is resized it will not move*/
      var offset = real_win.dialog('widget').offset();
      offset.top = 110;
      real_win.dialog("option", "position", { my: offset.left, at: offset.top });
      real_win.dialog('widget').css({
          left: offset.left + 'px',
          top: offset.top + 'px'
      });
      real_win.fixFooterPosition();
    }

    function init_state(root) {
      var app_id = liveapi.app_id;
      var state = {
        route: { value: 'user' }, // routes: ['user', 'financial']
        empty_fields: {
          validate: false,
          clear: _.debounce(function() {
            state.empty_fields.validate = false;
          }, 4000),
          show: function() {
            state.empty_fields.validate = true;
            state.empty_fields.clear();
          }
        },
        company: {
          type: 'normal', // could be one of ['normal', 'maltainvest']
          financial: undefined,
          gaming: undefined,
        },
        risk: {
          visible: false,
        },
        user: {
          disabled: false,
          salutation: 'Mr',
          salutation_array: ['Mr', 'Mrs', 'Ms', 'Miss'],
          first_name: '',
          last_name: '',
          date_of_birth: moment().format('YYYY-MM-DD'),
          yearRange: "-100:+0", showButtonPanel: false, // for jquery ui datepicker
          residence: '-',
          residence_name: '-',
          address_line_1: '',
          address_line_2: '',
          city_address: '',
          state_address: '-',
          state_address_array: [{text: '-', value: '-'}],
          address_postcode: '',
          phone: '',
          secret_question_inx: 5,
          secret_question_array: [
            'Mother\'s maiden name', 'Name of your pet', 'Name of first love',
            'Memorable town/city', 'Memorable date', 'Favourite dish',
            'Brand of first car', 'Favourite artist'
          ],
          secret_answer: '',
        },
        financial: {
          experience_array:  ['0-1 year', '1-2 years', 'Over 3 years'],
          frequency_array: ['0-5 transactions in the past 12 months', '6-10 transactions in the past 12 months', '40 transactions or more in the past 12 months'],

          forex_trading_experience: '',
          forex_trading_frequency: '',
          indices_trading_experience: '',
          indices_trading_frequency: '',
          commodities_trading_experience: '',
          commodities_trading_frequency: '',
          stocks_trading_experience: '',
          stocks_trading_frequency: '',
          other_derivatives_trading_experience: '',
          other_derivatives_trading_frequency: '',
          other_instruments_trading_experience: '',
          other_instruments_trading_frequency: '',

          employment_industry_array: ['Construction', 'Education', 'Finance', 'Health', 'Tourism', 'Other'],
          employment_industry: '',
          education_level_array: ['Primary', 'Secondary', 'Tertiary'],
          education_level: '',

          income_source_array: ['Salaried Employee', 'Self-Employed', 'Investments & Dividends', 'Pension', 'Other'],
          income_source: '',

          net_income_array: ['Less than $25,000', '$25,000 - $50,000', '$50,001 - $100,000', '$100,001 - $500,000', 'Over $500,000'],
          net_income: '',

          estimated_worth_array: ['Less than $100,000', '$100,000 - $250,000', '$250,001 - $500,000', '$500,001 - $1,000,000', 'Over $1,000,000'],
          estimated_worth: '',

          accepted: false,
          disabled: false
        }
      };

      state.user.is_valid = function() {
        var user = state.user;
        return user.first_name !== '' && user.last_name !== '' &&
          moment(user.date_of_birth, 'YYYY-MM-DD', true).isValid() &&
          user.residence !== '-' && user.address_line_1 !== '' &&
          user.city_address !== '' && /^[^+]{0,20}$/.test(user.address_postcode) &&
          user.phone !== '' && /^\+?[0-9\s]{6,35}$/.test(user.phone) &&
          /.{4,8}$/.test(user.secret_answer);
      };

      state.user.click = function() {
        if(!state.user.is_valid()) {
          state.empty_fields.show();
          return;
        }

        if(state.company.type === 'normal') {
          state.user.new_account_real();
          return;
        }

        state.route.update('financial');
      }
      state.user.new_account_real = function() {

        var user = state.user;
        var request = {
          new_account_real: 1,
          salutation: user.salutation,
          first_name: user.first_name,
          last_name: user.last_name,
          date_of_birth: user.date_of_birth,
          residence: user.residence,
          address_line_1: user.address_line_1,
          address_line_2: user.address_line_2 || undefined, // optional field
          address_city: user.city_address,
          address_state: user.state_address || undefined,
          address_postcode: user.address_postcode || undefined,
          phone: user.phone,
          secret_question: user.secret_question_array[user.secret_question_inx],
          secret_answer: user.secret_answer.replace('""', "'")
        };

        liveapi.send(request)
               .then(function(data){
                 state.user.disabled = true;
                 var info = data.new_account_real;
                 oauth = local_storage.get('oauth');
                 oauth.push({id: info.client_id, token: info.oauth_token, is_virtual: 0});
                 local_storage.set('oauth', oauth);
                 $.growl.notice({ message: 'Account successfully created' });
                 $.growl.notice({ message: 'Switching to your new account ...' });
                 /* login with the new account */
                 return liveapi.switch_account(info.client_id)
                               .then(function() {
                                 real_win.dialog('destroy');
                                 real_win_li.hide();
                               });
               })
               .catch(function(err){
                 state.user.disabled = false;
                 error_handler(err);
               });
      };

      state.financial.all_selected = function() {
        var financial = state.financial;
        return financial.forex_trading_experience !== '' &&
          financial.forex_trading_frequency !== '' &&
          financial.indices_trading_experience !== '' &&
          financial.indices_trading_frequency !== '' &&
          financial.commodities_trading_experience !== '' &&
          financial.commodities_trading_frequency !== '' &&
          financial.stocks_trading_experience !== '' &&
          financial.stocks_trading_frequency !== '' &&
          financial.other_derivatives_trading_experience !== '' &&
          financial.other_derivatives_trading_frequency !== '' &&
          financial.other_instruments_trading_experience !== '' &&
          financial.other_instruments_trading_frequency !== '' &&
          financial.employment_industry !== '' &&
          financial.education_level !== '' &&
          financial.income_source !== '' &&
          financial.net_income !== '' &&
          financial.estimated_worth !== '';
      };

      state.financial.click = function() {
        if(!state.financial.all_selected()) {
          state.empty_fields.show();
          $.growl.error({ message: 'Not all financial information are completed' });
          return;
        }
        if(!state.financial.accepted) {
          $.growl.error({ message: 'Binary.com terms and conditions unchecked.' });
          return;
        }

        state.risk.visible = true;
      };

      state.financial.create_request = function() {
        var user = state.user;
        var financial = state.financial;
        var request = {
          new_account_maltainvest: 1,
          salutation: user.salutation,
          first_name: user.first_name,
          last_name: user.last_name,
          date_of_birth: user.date_of_birth,
          residence: user.residence,
          address_line_1: user.address_line_1,
          address_line_2: user.address_line_2 || undefined, // optional field
          address_city: user.city_address,
          address_state: user.state_address || undefined,
          address_postcode: user.address_postcode || undefined,
          phone: user.phone,
          secret_question: user.secret_question_array[user.secret_question_inx],
          secret_answer: user.secret_answer.replace('""', "'"),

          affiliate_token: '',
          forex_trading_experience: financial.forex_trading_experience,
          forex_trading_frequency: financial.forex_trading_frequency,
          indices_trading_experience: financial.indices_trading_experience,
          indices_trading_frequency: financial.indices_trading_frequency,
          commodities_trading_experience: financial.commodities_trading_experience,
          commodities_trading_frequency: financial.commodities_trading_frequency,
          stocks_trading_experience: financial.stocks_trading_experience,
          stocks_trading_frequency: financial.stocks_trading_frequency,
          other_derivatives_trading_experience: financial.other_derivatives_trading_experience,
          other_derivatives_trading_frequency: financial.other_derivatives_trading_frequency,
          other_instruments_trading_experience: financial.other_instruments_trading_experience,
          other_instruments_trading_frequency: financial.other_instruments_trading_frequency,
          employment_industry: financial.employment_industry,
          education_level: financial.education_level,
          income_source: financial.income_source,
          net_income: financial.net_income,
          estimated_worth: financial.estimated_worth,
          accept_risk: 1,
        };
        return request;
      };
      state.financial.new_account_maltainvest = function() {
        var request = state.financial.create_request();
        console.warn(request);
      }

      state.risk.accept = function() {
        var request = state.financial.create_request();
        state.risk.visible = false;
        state.financial.disabled = true;
        liveapi.send(request)
               .then(function(data){
                 var info = data.new_account_maltainvest;
                 oauth = local_storage.get('oauth');
                 /* when new accoutns are created document.cookie is not change, set is_financial: ture so
                  * that navigation.js can hide the account promotion link */
                 oauth.push({id: info.client_id, token: info.oauth_token, is_virtual: 0, is_financial: true});
                 local_storage.set('oauth', oauth);
                 $.growl.notice({ message: 'Account successfully created' });
                 $.growl.notice({ message: 'Switching to your new account ...' });
                 /* login with the new account */
                 return liveapi.switch_account(info.client_id)
                               .then(function() {
                                 real_win.dialog('destroy');
                                 real_win_li.hide();
                               });
               })
               .catch(function(err){
                 state.financial.disabled = false;
                 error_handler(err);
               });
      }
      state.risk.decline = function(){
        state.risk.visible = false;
      }

      state.route.update = function(route){
        var routes = {
          'user' : 930,
          'financial': 1390,
        };
        state.route.value = route;
        real_win.dialog('option', 'height', routes[route]);
        real_win.dialog('widget').trigger('dialogresizestop');
      };

      real_win_view = rv.bind(root[0], state);

      /* get the residence field and its states */
      var residence_promise = liveapi.send({get_settings: 1})
             .then(function(data){
               state.user.residence = data.get_settings.country_code;
               state.user.residence_name = data.get_settings.country;
             })
             .catch(error_handler);

      residence_promise
           .then( function() { return liveapi.cached.send({residence_list: 1}); } )
           .then(function(data){
              var residence = _.find(data.residence_list, { value: state.user.residence });
              state.user.phone = '+' + residence.phone_idd;
           })
           .catch(error_handler);

      residence_promise
           .then( function() { return liveapi.cached.send({states_list: state.user.residence }); } )
           .then(function(data){
             state.user.state_address_array = data.states_list;
             state.user.state_address = data.states_list[0].value;
           })
           .catch(error_handler);

      residence_promise
           .then( function() { return liveapi.cached.send({landing_company: state.user.residence }); } )
           .then(function(data) {
             var financial = data.landing_company.financial_company;
             var gaming = data.landing_company.gaming_company;
             state.company.financial = financial;
             state.company.gaming = gaming;
             if(financial && !gaming && financial.shortcode === 'maltainvest')
                state.company.type = 'maltainvest';
            //  else if(financial && !gaming && financial.shortcode === 'japan')
            //     state.company.type = 'japan';
             else
                state.company.type = 'normal';

             /* if there is not finiancial account and there is already one real acount,
              * allow UK MLT client to open MF account. */
             var oauth = local_storage.get('oauth') || [];
             var loginids = Cookies.loginids();
             var no_financial_account_registered = _.every(loginids, {is_financial: false}) && !_.some(oauth, {is_financial: true});
             var a_real_account_already_exists = _.some(loginids, {is_real: true}) || _.some(oauth, {is_virtual: 0});
             if(no_financial_account_registered && a_real_account_already_exists) {
                var residence = Cookies.residence();
                var authorize = local_storage.get('authorize');
                var ok =
                    (countries[residence] && countries[residence].financial_company === 'maltainvest') ||
                    (Cookies.residence() === 'gb' && authorize && /^MLT/.test(authorize.loginid));
                if(ok) {
                  state.company.type = 'maltainvest';
                }
             }
           })
           .catch(error_handler);
    }

    return {
      init: init
    }
});
