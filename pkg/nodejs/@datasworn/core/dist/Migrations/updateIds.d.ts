export type ReplacementMapData = Record<string, string | null>;
export type ReplacementMap = Map<string | RegExp, string | null>;
/**
 * Load the parsed JSON objects from `id_map.json` and/or `id_regex_map.json` in to a Map object for efficient lookup and replacement.
 */
export declare function rehydrateReplacementMaps(...data: ReplacementMapData[]): Map<string | RegExp, string | null>;
/**
 * Updates any string containing a v0.0.10 ID reference to be compatible with v0.1.0.
 * @param k The key of the JSON value.
 * @param v The JSON value.
 * @param replacementMap The record object that maps v0.0.10
 * @param unreplacedIds An optional set that contains any IDs that were unable to be replaced.
 * @example ```typescript
 * import fs from 'node:fs/promises'
 * const [replacementMap, oldJson] = await Promise.all([
 *   fs.readFile('./path/to/id_replacement_hash.json'),
 *   fs.readFile('./path/to/old_datasworn_data.json')
 * ])
 * const unreplacedIds = new Set<string>()
 *
 * // parse and do ID replacements
 * const updated = JSON.parse(oldJson, (k,v) => updateIdsInString(k,v, JSON.parse(replacementMap), unreplacedIds))
 * ```
 */
export declare function updateIdInString(k: unknown, v: unknown, replacementMap: Record<string, string | null>, unreplacedIds?: Set<string>): unknown;
/**
 * Updates markdown ID pointers and templates from v0.0.10 to v0.1.0.
 * @param md The markdown string to change.
 * @returns A new string with the replaced values.
 */
export declare function updateIdsInMarkdown(md: string, replacementMap: Record<string, string | null>, unreplacedIds?: Set<string>): string;
/** Updates a Datasworn ID string from v0.0.10 to v0.1.0. */
export declare function updateId(id: string, replacementMap: Record<string, string | null>, unreplacedIds?: Set<string>): string | null;
