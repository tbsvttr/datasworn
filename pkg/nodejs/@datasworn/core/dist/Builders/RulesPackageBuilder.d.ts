import type TypeId from '../IdElements/TypeId.js';
import { type Datasworn, type DataswornSource } from '../index.js';
import type TypeNode from '../TypeNode.js';
export type SchemaValidator<TTarget> = (data: unknown) => data is TTarget;
export type Logger = Record<'warn' | 'info' | 'debug' | 'error', (message?: unknown, ...optionalParams: unknown[]) => unknown>;
export type IdRefTracker = {
    valid: Set<string>;
    unreachable: Set<string>;
    invalid: Set<string>;
};
/**
 * Merges, assigns IDs to, and validates multiple {@link DataswornSource.RulesPackage}s to create a complete {@link Datasworn.RulesPackage} object.
 *
 * Before creating an instance use {@link RulesPackageBuilder.init} to provide validation functions.
 * */
export declare class RulesPackageBuilder<TSource extends DataswornSource.RulesPackage = DataswornSource.RulesPackage, TTarget extends Datasworn.RulesPackage = Datasworn.RulesPackage> {
    #private;
    id: string;
    static readonly postSchemaValidators: {
        readonly oracle_rollable: typeof import("../Validators/OracleRollable.js").validate;
        readonly oracle_collection: typeof import("../Validators/OracleCollection.js").validate;
    };
    static get schemaValidator(): SchemaValidator<Datasworn.RulesPackage>;
    static get sourceSchemaValidator(): SchemaValidator<DataswornSource.RulesPackage>;
    get packageType(): Datasworn.RulesPackage['type'] | undefined;
    static init({ validator, sourceValidator }: {
        validator: SchemaValidator<Datasworn.RulesPackage>;
        sourceValidator: SchemaValidator<DataswornSource.RulesPackage>;
    }): typeof RulesPackageBuilder;
    static get isInitialized(): boolean;
    readonly logger: Logger;
    readonly files: Map<string, RulesPackagePart<TSource>>;
    readonly index: Map<string, unknown>;
    countType(typeId: TypeId.Any): number;
    counter: Record<string, number>;
    mergeFiles(force?: boolean): this;
    toJSON(): TTarget;
    static validateIdRef(id: string, idTracker: IdRefTracker, tree?: (Map<string, Datasworn.RulesPackage> | Record<string, Datasworn.RulesPackage>) | null): boolean;
    validateIdRefs(idTracker: IdRefTracker, tree?: (Map<string, Datasworn.RulesPackage> | Record<string, Datasworn.RulesPackage>) | null): IdRefTracker;
    idRefs: Set<string>;
    /** Performs JSON schema validation on the built data. */
    validate(force?: boolean): this;
    build(force?: boolean): this;
    /** Top-level RulesPackage properties to omit from key sorting. */
    static readonly topLevelKeysBlackList: ["rules"];
    /** Separator character used for JSON pointers. */
    static readonly pointerSep: "/";
    /** Hash character that prepends generated JSON pointers. */
    static readonly hashChar: "#";
    /**
     *
     * @param id The `_id` of the RulesPackage to be constructed.
     * @param validator A function that validates the completed RulesPackage against the Datasworn JSON schema.
     * @param sourceValidator A function that validates the individual package file contents against the DataswornSource JSON schema.
     * @param logger The destination for logging build messages.
     */
    constructor(id: string, logger: Logger);
    errors: Map<string, unknown>;
    addFiles(...files: (RulesPackagePartData<TSource> | RulesPackagePart<TSource>)[]): this;
}
interface RulesPackagePartData<TSource extends DataswornSource.RulesPackage = DataswornSource.RulesPackage> {
    name: string;
    data: TSource;
}
declare class RulesPackagePart<TSource extends DataswornSource.RulesPackage = DataswornSource.RulesPackage> implements RulesPackagePartData<TSource> {
    #private;
    readonly logger: Logger;
    static get sourceValidator(): SchemaValidator<DataswornSource.RulesPackage>;
    name: string;
    index: Map<string, TypeNode.Primary<TypeId.Primary>>;
    get packageType(): "expansion" | "ruleset";
    get data(): TSource;
    set data(value: TSource);
    get isValidated(): boolean;
    validateSource(): boolean;
    constructor({ data, name }: RulesPackagePartData<TSource>, logger: Logger);
    init(): true;
}
export {};
