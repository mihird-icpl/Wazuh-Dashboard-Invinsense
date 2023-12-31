/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import moment from 'moment';
import { FtrProviderContext } from '../ftr_provider_context.d';
import { WebElementWrapper } from '../services/lib/web_element_wrapper';

export type CommonlyUsed =
  | 'Today'
  | 'This_week'
  | 'Last_15 minutes'
  | 'Last_30 minutes'
  | 'Last_1 hour'
  | 'Last_24 hours'
  | 'Last_7 days'
  | 'Last_30 days'
  | 'Last_90 days'
  | 'Last_1 year';

export function TimePickerProvider({ getService, getPageObjects }: FtrProviderContext) {
  const log = getService('log');
  const find = getService('find');
  const browser = getService('browser');
  const testSubjects = getService('testSubjects');
  const { header } = getPageObjects(['header']);
  const opensearchDashboardsServer = getService('opensearchDashboardsServer');
  const MenuToggle = getService('MenuToggle');
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const quickSelectTimeMenuToggle = new MenuToggle({
    name: 'QuickSelectTime Menu',
    menuTestSubject: 'superDatePickerQuickMenu',
    toggleButtonTestSubject: 'superDatePickerToggleQuickMenuButton',
  });

  class TimePicker {
    defaultStartTime = 'Sep 19, 2015 @ 06:31:44.000';
    defaultEndTime = 'Sep 23, 2015 @ 18:31:44.000';
    defaultStartTimeUTC = '2015-09-18T06:31:44.000Z';
    defaultEndTimeUTC = '2015-09-23T18:31:44.000Z';

    async setDefaultAbsoluteRange() {
      await this.setAbsoluteRange(this.defaultStartTime, this.defaultEndTime);
    }

    async ensureHiddenNoDataPopover() {
      const isVisible = await testSubjects.exists('noDataPopoverDismissButton');
      if (isVisible) {
        await testSubjects.click('noDataPopoverDismissButton');
      }
    }

    /**
     * the provides a quicker way to set the timepicker to the default range, saves a few seconds
     */
    async setDefaultAbsoluteRangeViaUiSettings() {
      await opensearchDashboardsServer.uiSettings.update({
        'timepicker:timeDefaults': `{ "from": "${this.defaultStartTimeUTC}", "to": "${this.defaultEndTimeUTC}"}`,
      });
    }

    async resetDefaultAbsoluteRangeViaUiSettings() {
      await opensearchDashboardsServer.uiSettings.replace({});
    }

    private async getTimePickerPanel() {
      return await find.byCssSelector('div.euiPopover__panel-isOpen');
    }

    private async waitPanelIsGone(panelElement: WebElementWrapper) {
      await find.waitForElementStale(panelElement);
    }

    public async timePickerExists() {
      return await testSubjects.exists('superDatePickerToggleQuickMenuButton');
    }

    /**
     * Sets commonly used time
     * @param option 'Today' | 'This_week' | 'Last_15 minutes' | 'Last_24 hours' ...
     */
    async setCommonlyUsedTime(option: CommonlyUsed | string) {
      await testSubjects.click('superDatePickerToggleQuickMenuButton');
      await testSubjects.click(`superDatePickerCommonlyUsed_${option}`);
    }

    private async inputValue(dataTestSubj: string, value: string) {
      if (browser.isFirefox) {
        const input = await testSubjects.find(dataTestSubj);
        await input.clearValue();
        await input.type(value);
      } else {
        await testSubjects.setValue(dataTestSubj, value);
      }
    }

    private async showStartEndTimes() {
      // This first await makes sure the superDatePicker has loaded before we check for the ShowDatesButton
      await testSubjects.exists('superDatePickerToggleQuickMenuButton', { timeout: 20000 });
      const isShowDatesButton = await testSubjects.exists('superDatePickerShowDatesButton');
      if (isShowDatesButton) {
        await testSubjects.click('superDatePickerShowDatesButton');
      }
      await testSubjects.exists('superDatePickerstartDatePopoverButton');
    }

    /**
     * @param {String} fromTime MMM D, YYYY @ HH:mm:ss.SSS
     * @param {String} toTime MMM D, YYYY @ HH:mm:ss.SSS
     */
    public async setAbsoluteRange(fromTime: string, toTime: string) {
      log.debug(`Setting absolute range to ${fromTime} to ${toTime}`);
      await this.showStartEndTimes();

      // set to time
      await testSubjects.click('superDatePickerendDatePopoverButton');
      let panel = await this.getTimePickerPanel();
      await testSubjects.click('superDatePickerAbsoluteTab');
      await testSubjects.click('superDatePickerAbsoluteDateInput');
      await this.inputValue('superDatePickerAbsoluteDateInput', toTime);
      await browser.pressKeys(browser.keys.ESCAPE); // close popover because sometimes browser can't find start input

      // set from time
      await testSubjects.click('superDatePickerstartDatePopoverButton');
      await this.waitPanelIsGone(panel);
      panel = await this.getTimePickerPanel();
      await testSubjects.click('superDatePickerAbsoluteTab');
      await testSubjects.click('superDatePickerAbsoluteDateInput');
      await this.inputValue('superDatePickerAbsoluteDateInput', fromTime);

      const superDatePickerApplyButtonExists = await testSubjects.exists(
        'superDatePickerApplyTimeButton'
      );
      if (superDatePickerApplyButtonExists) {
        // Timepicker is in top nav
        // Click super date picker apply button to apply time range
        await testSubjects.click('superDatePickerApplyTimeButton');
      } else {
        // Timepicker is embedded in query bar
        // click query bar submit button to apply time range
        await testSubjects.click('querySubmitButton');
      }

      await this.waitPanelIsGone(panel);
      await header.awaitGlobalLoadingIndicatorHidden();
    }

    public async isOff() {
      return await find.existsByCssSelector('.euiDatePickerRange--readOnly');
    }

    public async getRefreshConfig(keepQuickSelectOpen = false) {
      await quickSelectTimeMenuToggle.open();
      const interval = await testSubjects.getAttribute(
        'superDatePickerRefreshIntervalInput',
        'value'
      );

      let selectedUnit;
      const select = await testSubjects.find('superDatePickerRefreshIntervalUnitsSelect');
      const options = await find.allDescendantDisplayedByCssSelector('option', select);
      await Promise.all(
        options.map(async (optionElement) => {
          const isSelected = await optionElement.isSelected();
          if (isSelected) {
            selectedUnit = await optionElement.getVisibleText();
          }
        })
      );

      const toggleButtonText = await testSubjects.getVisibleText(
        'superDatePickerToggleRefreshButton'
      );
      if (!keepQuickSelectOpen) {
        await quickSelectTimeMenuToggle.close();
      }

      return {
        interval,
        units: selectedUnit,
        isPaused: toggleButtonText === 'Start' ? true : false,
      };
    }

    public async getTimeConfig() {
      await this.showStartEndTimes();
      const start = await testSubjects.getVisibleText('superDatePickerstartDatePopoverButton');
      const end = await testSubjects.getVisibleText('superDatePickerendDatePopoverButton');
      return {
        start,
        end,
      };
    }

    public async getShowDatesButtonText() {
      const button = await testSubjects.find('superDatePickerShowDatesButton');
      const text = await button.getVisibleText();
      return text;
    }

    public async getTimeDurationForSharing() {
      return await testSubjects.getAttribute(
        'dataSharedTimefilterDuration',
        'data-shared-timefilter-duration'
      );
    }

    public async getTimeConfigAsAbsoluteTimes() {
      await this.showStartEndTimes();

      // get to time
      await testSubjects.click('superDatePickerendDatePopoverButton');
      const panel = await this.getTimePickerPanel();
      await testSubjects.click('superDatePickerAbsoluteTab');
      const end = await testSubjects.getAttribute('superDatePickerAbsoluteDateInput', 'value');

      // get from time
      await testSubjects.click('superDatePickerstartDatePopoverButton');
      await this.waitPanelIsGone(panel);
      await testSubjects.click('superDatePickerAbsoluteTab');
      const start = await testSubjects.getAttribute('superDatePickerAbsoluteDateInput', 'value');

      return {
        start,
        end,
      };
    }

    public async getTimeDurationInHours() {
      const DEFAULT_DATE_FORMAT = 'MMM D, YYYY @ HH:mm:ss.SSS';
      const { start, end } = await this.getTimeConfigAsAbsoluteTimes();
      const startMoment = moment(start, DEFAULT_DATE_FORMAT);
      const endMoment = moment(end, DEFAULT_DATE_FORMAT);
      return moment.duration(endMoment.diff(startMoment)).asHours();
    }

    public async startAutoRefresh(intervalS = 3) {
      await quickSelectTimeMenuToggle.open();
      await this.inputValue('superDatePickerRefreshIntervalInput', intervalS.toString());
      const refreshConfig = await this.getRefreshConfig(true);
      if (refreshConfig.isPaused) {
        log.debug('start auto refresh');
        await testSubjects.click('superDatePickerToggleRefreshButton');
      }
      await quickSelectTimeMenuToggle.close();
    }

    public async pauseAutoRefresh() {
      log.debug('pauseAutoRefresh');
      const refreshConfig = await this.getRefreshConfig(true);

      if (!refreshConfig.isPaused) {
        log.debug('pause auto refresh');
        await testSubjects.click('superDatePickerToggleRefreshButton');
      }

      await quickSelectTimeMenuToggle.close();
    }

    public async resumeAutoRefresh() {
      log.debug('resumeAutoRefresh');
      const refreshConfig = await this.getRefreshConfig(true);
      if (refreshConfig.isPaused) {
        log.debug('resume auto refresh');
        await testSubjects.click('superDatePickerToggleRefreshButton');
      }

      await quickSelectTimeMenuToggle.close();
    }

    public async setHistoricalDataRange() {
      await this.setDefaultAbsoluteRange();
    }

    public async setDefaultDataRange() {
      const fromTime = 'Jan 1, 2018 @ 00:00:00.000';
      const toTime = 'Apr 13, 2018 @ 00:00:00.000';
      await this.setAbsoluteRange(fromTime, toTime);
    }

    public async setLogstashDataRange() {
      const fromTime = 'Apr 9, 2018 @ 00:00:00.000';
      const toTime = 'Apr 13, 2018 @ 00:00:00.000';
      await this.setAbsoluteRange(fromTime, toTime);
    }

    // Helper function to set input value and verify
    private async setInputValueWithRetry(testSubjectId: string, value: string) {
      const MAX_ATTEMPTS = 3;

      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        // try to set the value
        await this.inputValue(testSubjectId, value);
        await sleep(500);

        // verify if the value was correctly set
        const actualValue = await (await testSubjects.find(testSubjectId)).getAttribute('value');
        if (actualValue === value) {
          return;
        }

        // if it's the last attempt and value wasn't set correctly, throw an error
        if (attempt === MAX_ATTEMPTS - 1) {
          throw new Error(
            `Failed to set ${testSubjectId} to ${value} after ${MAX_ATTEMPTS} attempts.`
          );
        }

        await sleep(500); // wait before retrying
      }
    }

    // TODO: This is a temporary method added due to observed issues with panels
    // not closing in time and incorrect time settings on Discover page. Once these bugs are resolved
    // and the interactions become more reliable, we should consider removing this method and related helper functions.
    // Tracking issue: https://github.com/opensearch-project/OpenSearch-Dashboards/issues/5241
    /**
     * @param {String} fromTime MMM D, YYYY @ HH:mm:ss.SSS
     * @param {String} toTime MMM D, YYYY @ HH:mm:ss.SSS
     */
    public async setDefaultRangeForDiscover() {
      const fromTime = this.defaultStartTime;
      const toTime = this.defaultEndTime;
      log.debug(`Setting absolute range to ${fromTime} to ${toTime}`);

      await this.showStartEndTimes();
      // make sure to close this verify panel
      await browser.pressKeys(browser.keys.ESCAPE);
      await sleep(500);

      // set to time
      await testSubjects.click('superDatePickerendDatePopoverButton');
      let panel = await this.getTimePickerPanel();
      await testSubjects.click('superDatePickerAbsoluteTab');
      await testSubjects.click('superDatePickerAbsoluteDateInput');
      await this.setInputValueWithRetry('superDatePickerAbsoluteDateInput', toTime);
      await browser.pressKeys(browser.keys.ESCAPE); // close popover because sometimes browser can't find start input

      // set from time
      await testSubjects.click('superDatePickerstartDatePopoverButton');
      await this.waitPanelIsGone(panel);
      panel = await this.getTimePickerPanel();
      await testSubjects.click('superDatePickerAbsoluteTab');
      await testSubjects.click('superDatePickerAbsoluteDateInput');
      await this.setInputValueWithRetry('superDatePickerAbsoluteDateInput', fromTime);
      await browser.pressKeys(browser.keys.ESCAPE);

      const superDatePickerApplyButtonExists = await testSubjects.exists(
        'superDatePickerApplyTimeButton'
      );
      if (superDatePickerApplyButtonExists) {
        // Timepicker is in top nav
        // Click super date picker apply button to apply time range
        await testSubjects.click('superDatePickerApplyTimeButton');
      } else {
        // Timepicker is embedded in query bar
        // click query bar submit button to apply time range
        await testSubjects.click('querySubmitButton');
      }
      await this.waitPanelIsGone(panel);
      await header.awaitGlobalLoadingIndicatorHidden();
    }
  }

  return new TimePicker();
}
