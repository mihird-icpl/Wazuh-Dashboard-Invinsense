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

import { resolve } from 'path';
import { createWriteStream, mkdirSync } from 'fs';
import { Readable, Writable } from 'stream';
import { Client } from '@opensearch-project/opensearch';
import { ToolingLog } from '@osd/dev-utils';

import { createListStream, createPromiseFromStreams } from '../lib/streams';
import {
  createStats,
  createGenerateIndexRecordsStream,
  createFormatArchiveStreams,
  createGenerateDocRecordsStream,
  Progress,
} from '../lib';

export async function saveAction({
  name,
  indices,
  client,
  dataDir,
  log,
  raw,
  query,
}: {
  name: string;
  indices: string | string[];
  client: Client;
  dataDir: string;
  log: ToolingLog;
  raw: boolean;
  query?: Record<string, any>;
}) {
  const outputDir = resolve(dataDir, name);
  const stats = createStats(name, log);

  log.info('[%s] Creating archive of %j', name, indices);

  mkdirSync(outputDir, { recursive: true });

  const progress = new Progress();
  progress.activate(log);

  await Promise.all([
    // export and save the matching indices to mappings.json
    createPromiseFromStreams([
      createListStream(indices),
      createGenerateIndexRecordsStream(client, stats),
      ...createFormatArchiveStreams(),
      createWriteStream(resolve(outputDir, 'mappings.json')),
    ] as [Readable, ...Writable[]]),

    // export all documents from matching indexes into data.json.gz
    createPromiseFromStreams([
      createListStream(indices),
      createGenerateDocRecordsStream({ client, stats, progress, query }),
      ...createFormatArchiveStreams({ gzip: !raw }),
      createWriteStream(resolve(outputDir, `data.json${raw ? '' : '.gz'}`)),
    ] as [Readable, ...Writable[]]),
  ]);

  progress.deactivate();
  stats.forEachIndex((index, { docs }) => {
    log.info('[%s] Archived %d docs from %j', name, docs.archived, index);
  });

  return stats.toJSON();
}
