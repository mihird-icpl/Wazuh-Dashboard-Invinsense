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

import { i18n } from '@osd/i18n';
import { TutorialsCategory } from '../../services/tutorials';
import { onPremInstructions } from '../instructions/filebeat_instructions';
import {
  TutorialContext,
  TutorialSchema,
} from '../../services/tutorials/lib/tutorials_registry_types';

export function iisLogsSpecProvider(context: TutorialContext): TutorialSchema {
  const moduleName = 'iis';
  const platforms = ['WINDOWS'] as const;
  return {
    id: 'iisLogs',
    name: i18n.translate('home.tutorials.iisLogs.nameTitle', {
      defaultMessage: 'IIS logs',
    }),
    moduleName,
    category: TutorialsCategory.LOGGING,
    shortDescription: i18n.translate('home.tutorials.iisLogs.shortDescription', {
      defaultMessage: 'Collect and parse access and error logs created by the IIS HTTP server.',
    }),
    longDescription: i18n.translate('home.tutorials.iisLogs.longDescription', {
      defaultMessage:
        'The `iis` Filebeat module parses access and error logs created by the IIS HTTP server. \
[Learn more]({learnMoreLink}).',
      values: {
        learnMoreLink: '{config.docs.beats.filebeat}/filebeat-module-iis.html',
      },
    }),
    euiIconType: '/plugins/home/assets/tutorials/logos/iis.svg',
    artifacts: {
      dashboards: [
        {
          id: '4278ad30-fe16-11e7-a3b0-d13028918f9f-ecs',
          linkLabel: i18n.translate('home.tutorials.iisLogs.artifacts.dashboards.linkLabel', {
            defaultMessage: 'IIS logs dashboard',
          }),
          isOverview: true,
        },
      ],
      exportedFields: {
        documentationUrl: '{config.docs.beats.filebeat}/exported-fields-iis.html',
      },
    },
    completionTimeMinutes: 10,
    onPrem: onPremInstructions(moduleName, platforms, context),
  };
}
