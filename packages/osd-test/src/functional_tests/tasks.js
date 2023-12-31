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

import { relative } from 'path';
import * as Rx from 'rxjs';
import { startWith, switchMap, take } from 'rxjs/operators';
import { withProcRunner } from '@osd/dev-utils';
import dedent from 'dedent';

import {
  runOpenSearch,
  runOpenSearchDashboardsServer,
  runFtr,
  assertNoneExcluded,
  hasTests,
  OPENSEARCH_DASHBOARDS_FTR_SCRIPT,
} from './lib';

import { readConfigFile } from '../functional_test_runner/lib';

const makeSuccessMessage = (options) => {
  const installDirFlag = options.installDir
    ? ` --opensearch-dashboards-install-dir=${options.installDir}`
    : '';

  return (
    '\n\n' +
    dedent`
      OpenSearch and OpenSearch Dashboards are ready for functional testing. Start the functional tests
      in another terminal session by running this command from this directory:

          node ${relative(process.cwd(), OPENSEARCH_DASHBOARDS_FTR_SCRIPT)}${installDirFlag}
    ` +
    '\n\n'
  );
};

/**
 * Run servers and tests for each config
 * @param {object} options                   Optional
 * @property {string[]} options.configs      Array of paths to configs
 * @property {function} options.log          An instance of the ToolingLog
 * @property {string} options.installDir     Optional installation dir from which to run OpenSearch Dashboards
 * @property {boolean} options.bail          Whether to exit test run at the first failure
 * @property {string} options.opensearchFrom         Optionally run from source instead of snapshot
 */
export async function runTests(options) {
  if (!process.env.OSD_NP_PLUGINS_BUILT) {
    const log = options.createLogger();
    log.warning('❗️❗️❗️');
    log.warning('❗️❗️❗️');
    log.warning('❗️❗️❗️');
    log.warning(
      "   Don't forget to use `node scripts/build_opensearch_dashboards_platform_plugins` to build plugins you plan on testing"
    );
    log.warning('❗️❗️❗️');
    log.warning('❗️❗️❗️');
    log.warning('❗️❗️❗️');
  }

  for (const configPath of options.configs) {
    const log = options.createLogger();
    const opts = {
      ...options,
      log,
    };

    log.info('Running', configPath);
    log.indent(2);

    if (options.assertNoneExcluded) {
      await assertNoneExcluded({ configPath, options: opts });
      continue;
    }

    if (!(await hasTests({ configPath, options: opts }))) {
      log.info('Skipping', configPath, 'since all tests are excluded');
      continue;
    }

    await withProcRunner(log, async (procs) => {
      const config = await readConfigFile(log, configPath);

      let opensearch;
      try {
        opensearch = await runOpenSearch({ config, options: opts });
        await runOpenSearchDashboardsServer({ procs, config, options: opts });
        await runFtr({ configPath, options: opts });
      } finally {
        try {
          await procs.stop('opensearch-dashboards');
        } finally {
          if (opensearch) {
            await opensearch.cleanup();
          }
        }
      }
    });
  }
}

/**
 * Start only servers using single config
 * @param {object} options                   Optional
 * @property {string} options.config         Path to a config file
 * @property {function} options.log          An instance of the ToolingLog
 * @property {string} options.installDir     Optional installation dir from which to run OpenSearch Dashboards
 * @property {string} options.opensearchFrom         Optionally run from source instead of snapshot
 */
export async function startServers(options) {
  const log = options.createLogger();
  const opts = {
    ...options,
    log,
  };

  await withProcRunner(log, async (procs) => {
    const config = await readConfigFile(log, options.config);

    const opensearch = await runOpenSearch({ config, options: opts });
    await runOpenSearchDashboardsServer({
      procs,
      config,
      options: {
        ...opts,
        extraOsdOpts: [
          ...options.extraOsdOpts,
          ...(options.installDir ? [] : ['--dev', '--no-dev-config']),
        ],
      },
    });

    // wait for 5 seconds of silence before logging the
    // success message so that it doesn't get buried
    await silence(log, 5000);
    log.success(makeSuccessMessage(options));

    await procs.waitForAllToStop();
    await opensearch.cleanup();
  });
}

async function silence(log, milliseconds) {
  await log
    .getWritten$()
    .pipe(
      startWith(null),
      switchMap(() => Rx.timer(milliseconds)),
      take(1)
    )
    .toPromise();
}
