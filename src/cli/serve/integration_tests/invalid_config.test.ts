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

import { spawnSync } from 'child_process';

import { REPO_ROOT } from '@osd/dev-utils';

const INVALID_CONFIG_PATH = require.resolve('./__fixtures__/invalid_config.yml');

interface LogEntry {
  message: string;
  tags: string[];
  type: string;
}

describe('cli invalid config support', function () {
  it(
    'exits with statusCode 64 and logs a single line when config is invalid',
    function () {
      // Unused keys only throw once LegacyService starts, so disable migrations so that Core
      // will finish the start lifecycle without a running OpenSearch instance.
      const { error, status, stdout, stderr } = spawnSync(
        process.execPath,
        [
          'scripts/opensearch_dashboards',
          '--config',
          INVALID_CONFIG_PATH,
          '--migrations.skip=true',
        ],
        {
          cwd: REPO_ROOT,
        }
      );

      const [fatalLogLine] = stdout
        .toString('utf8')
        .split('\n')
        .filter(Boolean)
        .map((line) => JSON.parse(line) as LogEntry)
        .filter((line) => line.tags?.includes?.('fatal'))
        .map((obj) => ({
          ...obj,
          pid: '## PID ##',
          '@timestamp': '## @timestamp ##',
          error: '## Error with stack trace ##',
        }));

      expect(error).toBe(undefined);

      if (!fatalLogLine) {
        throw new Error(
          `cli did not log the expected fatal error message:\n\nstdout: \n${stdout}\n\nstderr:\n${stderr}`
        );
      }

      expect(fatalLogLine.message).toContain(
        'Error: Unknown configuration key(s): "unknown.key", "other.unknown.key", "other.third", "some.flat.key", ' +
          '"some.array". Check for spelling errors and ensure that expected plugins are installed.'
      );
      expect(fatalLogLine.tags).toEqual(['fatal', 'root']);
      expect(fatalLogLine.type).toEqual('log');

      expect(status).toBe(64);
    },
    20 * 1000
  );
});
