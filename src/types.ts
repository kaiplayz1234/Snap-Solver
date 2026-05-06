/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AIResult {
  answer: string;
  explanation?: string;
  easiestWay?: string;
}

export type AppState = 'idle' | 'capturing' | 'processing' | 'result';
