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

export function oktaLogsSpecProvider(context: TutorialContext): TutorialSchema {
  const moduleName = 'okta';
  const platforms = ['OSX', 'DEB', 'RPM', 'WINDOWS'] as const;
  return {
    id: 'oktaLogs',
    name: i18n.translate('home.tutorials.oktaLogs.nameTitle', {
      defaultMessage: 'Okta logs',
    }),
    moduleName,
    category: TutorialsCategory.SECURITY_SOLUTION,
    shortDescription: i18n.translate('home.tutorials.oktaLogs.shortDescription', {
      defaultMessage: 'Collect the Okta system log via the Okta API.',
    }),
    longDescription: i18n.translate('home.tutorials.oktaLogs.longDescription', {
      defaultMessage:
        'The Okta module collects events from the [Okta API](https://developer.okta.com/docs/reference/). \
        Specifically this supports reading from the [Okta System Log API](https://developer.okta.com/docs/reference/api/system-log/). \
        [Learn more]({learnMoreLink}).',
      values: {
        learnMoreLink: '{config.docs.beats.filebeat}/filebeat-module-okta.html',
      },
    }),
    euiIconType: '/plugins/home/assets/tutorials/logos/okta.svg',
    artifacts: {
      dashboards: [
        {
          id: '749203a0-67b1-11ea-a76f-bf44814e437d',
          linkLabel: i18n.translate('home.tutorials.oktaLogs.artifacts.dashboards.linkLabel', {
            defaultMessage: 'Okta Overview',
          }),
          isOverview: true,
        },
      ],
      exportedFields: {
        documentationUrl: '{config.docs.beats.filebeat}/exported-fields-okta.html',
      },
    },
    completionTimeMinutes: 10,
    onPrem: onPremInstructions(moduleName, platforms, context),
  };
}
