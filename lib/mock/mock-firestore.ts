/**
 * In-memory Firestore emulator for mock mode with JSON file persistence.
 * Implements the subset of the Firestore Admin SDK API surface
 * used across all API routes, so zero route modifications are needed.
 *
 * Every mutating operation (set/update/delete/batch/transaction) persists
 * the affected collection to `mock-data/{collectionName}.json` on disk.
 */

import * as fs from 'fs';
import * as pathModule from 'path';

const MOCK_DATA_DIR = pathModule.join(process.cwd(), 'mock-data');

// ---------------------------------------------------------------------------
// JSON serialization helpers for MockTimestamp round-tripping
// ---------------------------------------------------------------------------
function serializeForJSON(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof MockTimestamp) {
    return { _type: 'timestamp', seconds: obj.seconds, nanoseconds: obj.nanoseconds };
  }
  if (obj instanceof Date) {
    return { _type: 'date', iso: obj.toISOString() };
  }
  if (Array.isArray(obj)) return obj.map(serializeForJSON);
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key of Object.keys(obj)) {
      result[key] = serializeForJSON(obj[key]);
    }
    return result;
  }
  return obj;
}

function deserializeFromJSON(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(deserializeFromJSON);
  if (typeof obj === 'object') {
    if (obj._type === 'timestamp' && typeof obj.seconds === 'number') {
      return new MockTimestamp(obj.seconds, obj.nanoseconds || 0);
    }
    if (obj._type === 'date' && typeof obj.iso === 'string') {
      return new Date(obj.iso);
    }
    const result: any = {};
    for (const key of Object.keys(obj)) {
      result[key] = deserializeFromJSON(obj[key]);
    }
    return result;
  }
  return obj;
}

// ---------------------------------------------------------------------------
// MockTimestamp — mimics admin.firestore.Timestamp
// ---------------------------------------------------------------------------
export class MockTimestamp {
  readonly seconds: number;
  readonly nanoseconds: number;

  constructor(seconds: number, nanoseconds: number) {
    this.seconds = seconds;
    this.nanoseconds = nanoseconds;
  }

  toDate(): Date {
    return new Date(this.seconds * 1000 + this.nanoseconds / 1e6);
  }

  toMillis(): number {
    return this.seconds * 1000 + Math.floor(this.nanoseconds / 1e6);
  }

  static now(): MockTimestamp {
    const ms = Date.now();
    return new MockTimestamp(Math.floor(ms / 1000), (ms % 1000) * 1e6);
  }

  static fromDate(date: Date): MockTimestamp {
    const ms = date.getTime();
    return new MockTimestamp(Math.floor(ms / 1000), (ms % 1000) * 1e6);
  }

  static fromMillis(ms: number): MockTimestamp {
    return new MockTimestamp(Math.floor(ms / 1000), (ms % 1000) * 1e6);
  }
}

// ---------------------------------------------------------------------------
// FieldValue sentinels
// ---------------------------------------------------------------------------
class ServerTimestampSentinel {
  readonly _type = 'serverTimestamp';
}

class IncrementSentinel {
  readonly _type = 'increment';
  constructor(public readonly amount: number) {}
}

class ArrayUnionSentinel {
  readonly _type = 'arrayUnion';
  constructor(public readonly elements: any[]) {}
}

class ArrayRemoveSentinel {
  readonly _type = 'arrayRemove';
  constructor(public readonly elements: any[]) {}
}

class DeleteSentinel {
  readonly _type = 'delete';
}

type FieldValueSentinel =
  | ServerTimestampSentinel
  | IncrementSentinel
  | ArrayUnionSentinel
  | ArrayRemoveSentinel
  | DeleteSentinel;

export const MockFieldValue = {
  serverTimestamp: () => new ServerTimestampSentinel(),
  increment: (n: number) => new IncrementSentinel(n),
  arrayUnion: (...elements: any[]) => new ArrayUnionSentinel(elements),
  arrayRemove: (...elements: any[]) => new ArrayRemoveSentinel(elements),
  delete: () => new DeleteSentinel(),
};

// ---------------------------------------------------------------------------
// FieldPath
// ---------------------------------------------------------------------------
export class MockFieldPath {
  private segments: string[];
  constructor(...segments: string[]) {
    this.segments = segments;
  }

