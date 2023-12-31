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

import { Token, CoreEditor } from '../../../types';
import { AutoCompleteContext, Term } from '../types';
import { SharedComponent } from './shared_component';

// A partial context object that can be merged into an AutoCompleteContext
export type PartialAutoCompleteContext = Partial<AutoCompleteContext>;

export interface MatchResult {
  context_values?: PartialAutoCompleteContext;
  priority?: number;
  next: SharedComponent[];
}

export class AutocompleteComponent {
  name: string;
  next: SharedComponent[];

  constructor(name: string) {
    this.name = name;
    this.next = [];
  }
  /** called to get the possible suggestions for tokens, when this object is at the end of
   * the resolving chain (and thus can suggest possible continuation paths)
   */
  getTerms(context: AutoCompleteContext, editor: CoreEditor | null): Array<Term | string> | null {
    return [];
  }
  /*
 if the current matcher matches this term, this method should return an object with the following keys
 {
 context_values: {
 values extract from term that should be added to the context
 }
 next: AutocompleteComponent(s) to use next
 priority: optional priority to solve collisions between multiple paths. Min value is used across entire chain
 }
 */
  match(
    token: string | string[] | Token,
    context: AutoCompleteContext,
    editor: CoreEditor | null
  ): MatchResult | null | false {
    return {
      next: this.next,
    };
  }
}
