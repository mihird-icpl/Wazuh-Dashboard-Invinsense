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

import { cloneDeep, defaults, mergeWith, compact } from 'lodash';
import $ from 'jquery';
import moment, { Moment } from 'moment-timezone';

import { euiPaletteColorBlind } from '@elastic/eui';
import { TimefilterContract } from 'src/plugins/data/public';
import { IUiSettingsClient } from 'opensearch-dashboards/public';

import { calculateInterval } from '../../common/lib';
import { xaxisFormatterProvider } from './xaxis_formatter';
import { Series } from './timeline_request_handler';

export interface Axis {
  delta?: number;
  max?: number;
  min?: number;
  mode: string;
  options?: {
    units: { prefix: string; suffix: string };
  };
  tickSize?: number;
  ticks: number;
  tickLength: number;
  timezone: string;
  tickDecimals?: number;
  tickFormatter: ((val: number) => string) | ((val: number, axis: Axis) => string);
  tickGenerator?(axis: Axis): number[];
  units?: { type: string };
}

interface TimeRangeBounds {
  min: Moment | undefined;
  max: Moment | undefined;
}

export const ACTIVE_CURSOR = 'ACTIVE_CURSOR_TIMELINE';
export const eventBus = $({});

const colors = euiPaletteColorBlind();

const SERIES_ID_ATTR = 'data-series-id';

function buildSeriesData(chart: Series[], options: jquery.flot.plotOptions) {
  const seriesData = chart.map((series: Series, seriesIndex: number) => {
    const newSeries: Series = cloneDeep(
      defaults(series, {
        shadowSize: 0,
        lines: {
          lineWidth: 3,
        },
      })
    );

    newSeries._id = seriesIndex;

    if (series.color) {
      const span = document.createElement('span');
      span.style.color = series.color;
      newSeries.color = span.style.color;
    }

    if (series._hide) {
      newSeries.data = [];
      newSeries.stack = false;
      newSeries.label = `(hidden) ${series.label}`;
    }

    if (series._global) {
      mergeWith(options, series._global, (objVal, srcVal) => {
        // This is kind of gross, it means that you can't replace a global value with a null
        // best you can do is an empty string. Deal with it.
        if (objVal == null) {
          return srcVal;
        }
        if (srcVal == null) {
          return objVal;
        }
      });
    }

    return newSeries;
  });

  return compact(seriesData);
}

function buildOptions(
  intervalValue: string,
  timefilter: TimefilterContract,
  uiSettings: IUiSettingsClient,
  clientWidth = 0,
  showGrid?: boolean
) {
  // Get the X-axis tick format
  const time: TimeRangeBounds = timefilter.getBounds();
  const interval = calculateInterval(
    (time.min && time.min.valueOf()) || 0,
    (time.max && time.max.valueOf()) || 0,
    uiSettings.get('timeline:target_buckets') || 200,
    intervalValue,
    uiSettings.get('timeline:min_interval') || '1ms'
  );
  const format = xaxisFormatterProvider(uiSettings)(interval);

  const tickLetterWidth = 7;
  const tickPadding = 45;

  const options = {
    xaxis: {
      mode: 'time',
      tickLength: 5,
      timezone: 'browser',
      // Calculate how many ticks can fit on the axis
      ticks: Math.floor(clientWidth / (format.length * tickLetterWidth + tickPadding)),
      // Use moment to format ticks so we get timezone correction
      tickFormatter: (val: number) => moment(val).format(format),
    },
    selection: {
      mode: 'x',
      color: '#ccc',
    },
    crosshair: {
      mode: 'x',
      color: '#C66',
      lineWidth: 2,
    },
    colors,
    grid: {
      show: showGrid,
      borderWidth: 0,
      borderColor: null,
      margin: 10,
      hoverable: true,
      autoHighlight: false,
    },
    legend: {
      backgroundColor: 'rgb(255,255,255,0)',
      position: 'nw',
      labelBoxBorderColor: 'rgb(255,255,255,0)',
      labelFormatter(label: string, series: { _id: number }) {
        const wrapperSpan = document.createElement('span');
        const labelSpan = document.createElement('span');
        const numberSpan = document.createElement('span');

        wrapperSpan.setAttribute('class', 'ngLegendValue');
        wrapperSpan.setAttribute(SERIES_ID_ATTR, `${series._id}`);

        labelSpan.appendChild(document.createTextNode(label));
        numberSpan.setAttribute('class', 'ngLegendValueNumber');

        wrapperSpan.appendChild(labelSpan);
        wrapperSpan.appendChild(numberSpan);

        return wrapperSpan.outerHTML;
      },
    },
  } as jquery.flot.plotOptions & { yaxes?: Axis[] };

  return options;
}

export { buildSeriesData, buildOptions, SERIES_ID_ATTR, colors };
