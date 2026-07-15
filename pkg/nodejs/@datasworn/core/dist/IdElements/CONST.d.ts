export declare const VERSION: '0.1.0';
export type VERSION = typeof VERSION;
/** The maximum depth for nesting collections, relative to the root dictionary for its type */
export declare const COLLECTION_DEPTH_MAX: 4;
export type COLLECTION_DEPTH_MAX = typeof COLLECTION_DEPTH_MAX;
export declare const COLLECTION_DEPTH_MIN: 1;
export type COLLECTION_DEPTH_MIN = typeof COLLECTION_DEPTH_MIN;
export declare const MdLinkPrefix: 'datasworn';
export type MdLinkPrefix = typeof MdLinkPrefix;
/** The separator character for Datasworn IDs. */
export declare const PathKeySep: '/';
export type PathKeySep = typeof PathKeySep;
export declare const TypeSep: '.';
export type TypeSep = typeof TypeSep;
export declare const PrefixSep: ':';
export type PrefixSep = typeof PrefixSep;
/** The wildcard character for Datasworn IDs that matches any key in a dictionary object. */
export declare const WildcardString: '*';
export type WildcardString = typeof WildcardString;
/** A globstar (recursive wildcard) representing any number of levels of in recursive collections. */
export declare const GlobstarString: '**';
export type GlobstarString = typeof GlobstarString;
/** Key in Collection that contains a dictionary object of child collections. */
export declare const CollectionsKey = "collections";
export type CollectionsKey = typeof CollectionsKey;
/** Key in Collection that contains a dictionary object of collectable items. */
export declare const ContentsKey: 'contents';
export type ContentsKey = typeof ContentsKey;
/** Key in Collection that specifies other collections that the Collection should be merged in to.  */
export declare const EnhancesKey: 'enhances';
export type EnhancesKey = typeof EnhancesKey;
/** Key in primary node that specifies other nodes replaced by this object. */
export declare const ReplacesKey: 'replaces';
export type ReplacesKey = typeof ReplacesKey;
export declare const IdKey: '_id';
export type IdKey = typeof IdKey;
export declare const SourceInfoKey: '_source';
export type SourceInfoKey = typeof SourceInfoKey;
