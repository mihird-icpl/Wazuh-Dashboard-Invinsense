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

export function sonicwallLogsSpecProvider(context: TutorialContext): TutorialSchema {
  const moduleName = 'sonicwall';
  const platforms = ['OSX', 'DEB', 'RPM', 'WINDOWS'] as const;
  return {
    id: 'sonicwallLogs',
    name: i18n.translate('home.tutorials.sonicwallLogs.nameTitle', {
      defaultMessage: 'Sonicwall FW logs',
    }),
    moduleName,
    category: TutorialsCategory.SECURITY_SOLUTION,
    shortDescription: i18n.translate('home.tutorials.sonicwallLogs.shortDescription', {
      defaultMessage: 'Collect Sonicwall-FW logs over syslog or from a file.',
    }),
    longDescription: i18n.translate('home.tutorials.sonicwallLogs.longDescription', {
      defaultMessage:
        'This is a module for receiving Sonicwall-FW logs over Syslog or a file. \
[Learn more]({learnMoreLink}).',
      values: {
        learnMoreLink: '{config.docs.beats.filebeat}/filebeat-module-sonicwall.html',
      },
    }),
    euiIconType: '/plugins/home/assets/tutorials/logos/sonicwall.svg',
    artifacts: {
      dashboards: [],
      application: {
        path: '/app/security',
        label: i18n.translate('home.tutorials.radwareLogs.artifacts.dashboards.linkLabel', {
          defaultMessage: 'Security App',
        }),
      },
      exportedFields: {
        documentationUrl: '{config.docs.beats.filebeat}/exported-fields-sonicwall.html',
      },
    },
    completionTimeMinutes: 10,
    onPrem: onPremInstructions(moduleName, platforms, context),
  };
}
