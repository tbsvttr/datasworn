import {
	CloneType,
	type SchemaOptions,
	type TRef,
	type TSchema,
	Type
} from '@sinclair/typebox'
import {
	forEach,
	isEmpty,
	isNull,
	keyBy,
	mapValues,
	omit,
	omitBy,
	set
} from 'lodash-es'
import type { SetRequired, SnakeCase } from 'type-fest'
import * as Player from '../common/Player.js'
import { CollectableType, NonCollectableType, type Rules } from '../Rules.js'
import { pascalCase } from './string.js'
import { UnionEnum } from './UnionEnum.js'

/** Build-time configuration for a tag rule, used to generate TypeBox schemas. */
type TagRuleConfig =
	| TagRuleConfigPrimitive
	| TagRuleConfigEnum
	| TagRuleConfigIdRef

interface TagRuleConfigBase {
	description: string
	node_types: (CollectableType | NonCollectableType)[] | null
}

interface TagRuleConfigPrimitive extends TagRuleConfigBase {
	value_type: 'boolean' | 'integer'
	array?: boolean
}

interface TagRuleConfigEnum extends TagRuleConfigBase {
	value_type: 'enum'
	enum: string[]
	array?: boolean
}

interface TagRuleConfigIdRef extends TagRuleConfigBase {
	value_type: CollectableType | NonCollectableType
	wildcard?: boolean
}

export function generateRulesetSchemas(rulesPackage: string, rules: Rules) {
	const ConditionMeterKey = UnionEnum(
		Object.keys(rules.condition_meters),
		omit(CloneType(Player.ConditionMeterKey), 'examples', 'type')
	)

	const StatKey = UnionEnum(
		Object.keys(rules.stats),
		omit(CloneType(Player.StatKey), 'examples', 'type')
	)

	return {
		ConditionMeterKey,
		StatKey,
		// NB: Rules.tags schema shape doesn't match TagRuleConfig yet; this function is experimental
		...generateTagSchemas(
			rulesPackage,
			rules.tags as unknown as Record<SnakeCase<string>, TagRuleConfig>
		)
	}
}

function generateTagSchema(
	rulesPackage: string,
	tagKey: string,
	tagRule: TagRuleConfig
): SetRequired<TSchema, '$id' | 'description'> {
	const $id = `${pascalCase(rulesPackage) + pascalCase(tagKey)}Tag`
	const { description } = tagRule
	const options = { description, $id } as SetRequired<
		SchemaOptions,
		'$id' | 'description'
	>

	switch (tagRule.value_type) {
		case 'boolean':
		case 'integer': {
			const base = (Type as any)[pascalCase(tagRule.value_type)]()
			return tagRule.array
				? (Type.Array(base, options) as any)
				: ({ ...base, ...options } as any)
		}
		case 'enum': {
			const base = UnionEnum(tagRule.enum)
			return tagRule.array
				? (Type.Array(base, options) as any)
				: ({ ...base, ...options } as any)
		}
		case 'move':
		case 'asset':
		case 'oracle_rollable':
		case 'atlas_entry':
		case 'npc':
		case 'delve_site':
		case 'delve_site_theme':
		case 'delve_site_domain':
		case 'truth':
		case 'rarity':
			return tagRule.wildcard
				? (Type.Array(Type.Ref(`${pascalCase(tagRule.value_type)}WildcardId`), {
						description
					}) as any)
				: (Type.Ref(`${pascalCase(tagRule.value_type)}Id`, options) as any)
		default: {
			const _exhaustive: never = tagRule
			throw new Error(
				`Unknown tag value type: ${(_exhaustive as TagRuleConfig).value_type}`
			)
		}
	}
}

const anyType = [...CollectableType.enum, ...NonCollectableType.enum]

function generateTagSchemas(
	rulesPackage: SnakeCase<string>,
	tags: Record<SnakeCase<string>, TagRuleConfig>
) {
	const allowedTagProperties = Object.fromEntries(
		anyType.map((k: CollectableType | NonCollectableType) => [
			k,
			{} as Record<SnakeCase<string>, TRef>
		])
	)

	const tagSchemas: Record<string, TSchema> = {}

	forEach(tags, (tag, tagKey) => {
		const schema = generateTagSchema(rulesPackage, tagKey, tag)
		tagSchemas[schema.$id] = schema
		const pushTo = isNull(tag.node_types) ? anyType : tag.node_types

		for (const objectType of pushTo) {
			set(
				allowedTagProperties,
				[objectType, tagKey].join('.'),
				Type.Optional(Type.Ref(schema))
			)
		}
	})

	const allowedTagSchemas = omitBy(
		keyBy(
			mapValues(allowedTagProperties, (v, k) =>
				Type.Object(v, {
					$id: `${pascalCase(rulesPackage)}${pascalCase(k)}Tags`,
					additionalProperties: true
				})
			),
			(v) => v.$id
		),
		(v) => isEmpty(v.properties)
	)

	const tagNamespacesSchema = keyBy(
		mapValues(allowedTagSchemas, (v, k) =>
			Type.Object(
				{ [rulesPackage]: Type.Optional(Type.Ref(v)) },
				{
					additionalProperties: true,
					$id: k.replace(pascalCase(rulesPackage), '')
				}
			)
		),
		(v) => v.$id
	)

	console.log(tagNamespacesSchema)

	return {
		...tagNamespacesSchema,
		...tagSchemas,
		...allowedTagSchemas
	}
}

// TODO: generate dummy schemas so the overrides can be inserted later

console.log(
	generateTagSchemas('sundered_isles', {
		cursed_version_of: {
			description: 'This oracle is the cursed version of another oracle.',
			node_types: ['oracle_rollable'],
			value_type: 'oracle_rollable',
			wildcard: true
		},
		cursed_by: {
			description: 'This oracle has a cursed version.',
			node_types: ['oracle_rollable'],
			value_type: 'oracle_rollable',
			wildcard: false
		}
	})
)
