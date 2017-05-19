import { before, after } from './default';
var chartTemplateTest = require('./chartTemplateTest');

module.exports = {
  before: before,
  after: after,
  'Chart functions': (browser) => {
    browser
      //Open Dialog
      .click('.top-nav-menu .instruments')
      .waitForElementVisible('.top-nav-menu .instruments > ul')
      .click('.top-nav-menu .instruments > ul > li:last-of-type')
      .assert.visible('.top-nav-menu .instruments > ul > li:last-of-type')
      .click('.top-nav-menu .instruments > ul > li:last-of-type > ul > li:first-of-type')
      .assert.visible('.top-nav-menu .instruments > ul > li:last-of-type > ul > li:first-of-type')
      .click('.top-nav-menu .instruments > ul > li:last-of-type > ul > li:first-of-type > ul > li:first-of-type')
      .waitForElementVisible('div[role="dialog"]:last-of-type')
      .waitForElementNotVisible('div[role="dialog"]:last-of-type .webtrader-dialog .highcharts-loading')
      //Dialog reload
      .click('div[role="dialog"]:last-of-type img.reload')
      //Show time period dropdown
      .click('div[role="dialog"]:last-of-type .chartOptions_button.timeperiod')
      .assert.visible('div[role="dialog"]:last-of-type .timePeriodOverlay')
      //Change time period
      .click('div[role="dialog"]:last-of-type .timePeriodOverlay .row:nth-of-type(2) .cell:last-of-type span:nth-of-type(4)')
      .waitForElementNotVisible('div[role="dialog"]:last-of-type .webtrader-dialog .highcharts-loading')
      // Chart type dropdown
      .click('div[role="dialog"]:last-of-type .chartOptions_button.chart_type')
      .assert.visible('div[role="dialog"]:last-of-type .chartTypeOverlay')
      // Change chart type
      .click('div[role="dialog"]:last-of-type .chartTypeOverlay .row .cell[data-charttype="line"]')
      .waitForElementNotVisible('div[role="dialog"]:last-of-type .webtrader-dialog .highcharts-loading')
      .click('div[role="dialog"]:last-of-type .chartOptions_button.chart_type')
      //Open table view
      .click('div[role="dialog"]:last-of-type .chartTypeOverlay .row .cell[data-charttype="table"]')
      .pause(750)
      .assert.cssProperty('div[role="dialog"]:last-of-type .table-view', 'left', '0px')
      //Close table view
      .click('div[role="dialog"]:last-of-type span.close')
      .pause(250)
      .assert.cssProperty('div[role="dialog"]:last-of-type .table-view', 'left', '350px')
      //Change chart type to candle
      .click('div[role="dialog"]:last-of-type .chartOptions_button.chart_type')
      .click('div[role="dialog"]:last-of-type .chartTypeOverlay .row .cell[data-charttype="ohlc"]')
      .click('div[role="dialog"]:last-of-type .chartOptions_button.chart_type')
      //Crosshair enabled
      .assert.cssClassPresent('div[role="dialog"]:last-of-type .chartTypeOverlay [rv-class-bold="enableCrosshair"]', 'bold')
      .execute('$(\'div[role="dialog"]:last-of-type .chartTypeOverlay [rv-class-bold="enableCrosshair"]\').parent().click()')
      .click('div[role="dialog"]:last-of-type .chartOptions_button.chart_type')
      .assert.cssClassNotPresent('div[role="dialog"]:last-of-type .chartTypeOverlay [rv-class-bold="enableCrosshair"]', 'bold')
      .execute('$(\'div[role="dialog"]:last-of-type .chartTypeOverlay [rv-class-bold="enableCrosshair"]\').parent().click()')
      //Indicator pop-up
      .click('div[role="dialog"]:last-of-type .chartOptions_button span[data-balloon="Indicators"]')
      .waitForElementPresent('.indicator-dialog')
      .execute("$('.indicator-dialog').parent().find('.ui-dialog-titlebar-close').click()")
      .assert.hidden('.indicator-dialog')
      //Comparisons/Overlay pop-up
      .click('div[role=\'dialog\'] .webtrader-dialog .chartOptions_button span[data-balloon="Comparisons"]')
      .waitForElementPresent('.overlay-dialog')
      .execute("$('.overlay-dialog').parent().find('.ui-dialog-titlebar-close').click()")
      .assert.hidden('.overlay-dialog')
      // Draw
      .click('div[role=\'dialog\'] .webtrader-dialog .chartOptions_button span.drawButton')
      .assert.visible('div[role=\'dialog\'] .webtrader-dialog .drawingToolOverlay')
      .execute('$(\'div[role="dialog"] .webtrader-dialog span[data-balloon="Horizontal line"] img\').click()')
      .waitForElementPresent('.cssPopup')
      // Draw horizontal line
      .execute("$('.cssPopup').parent().find('.ui-dialog-buttonset .ui-button')[0].click()")
      .assert.elementNotPresent('.cssPopup')
      .moveToElement('div[role=\'dialog\'] .webtrader-dialog .chartSubContainer svg', 90, 100)
      .mouseButtonClick('left')
      .assert.elementPresent('div[role=\'dialog\'] .webtrader-dialog .chartSubContainer svg .highcharts-plot-lines-0 path')
      //Remove horizontal line from chart
      .moveToElement('div[role=\'dialog\'] .webtrader-dialog .chartSubContainer', 90, 100)
      .doubleClick()
      .moveToElement('div[role=\'dialog\'] .webtrader-dialog .chartSubContainer', -50, -50)
      .assert.elementNotPresent('div[role=\'dialog\'] .webtrader-dialog .chartSubContainer svg .highcharts-plot-lines-0 path')
    /**
     * To-Do:
     *  - Figure out a way to simulate mouse hover over highcharts
     *  - Add tests for chart template.
     */
    /*
    //Check crosshair
    .moveToElement('div[role="dialog"]:last-of-type .highcharts-container', 100, 50)
    .mouseButtonClick(0)
    .mouseButtonClick(2)
    .pause(10000)
    .saveScreenshot('screenshots/crosshair.png')
    .click('div[role="dialog"]:last-of-type .highcharts-container svg > path')
    .assert.elementPresent('div[role="dialog"]:last-of-type .highcharts-container svg > path[stroke-width="2"]')*/
  },
  'Chart template': chartTemplateTest,
}
