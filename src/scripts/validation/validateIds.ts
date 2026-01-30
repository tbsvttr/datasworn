import * as ID from '../../schema/common/Id.js'

const objectIdPatterns = new Map<string, RegExp>()

for (const k in ID) {
	const v = (ID as Record<string, any>)[k]
	if (typeof v.pattern !== 'string') continue

	objectIdPatterns.set(k, new RegExp(v.pattern))
}

function _isDataswornID(str: string) {
	for (const [_k, p] of objectIdPatterns) {
		if (str.match(p)) return true
	}

	return false
}

function _parseID(_str: string) {}
