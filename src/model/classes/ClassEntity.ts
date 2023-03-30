import { CalculationProvider } from "../../controller";
import { DamageOutput } from "../utility/attacks";
import { AccuracyMode, AccuracyProvider, Preset, PresetProvider } from "../utility/types";
import { ClassOptions } from "./ExtrasFactory";

export abstract class ClassEntity implements CalculationProvider, PresetProvider {
    public readonly name: string
    public accuracyProvider: AccuracyProvider
    public accuracyMode: AccuracyMode
    public validTypes: string[]
    constructor(accuracyProvider: AccuracyProvider, accuracyMode: AccuracyMode) {
        this.accuracyMode = accuracyMode;
        this.accuracyProvider = accuracyProvider;
    }

    configure(options: ClassOptions): ClassEntity {
        throw new Error('You need to implement me!')
    }

    calculate(type: string, level: number,): DamageOutput {
        throw new Error('Not Implemented by the abstract class')
    }

    presets(accuracyProvider: AccuracyProvider, accuracyMode: AccuracyMode): Preset[] {
        return []
    }

    getDescription(key: string) : string {
        return ''
    }

    getConfigurables(): {common: Set<string>, toggles: Set<string>, dials: Set<string>} {
        return {common: new Set(), toggles: new Set(), dials:new Set()}
    }
}