  static documentId(): MockFieldPath {
    return new MockFieldPath('__name__');
  }

  toString(): string {
    return this.segments.join('.');
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 20; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function deepClone<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof MockTimestamp) return obj as any;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (Array.isArray(obj)) return obj.map(deepClone) as any;
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key of Object.keys(obj as any)) {
      result[key] = deepClone((obj as any)[key]);
    }
    return result;
  }
  return obj;
}

function isSentinel(val: any): val is FieldValueSentinel {
  return val && typeof val === 'object' && '_type' in val;
}

function resolveSentinels(data: any, existing?: any): any {
  if (data === null || data === undefined) return data;
  if (isSentinel(data)) {
    switch (data._type) {
      case 'serverTimestamp':
        return MockTimestamp.now();
      case 'increment':
        return (typeof existing === 'number' ? existing : 0) + data.amount;
      case 'arrayUnion': {
        const arr = Array.isArray(existing) ? [...existing] : [];
        for (const el of data.elements) {
          if (!arr.some((a: any) => JSON.stringify(a) === JSON.stringify(el))) {
            arr.push(el);
          }
        }
        return arr;
      }
      case 'arrayRemove': {
        const arr = Array.isArray(existing) ? [...existing] : [];
        return arr.filter(
          (a: any) => !data.elements.some((el: any) => JSON.stringify(a) === JSON.stringify(el))
        );
      }
      case 'delete':
        return undefined;
    }
  }
  if (Array.isArray(data)) return data.map((v: any) => resolveSentinels(v));
  if (typeof data === 'object' && !(data instanceof MockTimestamp) && !(data instanceof Date)) {
    const result: any = {};
    for (const key of Object.keys(data)) {
      const resolved = resolveSentinels(data[key], existing?.[key]);
      if (resolved !== undefined) {
        result[key] = resolved;
      }
    }
    return result;
  }
  return data;
}

function getNestedValue(obj: any, path: string): any {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = current[part];
  }
  return current;
}

function compareValues(a: any, b: any): number {
  if (a === b) return 0;
  if (a === null || a === undefined) return -1;
  if (b === null || b === undefined) return 1;
  // Handle Timestamps
  if (a instanceof MockTimestamp && b instanceof MockTimestamp) {
    return a.toMillis() - b.toMillis();
  }
  if (a instanceof MockTimestamp) a = a.toMillis();
  if (b instanceof MockTimestamp) b = b.toMillis();
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (a instanceof Date) a = a.getTime();
  if (b instanceof Date) b = b.getTime();
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b);
  return String(a).localeCompare(String(b));
}

// ---------------------------------------------------------------------------
// MockDocSnapshot
// ---------------------------------------------------------------------------
export class MockDocSnapshot {
  readonly id: string;
  readonly ref: MockDocRef;
  private _data: any;

  constructor(id: string, data: any, ref: MockDocRef) {
    this.id = id;
    this._data = data ? deepClone(data) : null;
    this.ref = ref;
  }

  get exists(): boolean {
    return this._data !== null && this._data !== undefined;
  }

  data(): any {
    return this._data ? deepClone(this._data) : undefined;
  }

  get(field: string): any {
    if (!this._data) return undefined;
    return getNestedValue(this._data, field);
  }
}

// ---------------------------------------------------------------------------
// MockQuerySnapshot
// ---------------------------------------------------------------------------
export class MockQuerySnapshot {
  readonly docs: MockDocSnapshot[];

  constructor(docs: MockDocSnapshot[]) {
    this.docs = docs;
  }

  get size(): number {
    return this.docs.length;
  }

  get empty(): boolean {
    return this.docs.length === 0;
  }

  forEach(callback: (doc: MockDocSnapshot) => void): void {
    this.docs.forEach(callback);
  }
}

// ---------------------------------------------------------------------------
// MockDocRef
// ---------------------------------------------------------------------------
export class MockDocRef {
  readonly id: string;
  readonly path: string;
  private store: MockFirestore;
  private collectionName: string;

  constructor(store: MockFirestore, collectionName: string, id: string) {
    this.store = store;
    this.collectionName = collectionName;
    this.id = id;
    this.path = `${collectionName}/${id}`;
  }

