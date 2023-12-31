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

import { PluginInitializerContext, CoreSetup, CoreStart, Plugin } from '../../../core/public';
import { Plugin as ExpressionsPublicPlugin } from '../../expressions/public';
import { DataPublicPluginSetup, DataPublicPluginStart } from '../../data/public';
import { VisualizationsSetup } from '../../visualizations/public';
import { Setup as InspectorSetup } from '../../inspector/public';

import {
  setNotifications,
  setData,
  setInjectedVars,
  setUISettings,
  setMapsLegacyConfig,
  setInjectedMetadata,
} from './services';

import { createVegaFn } from './expressions/vega_fn';
import { createVegaTypeDefinition } from './vega_type';
import { IServiceSettings } from '../../maps_legacy/public';
import './index.scss';
import { ConfigSchema } from '../config';

import { getVegaInspectorView } from './vega_inspector';
import { createLineVegaSpecFn } from './expressions/line_vega_spec_fn';
import { UiActionsStart } from '../../ui_actions/public';
import { setUiActions } from './services';

/** @internal */
export interface VegaVisualizationDependencies {
  core: CoreSetup;
  plugins: {
    data: DataPublicPluginSetup;
  };
  getServiceSettings: () => Promise<IServiceSettings>;
}

/** @internal */
export interface VegaPluginSetupDependencies {
  expressions: ReturnType<ExpressionsPublicPlugin['setup']>;
  visualizations: VisualizationsSetup;
  inspector: InspectorSetup;
  data: DataPublicPluginSetup;
  mapsLegacy: any;
}

/** @internal */
export interface VegaPluginStartDependencies {
  data: DataPublicPluginStart;
  uiActions: UiActionsStart;
}

/** @internal */
export class VegaPlugin implements Plugin<Promise<void>, void> {
  initializerContext: PluginInitializerContext<ConfigSchema>;

  constructor(initializerContext: PluginInitializerContext<ConfigSchema>) {
    this.initializerContext = initializerContext;
  }

  public async setup(
    core: CoreSetup,
    { inspector, data, expressions, visualizations, mapsLegacy }: VegaPluginSetupDependencies
  ) {
    setInjectedVars({
      enableExternalUrls: this.initializerContext.config.get().enableExternalUrls,
      emsTileLayerId: core.injectedMetadata.getInjectedVar('emsTileLayerId', true),
    });
    setUISettings(core.uiSettings);
    setMapsLegacyConfig(mapsLegacy.config);

    const visualizationDependencies: Readonly<VegaVisualizationDependencies> = {
      core,
      plugins: {
        data,
      },
      getServiceSettings: mapsLegacy.getServiceSettings,
    };

    inspector.registerView(getVegaInspectorView({ uiSettings: core.uiSettings }));

    expressions.registerFunction(() => createVegaFn(visualizationDependencies));
    expressions.registerFunction(() => createLineVegaSpecFn(visualizationDependencies));

    visualizations.createBaseVisualization(createVegaTypeDefinition(visualizationDependencies));
  }

  public start(core: CoreStart, { data, uiActions }: VegaPluginStartDependencies) {
    setNotifications(core.notifications);
    setData(data);
    setUiActions(uiActions);
    setInjectedMetadata(core.injectedMetadata);
  }
}
