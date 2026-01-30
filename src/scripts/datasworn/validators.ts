import { TypeCompiler } from '@sinclair/typebox/compiler'
import * as Metadata from '../../schema/common/Metadata.js'
import * as Text from '../../schema/common/Text.js'
import * as Generic from '../../schema/Generic.js'
import { Dictionary } from '../../schema/Generic.js'
import * as Utils from '../../schema/Utils.js'

const commonRefs = [...Object.values(Text), ...Object.values(Metadata)]

const sourcedNodeValidatorSchema = Utils.OmitOptional(Generic.SourcedNodeBase, {
	additionalProperties: true
})

/** Type validators */
const Assert = {
	SourcedNodeDictionary: TypeCompiler.Compile(
		Dictionary(sourcedNodeValidatorSchema),
		commonRefs
	),
	SourcedNode: TypeCompiler.Compile(sourcedNodeValidatorSchema, commonRefs)
}

export default Assert