  async get(): Promise<MockDocSnapshot> {
    const collection = this.store._getCollection(this.collectionName);
    const data = collection.get(this.id) ?? null;
    return new MockDocSnapshot(this.id, data, this);
  }

  async set(data: any, options?: { merge?: boolean }): Promise<void> {
    const collection = this.store._getCollection(this.collectionName);
    if (options?.merge) {
      const existing = collection.get(this.id) || {};
      const resolved = resolveSentinels(data, existing);
      collection.set(this.id, { ...deepClone(existing), ...resolved });
    } else {
      const resolved = resolveSentinels(data);
      collection.set(this.id, deepClone(resolved));
    }
    this.store._markDirty(this.collectionName);
    this.store._persist();
  }

  async update(data: any): Promise<void> {
    const collection = this.store._getCollection(this.collectionName);
    const existing = collection.get(this.id);
    if (!existing) {
      throw new Error(`Document ${this.path} does not exist for update`);
    }
    const resolved = resolveSentinels(data, existing);
    // Handle dot-notation fields (e.g., 'stats.views')
    const merged = deepClone(existing);
    for (const key of Object.keys(resolved)) {
      if (resolved[key] === undefined) {
        // FieldValue.delete()
        deleteNestedField(merged, key);
      } else if (key.includes('.')) {
        setNestedField(merged, key, resolved[key]);
      } else {
        merged[key] = resolved[key];
      }
    }
    collection.set(this.id, merged);
    this.store._markDirty(this.collectionName);
    this.store._persist();
  }

  async delete(): Promise<void> {
    const collection = this.store._getCollection(this.collectionName);
    collection.delete(this.id);
    this.store._markDirty(this.collectionName);
    this.store._persist();
  }

  collection(name: string): MockCollectionRef {
    return new MockCollectionRef(this.store, `${this.collectionName}/${this.id}/${name}`);
  }
}

function setNestedField(obj: any, path: string, value: any): void {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (current[parts[i]] === undefined || current[parts[i]] === null) {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
}

function deleteNestedField(obj: any, path: string): void {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) return;
    current = current[parts[i]];
  }
  delete current[parts[parts.length - 1]];
}

// ---------------------------------------------------------------------------
// Where clause
// ---------------------------------------------------------------------------
interface WhereClause {
  field: string;
  op: string;
  value: any;
}

interface OrderByClause {
  field: string;
  direction: 'asc' | 'desc';
}

// ---------------------------------------------------------------------------
// MockQuery
// ---------------------------------------------------------------------------
export class MockQuery {
  protected store: MockFirestore;
  protected collectionName: string;
  protected _wheres: WhereClause[];
  protected _orderBys: OrderByClause[];
  protected _limit: number | null;
  protected _offset: number | null;
  protected _startAfterDoc: MockDocSnapshot | null;

  constructor(
    store: MockFirestore,
    collectionName: string,
    wheres: WhereClause[] = [],
    orderBys: OrderByClause[] = [],
    limit: number | null = null,
    offset: number | null = null,
    startAfterDoc: MockDocSnapshot | null = null
  ) {
    this.store = store;
    this.collectionName = collectionName;
    this._wheres = wheres;
    this._orderBys = orderBys;
    this._limit = limit;
    this._offset = offset;
    this._startAfterDoc = startAfterDoc;
  }

  where(field: string | MockFieldPath | any, op: string, value: any): MockQuery {
    let fieldStr: string;
    if (typeof field === 'string') {
      fieldStr = field;
    } else if (field instanceof MockFieldPath) {
      fieldStr = field.toString();
    } else {
      // Handle real FieldPath from firebase-admin (e.g., FieldPath.documentId())
      // FieldPath.documentId() uses __name__ internally
      fieldStr = '__name__';
    }
    return new MockQuery(
      this.store,
      this.collectionName,
      [...this._wheres, { field: fieldStr, op, value }],
      this._orderBys,
      this._limit,
      this._offset,
      this._startAfterDoc
    );
  }

  orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): MockQuery {
    return new MockQuery(
      this.store,
      this.collectionName,
      this._wheres,
      [...this._orderBys, { field, direction }],
      this._limit,
      this._offset,
      this._startAfterDoc
    );
  }

  limit(n: number): MockQuery {
    return new MockQuery(
      this.store,
      this.collectionName,
      this._wheres,
      this._orderBys,
      n,
      this._offset,
      this._startAfterDoc
    );
  }

  offset(n: number): MockQuery {
    return new MockQuery(
      this.store,
      this.collectionName,
      this._wheres,
      this._orderBys,
      this._limit,
      n,
      this._startAfterDoc
    );
  }

  startAfter(doc: MockDocSnapshot): MockQuery {
    return new MockQuery(
      this.store,
      this.collectionName,
      this._wheres,
      this._orderBys,
      this._limit,
      this._offset,
      doc
    );
  }

  select(..._fields: string[]): MockQuery {
    // For simplicity, select() is a no-op (returns full documents)
    return this;
  }

  count(): { get: () => Promise<{ data: () => { count: number } }> } {
    return {
      get: async () => {
        const snapshot = await this.get();
        return {
          data: () => ({ count: snapshot.size }),
        };
      },
    };
  }

  async get(): Promise<MockQuerySnapshot> {
    const collection = this.store._getCollection(this.collectionName);
    let entries = Array.from(collection.entries());

    // Apply where clauses
    for (const clause of this._wheres) {
      entries = entries.filter(([id, data]) => {
        const fieldValue =
          clause.field === '__name__' ? id : getNestedValue(data, clause.field);
        return matchesWhere(fieldValue, clause.op, clause.value);
      });
    }

    // Apply orderBy
    if (this._orderBys.length > 0) {
      entries.sort((a, b) => {
        for (const ob of this._orderBys) {
          const va = getNestedValue(a[1], ob.field);
          const vb = getNestedValue(b[1], ob.field);
          const cmp = compareValues(va, vb);
          if (cmp !== 0) return ob.direction === 'desc' ? -cmp : cmp;
        }
        return 0;
      });
    }

    // Apply startAfter
    if (this._startAfterDoc) {
      const afterId = this._startAfterDoc.id;
      const idx = entries.findIndex(([id]) => id === afterId);
      if (idx !== -1) {
        entries = entries.slice(idx + 1);
      }
    }

    // Apply offset
    if (this._offset !== null) {
      entries = entries.slice(this._offset);
    }

    // Apply limit
    if (this._limit !== null) {
      entries = entries.slice(0, this._limit);
    }

    const docs = entries.map(
      ([id, data]) =>
        new MockDocSnapshot(
          id,
          data,
          new MockDocRef(this.store, this.collectionName, id)
        )
    );
    return new MockQuerySnapshot(docs);
  }
}

function matchesWhere(fieldValue: any, op: string, filterValue: any): boolean {
  switch (op) {
    case '==':
      return fieldValue === filterValue;
    case '!=':
      return fieldValue !== filterValue;
    case '<':
      return compareValues(fieldValue, filterValue) < 0;
    case '<=':
      return compareValues(fieldValue, filterValue) <= 0;
    case '>':
      return compareValues(fieldValue, filterValue) > 0;
    case '>=':
      return compareValues(fieldValue, filterValue) >= 0;
    case 'in':
      return Array.isArray(filterValue) && filterValue.includes(fieldValue);
    case 'not-in':
      return Array.isArray(filterValue) && !filterValue.includes(fieldValue);
    case 'array-contains':
      return Array.isArray(fieldValue) && fieldValue.includes(filterValue);
    case 'array-contains-any':
      return (
        Array.isArray(fieldValue) &&
        Array.isArray(filterValue) &&
        filterValue.some((v: any) => fieldValue.includes(v))
      );
    default:
      return true;
  }
}

// ---------------------------------------------------------------------------
// MockCollectionRef (extends MockQuery)
// ---------------------------------------------------------------------------
export class MockCollectionRef extends MockQuery {
  constructor(store: MockFirestore, collectionName: string) {
    super(store, collectionName);
  }

  doc(id?: string): MockDocRef {
    return new MockDocRef(this.store, this.collectionName, id || generateId());
  }

  async add(data: any): Promise<MockDocRef> {
    const id = generateId();
    const ref = new MockDocRef(this.store, this.collectionName, id);
    await ref.set(data);
    return ref;
  }
}

// ---------------------------------------------------------------------------
// MockWriteBatch
// ---------------------------------------------------------------------------
export class MockWriteBatch {
  private ops: Array<() => void> = [];
  private store: MockFirestore;

