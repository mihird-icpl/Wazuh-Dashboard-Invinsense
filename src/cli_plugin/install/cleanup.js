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

import { rm, access } from 'fs/promises';
import { rmSync, constants } from 'fs';

const exists = async (loc) => {
  try {
    await access(loc, constants.W_OK);
    return true;
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }
};
export const cleanPrevious = async (settings, logger) => {
  const workingPathExists = await exists(settings.workingPath);

  if (workingPathExists) {
    logger.log('Found previous install attempt. Deleting...');
    return await rm(settings.workingPath, { recursive: true });
  }
};

export function cleanArtifacts(settings) {
  // Delete the working directory; at this point we're bailing, so swallow any errors on delete.
  try {
    rmSync(settings.workingPath, { recursive: true, force: true });
  } catch (e) {} // eslint-disable-line no-empty
}
