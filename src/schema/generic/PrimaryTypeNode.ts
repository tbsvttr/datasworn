import {
	type ObjectOptions,
	type TObject,
	type TRef,
	type TString,
	Type
} from '@sinclair/typebox'
import type { SetRequired } from 'type-fest'
import type TypeId from '../../pkg-core/IdElements/TypeId.js'
import { CssColor, SvgImageUrl, WebpImageUrl } from '../common/Metadata.js'
import { SourcedNode } from '../generic/SourcedNode.js'
import { Discriminable } from '../Utils.js'
import { Assign } from '../utils/FlatIntersect.js'
import { pascalCase } from '../utils/string.js'

const replacesDescription =
	'This node replaces all nodes that match these wildcards. References to the replaced nodes can be considered equivalent to this node.'
const PrimaryNodeBase = Type.Object({
	replaces: Type.Optional(
		Type.Array(Type.String() as TString | TRef<string>, {
			description: replacesDescription
		})
	),
	color: Type.Optional(
		Type.Ref(CssColor, {
			description:
				'An optional thematic color associated with this node. For an example, see "Basic Creature Form" (Starforged p. 337).'
		})
	),
	images: Type.Optional(
		Type.Array(
			Type.Ref(WebpImageUrl, {
				description: 'Extra images associated with this node.'
			})
		)
	),
	icon: Type.Optional(
		Type.Ref(SvgImageUrl, {
			description: 'An SVG icon associated with this collection.'
		})
	)
})

export function PrimaryTypeNode<
	TBase extends TObject,
	TType extends TypeId.Primary
>(base: TBase, type: TType, options: ObjectOptions = {}) {
	const _id = Type.Ref(`${pascalCase(type)}Id`)

	const replaces = Type.Ref(`${pascalCase(type)}IdWildcard`)

	// Explicit TObject type to avoid deep type chain
	const replacesObj = Type.Object({
		replaces: Type.Optional(
			Type.Array(replaces, { description: replacesDescription })
		)
	})
	const mixin: TObject = Assign(
		PrimaryNodeBase as TObject,
		replacesObj as TObject
	) as TObject

	// Use explicit TObject casts to break deep type chain
	const merged: TObject = Assign(mixin, base as TObject) as TObject
	const enhancedBase: TObject = Discriminable(merged, 'type', type) as TObject

	return SourcedNode(enhancedBase, _id, options) as unknown as TPrimaryTypeNode<
		TBase,
		TType
	>
}

/** Simplified type to avoid deep instantiation */
export type TPrimaryTypeNode<
	TBase extends TObject = TObject,
	TType extends TypeId.Primary = TypeId.Primary
> = TObject & { _primaryType: TType; _primaryBase: TBase }

export type PrimaryTypeNode<
	TBase extends object,
	TType extends TypeId.Primary
> = SourcedNode<Discriminable<'type', TType, TBase>>

export function PrimarySubtypeNode<
	TBase extends TObject,
	TType extends TypeId.Primary,
	TSubtypeKey extends string,
	TSubtype extends string
>(
	base: TBase,
	type: TType,
	subtypeKey: TSubtypeKey,
	subtype: TSubtype,
	options: SetRequired<ObjectOptions, '$id'>
) {
	const superType = PrimaryTypeNode(base, type)

	return Discriminable(
		superType,
		subtypeKey,
		subtype,
		options
	) as unknown as TPrimarySubtypeNode<TBase, TType, TSubtypeKey, TSubtype>
}

/** Simplified type to avoid deep instantiation */
export type TPrimarySubtypeNode<
	TBase extends TObject = TObject,
	TType extends TypeId.Primary = TypeId.Primary,
	TSubtypeKey extends string = string,
	TSubtype extends string = string
> = TPrimaryTypeNode<TBase, TType> & {
	_subtypeKey: TSubtypeKey
	_subtype: TSubtype
}