  constructor(store: MockFirestore) {
    this.store = store;
  }

  set(ref: MockDocRef, data: any, options?: { merge?: boolean }): MockWriteBatch {
    this.ops.push(() => {
      const collName = extractCollectionName(ref.path);
      const coll = this.store._getCollection(collName);
      if (options?.merge) {
        const existing = coll.get(ref.id) || {};
        const resolved = resolveSentinels(data, existing);
        coll.set(ref.id, { ...deepClone(existing), ...resolved });
      } else {
        const resolved = resolveSentinels(data);
        coll.set(ref.id, deepClone(resolved));
      }
      this.store._markDirty(collName);
    });
    return this;
  }

  update(ref: MockDocRef, data: any): MockWriteBatch {
    this.ops.push(() => {
      const collName = extractCollectionName(ref.path);
      const coll = this.store._getCollection(collName);
      const existing = coll.get(ref.id) || {};
      const resolved = resolveSentinels(data, existing);
      const merged = deepClone(existing);
      for (const key of Object.keys(resolved)) {
        if (resolved[key] === undefined) {
          deleteNestedField(merged, key);
        } else if (key.includes('.')) {
          setNestedField(merged, key, resolved[key]);
        } else {
          merged[key] = resolved[key];
        }
      }
      coll.set(ref.id, merged);
      this.store._markDirty(collName);
    });
    return this;
  }

  delete(ref: MockDocRef): MockWriteBatch {
    this.ops.push(() => {
      const collName = extractCollectionName(ref.path);
      const coll = this.store._getCollection(collName);
      coll.delete(ref.id);
      this.store._markDirty(collName);
    });
    return this;
  }

  create(ref: MockDocRef, data: any): MockWriteBatch {
    return this.set(ref, data);
  }

  async commit(): Promise<void> {
    for (const op of this.ops) {
      op();
    }
    this.ops = [];
    this.store._persist();
  }
}

function extractCollectionName(path: string): string {
  // "campaigns/abc123" → "campaigns"
  // "campaigns/abc123/subcol/xyz" → "campaigns/abc123/subcol"
  const parts = path.split('/');
  // Remove the last segment (document ID)
  parts.pop();
  return parts.join('/') || path;
}

// ---------------------------------------------------------------------------
// MockTransaction
// ---------------------------------------------------------------------------
export class MockTransaction {
  private store: MockFirestore;

  constructor(store: MockFirestore) {
    this.store = store;
  }

  async get(ref: MockDocRef): Promise<MockDocSnapshot> {
    return ref.get();
  }

  set(ref: MockDocRef, data: any, options?: { merge?: boolean }): MockTransaction {
    const collName = extractCollectionName(ref.path);
    const coll = this.store._getCollection(collName);
    if (options?.merge) {
      const existing = coll.get(ref.id) || {};
      const resolved = resolveSentinels(data, existing);
      coll.set(ref.id, { ...deepClone(existing), ...resolved });
    } else {
      const resolved = resolveSentinels(data);
      coll.set(ref.id, deepClone(resolved));
    }
    this.store._markDirty(collName);
    return this;
  }

  update(ref: MockDocRef, data: any): MockTransaction {
    const collName = extractCollectionName(ref.path);
    const coll = this.store._getCollection(collName);
    const existing = coll.get(ref.id) || {};
    const resolved = resolveSentinels(data, existing);
    const merged = deepClone(existing);
    for (const key of Object.keys(resolved)) {
      if (resolved[key] === undefined) {
        deleteNestedField(merged, key);
      } else if (key.includes('.')) {
        setNestedField(merged, key, resolved[key]);
      } else {
        merged[key] = resolved[key];
      }
    }
    coll.set(ref.id, merged);
    this.store._markDirty(collName);
    return this;
  }

  delete(ref: MockDocRef): MockTransaction {
    const collName = extractCollectionName(ref.path);
    const coll = this.store._getCollection(collName);
    coll.delete(ref.id);
    this.store._markDirty(collName);
    return this;
  }

  create(ref: MockDocRef, data: any): MockTransaction {
    return this.set(ref, data);
  }
}

// ---------------------------------------------------------------------------
// MockFirestore — the main store with JSON file persistence
// ---------------------------------------------------------------------------
export class MockFirestore {
  private collections: Map<string, Map<string, any>> = new Map();
  private _settingsApplied = false;
  private _dirtyCollections: Set<string> = new Set();

