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

import { Client } from '@opensearch-project/opensearch';
import { ToolingLog, OsdClient } from '@osd/dev-utils';

import {
  saveAction,
  loadAction,
  unloadAction,
  rebuildAllAction,
  emptyOpenSearchDashboardsIndexAction,
  editAction,
} from './actions';

export class OpenSearchArchiver {
  private readonly client: Client;
  private readonly dataDir: string;
  private readonly log: ToolingLog;
  private readonly osdClient: OsdClient;

  constructor({
    client,
    dataDir,
    log,
    opensearchDashboardsUrl,
  }: {
    client: Client;
    dataDir: string;
    log: ToolingLog;
    opensearchDashboardsUrl: string;
  }) {
    this.client = client;
    this.dataDir = dataDir;
    this.log = log;
    this.osdClient = new OsdClient({ log, url: opensearchDashboardsUrl });
  }

  /**
   *  Extract data and mappings from an opensearch index and store
   *  it in the dataDir so it can be used later to recreate the index.
   *
   *  @param {String} name - the name of this archive, used to determine filename
   *  @param {String|Array<String>} indices - the indices to archive
   *  @param {Object} options
   *  @property {Boolean} options.raw - should the archive be raw (unzipped) or not
   *  @return Promise<Stats>
   */
  async save(
    name: string,
    indices: string | string[],
    { raw = false, query }: { raw?: boolean; query?: Record<string, any> } = {}
  ) {
    return await saveAction({
      name,
      indices,
      raw,
      client: this.client,
      dataDir: this.dataDir,
      log: this.log,
      query,
    });
  }

  /**
   *  Load an index from an archive
   *
   *  @param {String} name - the name of the archive to load
   *  @param {Object} options
   *  @property {Boolean} options.skipExisting - should existing indices
   *                                           be ignored or overwritten
   *  @property {Boolean} options.useCreate - use a create operation instead of index for documents
   *  @return Promise<Stats>
   */
  async load(
    name: string,
    {
      skipExisting = false,
      useCreate = false,
    }: { skipExisting?: boolean; useCreate?: boolean } = {}
  ) {
    return await loadAction({
      name,
      skipExisting: !!skipExisting,
      useCreate: !!useCreate,
      client: this.client,
      dataDir: this.dataDir,
      log: this.log,
      osdClient: this.osdClient,
    });
  }

  /**
   *  Remove the indexes in opensearch that have data in an archive.
   *
   *  @param {String} name
   *  @return Promise<Stats>
   */
  async unload(name: string) {
    return await unloadAction({
      name,
      client: this.client,
      dataDir: this.dataDir,
      log: this.log,
      osdClient: this.osdClient,
    });
  }

  /**
   *  Parse and reformat all of the archives. This is primarily helpful
   *  for working on the opensearchArchiver.
   *
   *  @return Promise<Stats>
   */
  async rebuildAll() {
    return await rebuildAllAction({
      dataDir: this.dataDir,
      log: this.log,
    });
  }

  /**
   *  Extract the gzipped files in an archive, then call the handler. When it
   *  resolves re-archive the gzipped files.
   *
   *  @param {String} prefix optional prefix to limit archives that are extracted
   *  @param {() => Promise<any>} handler
   *  @return Promise<void>
   */
  async edit(prefix: string, handler: () => Promise<void>) {
    return await editAction({
      prefix,
      log: this.log,
      dataDir: this.dataDir,
      handler,
    });
  }

  /**
   *  Just like load, but skips any existing index
   *
   *  @param {String} name
   *  @return Promise<Stats>
   */
  async loadIfNeeded(name: string) {
    return await this.load(name, { skipExisting: true });
  }

  /**
   *  Delete any OpenSearchDashboards indices, and initialize the OpenSearchDashboards index as OpenSearchDashboards would do
   *  on startup.
   *
   *  @return Promise
   */
  async emptyOpenSearchDashboardsIndex() {
    await emptyOpenSearchDashboardsIndexAction({
      client: this.client,
      log: this.log,
      osdClient: this.osdClient,
    });
  }
}
