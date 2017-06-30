import { before, after } from '../default';
import { chartTemplateTest } from './chartTemplateTest';
import { chartFunctionTest } from './chartFunctionTest';
import chartLineTest from './chartLinesTest';
import { indicator as indicatorTest } from './indicatorTest';
import { overlay as overlayTest } from './overlayTest';
import { indicatorAndOverlay as indicatorAndOverlayTest } from './indicatorAndOverlayTest';

export default {
  before: (browser) => {
    before(browser);
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
  },
  after: after,
  'Chart functions': chartFunctionTest,
  'Chart template': chartTemplateTest,
  'Horizontal line': chartLineTest.horizontalLine,
  'Vertical line': chartLineTest.verticalLine,
  'Indicator': indicatorTest,
  'Overlay': overlayTest,
  'IndicatorAndOverlay': indicatorAndOverlayTest
}
