import { type Kind, type Static, type TSchema, Type } from '@sinclair/typebox'
import { DiceExpression } from '../schema/common/Rolls.js'
import type {
	Inherits,
	JsonTypeDef,
	Namespace,
	Simplify,
	Typescript
} from '../schema/Symbols.js'
import { UnionEnum } from '../schema/Utils.js'
import type { Metadata } from './json-typedef/typedef.js'

export const Keywords = {
	releaseStage: UnionEnum(['experimental', 'release'], {
		default: 'release'
	}),
	i18n: Type.Boolean({ default: false }),
	deprecated: Type.Boolean({ default: false }),
	remarks: Type.String(),
	rollable: Type.Union([Type.Boolean(), DiceExpression], {
		description:
			'This array represents rows in a rollable table. If `true`, use the `dice` property of the parent object to roll. Alternatively, provide a dice expression to use.',
		default: false
	})
} as const

type TypeParamCodeGenData = {
	/** Default value for the type parameter. */
	default?: string
	parameters?: Record<string, TypeParamCodeGenData>
	constraint?: string
}

type TypeCodeGenData = {
	id: string
	/**
	 * Key is the type generic parameter ID (e.g. `TType`).
	 */
	parameters?: Record<string, TypeParamCodeGenData>
}

declare module '@sinclair/typebox' {
	interface SchemaOptions {
		rollable?: Static<typeof Keywords.rollable>
		remarks?: Static<typeof Keywords.remarks>
		releaseStage?: Static<typeof Keywords.releaseStage>
		deprecated?: Static<typeof Keywords.deprecated>
		[Namespace]?: string
		[Inherits]?: TypeCodeGenData[]
		/** A less complex alternate version of the schema for use with code generation tools. */
		[Simplify]?: TSchema
		[Typescript]?: (identifier: string, schema: TSchema) => string
		[JsonTypeDef]?: {
			/** JTD schema to override the automatic conversion. Schema metadata will automatically be inherited from the JSON schema. */
			schema?: TSchema & { [Kind]: `TypeDef:${string}` }
			/** If true, this schema will be ignored when generating JTD schema. */
			skip?: boolean
			metadata?: Metadata
		}
	}
	interface StringOptions extends SchemaOptions {
		i18n?: Static<typeof Keywords.i18n>
	}
}

declare global {
	interface ObjectConstructor {
		keys<T extends object>(object: T): (keyof T)[]
	}
}
