import { AccuracyMode, AccuracyProvider, BaselineProvider, Preset } from "./utility/types";

class PresetCalculator {
    private _accuracyProvider: AccuracyProvider;
    private _map: Map<string, Preset>;
    private _rogue: BaselineProvider;
    
    constructor(accuracyProvider: AccuracyProvider, presets: Map<string, Preset>) {
        this._accuracyProvider = accuracyProvider;
        this._map = presets;
        this._rogue = this._map.get('red_baseline')?.obj;
    }

		public set AccuracyProvider(value: AccuracyProvider) {
			this._accuracyProvider = value;
		}

    private calculate(preset: string, level: number, accuracyMode: AccuracyMode): {red: number, raw: number, accuracy: number} {
        let {obj, type, resources, options} = this._map.get(preset)?? {obj: null, type: null, resources: null, options: null};
        if (!obj) {
            let msg = `Preset ${preset} not supported`;
            alert(msg)
            throw new Error(msg);
        }
        let raw = obj.calculate(type, level, this._accuracyProvider, accuracyMode, resources, options);
        let red = this._rogue.calculateRED(level, this._accuracyProvider, accuracyMode, 0).damage;
        return {red: raw.damage/red, raw: raw.damage, accuracy: raw.accuracy};
    }

    calculateAllLevels(preset: string, accuracyMode: AccuracyMode, customData?: (number|null)[]) : {rawData: number[], redData: number[], accuracyData: number[]} {
        let redData: number[] = [];
        let rawData: number[] = [];
        let accuracyData: number[] = [];
        for (let level=1; level <= 20; level++) {
            if (preset == 'custom') {
				let { red, raw, accuracy } = this.calculate('red_baseline', level, accuracyMode);
				let custom = customData? customData[level - 1] ?? 0 : 0;
				let customRed = custom / raw;
				redData.push(customRed);
				rawData.push(custom);
				accuracyData.push(accuracy);
			} else {
				let { red, raw, accuracy } = this.calculate(preset, level, accuracyMode);
				redData.push(red);
				rawData.push(raw);
				accuracyData.push(accuracy * 100);
			}
        }
        return {rawData, redData, accuracyData};
    }
}

export default PresetCalculator;






