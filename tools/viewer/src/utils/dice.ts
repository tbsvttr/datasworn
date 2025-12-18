/**
 * Dice rolling utilities
 */

export interface DiceNotation {
	count: number
	sides: number
}

export interface RollRange {
	min: number
	max: number
}

/** Parse dice notation like "1d100", "1d6", "2d10" */
export function parseDice(notation: string): DiceNotation {
	const match = notation.match(/(\d+)d(\d+)/i)
	if (match) {
		return {
			count: parseInt(match[1], 10),
			sides: parseInt(match[2], 10)
		}
	}
	return { count: 1, sides: 100 }
}

/** Roll dice and return total */
export function rollDice(notation: string): number {
	const { count, sides } = parseDice(notation)
	let total = 0
	for (let i = 0; i < count; i++) {
		total += Math.floor(Math.random() * sides) + 1
	}
	return total
}

/** Check if a roll is within a range */
export function isInRange(roll: number, range: RollRange): boolean {
	return roll >= range.min && roll <= range.max
}

/** Check if a d100 roll is a "match" (doubles like 11, 22, 33, etc.) */
export function isMatch(roll: number): boolean {
	return roll >= 11 && roll <= 99 && roll % 11 === 0
}

/** Format a roll range for display */
export function formatRollRange(range: RollRange): string {
	if (range.min === range.max) {
		return String(range.min)
	}
	return `${range.min}–${range.max}`
}
