import { CalculationProvider } from "../../controller";
import { AccuracyProvider, Preset, PresetProvider } from "../utility/types";

export class CustomData implements PresetProvider, CalculationProvider {
	public readonly name = 'Custom'
	public calculate(type: string, level: number, accuracyProvider: AccuracyProvider, accuracyMode: string, resources: any, options?: any): { damage: number; accuracy: number; } {
			return {damage: null, accuracy: null}
	}
	public presets(): [string, Preset][] {
			return [['custom', {name: "Custom Data", obj: this, type: "", resources: null, options: null}]]
	}
}