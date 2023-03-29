export type Preset = {
	name: string,
	obj: any,
	type: string,
	resources?: any | null,
	options?: any | null
}

export interface PresetProvider {
    presets(accuracyProvider: AccuracyProvider, accuracyMode: AccuracyMode): Preset[]
}

export interface BaselineProvider {
    calculateRED(level: number, provider: AccuracyProvider, mode: AccuracyMode, options: any | null): {damage: number, accuracy: number}
}

export interface AccuracyProvider {
    vsAC(level: number, mode: string, modifier: number, extraCritRange: number, rollType: string): {hit: number, crit: number}
    vsSave(level: number, mode: string, modifier: number, rollType: string, save: SaveType): {fail: number}
}

export interface ArmorProvider {
    armorForLevel(level: number, mode: AccuracyMode): number
    saveForLevel(level: number, mode: AccuracyMode, save: SaveType): number
}

export interface DataSet {
    name: string,
    raw: number[],
    red: number[],
    accuracy: number[],
    color: string
}

export interface GlobalResources {
    rounds: number
}

export type AccuracyMode = "equal" | "half" | "boss" | "ignore";
export type RollType = "flat" | "advantage" | "disadvantage" | "flat-unproficient";
export type SaveType = 'DEX' | 'WIS';