  constructor() {
    this._loadFromDisk();
  }

  /**
   * Load existing JSON files from mock-data/ directory on construction.
   * Returns true if any data was loaded (used by seed logic).
   */
  _loadFromDisk(): boolean {
    try {
      if (!fs.existsSync(MOCK_DATA_DIR)) return false;
      const files = fs.readdirSync(MOCK_DATA_DIR).filter(f => f.endsWith('.json'));
      if (files.length === 0) return false;

      for (const file of files) {
        const collectionName = file.replace(/\.json$/, '');
        const filePath = pathModule.join(MOCK_DATA_DIR, file);
        try {
          const raw = fs.readFileSync(filePath, 'utf-8');
          const parsed = JSON.parse(raw);
          const map = new Map<string, any>();
          for (const [docId, docData] of Object.entries(parsed)) {
            map.set(docId, deserializeFromJSON(docData));
          }
          this.collections.set(collectionName, map);
        } catch (err) {
          console.warn(`[MockFirestore] Failed to load ${file}:`, err);
        }
      }
      console.log(`[MockFirestore] Loaded ${files.length} collections from disk`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if mock-data/ directory has existing JSON files.
   */
  _hasPersistedData(): boolean {
    try {
      if (!fs.existsSync(MOCK_DATA_DIR)) return false;
      return fs.readdirSync(MOCK_DATA_DIR).some(f => f.endsWith('.json'));
    } catch {
      return false;
    }
  }

  /**
   * Persist dirty collections to mock-data/ as JSON files.
   */
  _persist(): void {
    if (this._dirtyCollections.size === 0) return;
    try {
      if (!fs.existsSync(MOCK_DATA_DIR)) {
        fs.mkdirSync(MOCK_DATA_DIR, { recursive: true });
      }
      for (const collName of this._dirtyCollections) {
        const coll = this.collections.get(collName);
        if (!coll) continue;
        const obj: Record<string, any> = {};
        for (const [docId, docData] of coll) {
          obj[docId] = serializeForJSON(docData);
        }
        // Use safe-separator for subcollection names (e.g. "campaigns/abc/sub" → "campaigns__abc__sub")
        const safeFileName = collName.replace(/\//g, '__') + '.json';
        fs.writeFileSync(
          pathModule.join(MOCK_DATA_DIR, safeFileName),
          JSON.stringify(obj, null, 2),
          'utf-8'
        );
      }
      this._dirtyCollections.clear();
    } catch (err) {
      console.warn('[MockFirestore] Persist error:', err);
    }
  }

  /**
   * Mark a collection as dirty (needs persisting).
   */
  _markDirty(collectionName: string): void {
    this._dirtyCollections.add(collectionName);
  }

  _getCollection(name: string): Map<string, any> {
    if (!this.collections.has(name)) {
      this.collections.set(name, new Map());
    }
    return this.collections.get(name)!;
  }

  collection(name: string): MockCollectionRef {
    return new MockCollectionRef(this, name);
  }

  doc(path: string): MockDocRef {
    // path like "campaigns/abc123"
    const parts = path.split('/');
    const id = parts.pop()!;
    const collectionName = parts.join('/');
    return new MockDocRef(this, collectionName, id);
  }

  batch(): MockWriteBatch {
    return new MockWriteBatch(this);
  }

  async runTransaction<T>(
    fn: (transaction: MockTransaction) => Promise<T>
  ): Promise<T> {
    const transaction = new MockTransaction(this);
    const result = await fn(transaction);
    this._persist();
    return result;
  }

  async getAll(...refs: MockDocRef[]): Promise<MockDocSnapshot[]> {
    return Promise.all(refs.map((ref) => ref.get()));
  }

  settings(_options: any): void {
    this._settingsApplied = true;
  }

  // Utility: clear all data (useful for tests)
  _clear(): void {
    this.collections.clear();
  }

  // Utility: dump all data (useful for debugging)
  _dump(): Record<string, Record<string, any>> {
    const result: Record<string, Record<string, any>> = {};
    for (const [name, coll] of this.collections) {
      result[name] = Object.fromEntries(coll);
    }
    return result;
  }
}
