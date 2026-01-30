import {
	Kind,
	type SchemaOptions,
	type Static,
	type TSchema
} from '@sinclair/typebox'
import { omitBy } from 'lodash-es'

export type TIfThenElse<
	If extends TSchema,
	Then extends TSchema,
	Else extends TSchema | never = never
> = {
	[Kind]: 'IfThenElse'
	if: If
	then: Then
	else: Else
	static: (Static<If> & Static<Then>) | Else extends TSchema
		? Exclude<Static<Else>, Static<If>>
		: never
}

export function IfThenElse<
	If extends TSchema,
	Then extends TSchema,
	Else extends TSchema | never = never
>(
	{
		condition,
		ifTrue,
		ifFalse
	}: {
		condition: If
		ifTrue: Then
		ifFalse?: Else
	},
	options: SchemaOptions = {}
) {
	return omitBy(
		{
			...options,
			if: condition,
			// biome-ignore lint/suspicious/noThenProperty: required for JSON Schema if-then-else
			then: ifTrue,
			else: ifFalse,
			[Kind]: 'IfThenElse'
		},
		(v, _k) => typeof v === 'undefined'
	) as TIfThenElse<If, Then, Else>
}
