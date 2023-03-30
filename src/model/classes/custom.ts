import { CalculationProvider } from "../../controller";
import { DamageOutput } from "../utility/attacks";
import { AccuracyMode, AccuracyProvider, BaselineProvider, Preset, PresetProvider } from "../utility/types";
import { ClassEntity } from "./ClassEntity";
import { ClassOptions } from "./ExtrasFactory";
import Rogue from "./rogue";

export class CustomData extends ClassEntity {
	public name = 'Custom'
	public data: number[];
	public calculate(type: string, level: number): DamageOutput {
		return {damage: this.data[level -1], accuracy: null}
	}
	public presets(): Preset[] {
		return []
	}

	constructor(options: ClassOptions | null, provider: AccuracyProvider, mode: AccuracyMode) {
		super(provider, mode);
	}

	clone(): CustomData {
		return new CustomData(null, this.accuracyProvider, this.accuracyMode);
	}
}