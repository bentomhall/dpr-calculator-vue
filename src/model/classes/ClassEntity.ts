import { CalculationProvider } from "../../controller";
import { DamageOutput } from "../utility/attacks";
import { AccuracyMode, AccuracyProvider, Preset, PresetProvider } from "../utility/types";
import { ClassOptions } from "./ExtrasFactory";

export abstract class ClassEntity implements CalculationProvider, PresetProvider {
    public readonly name: string
    public accuracyProvider: AccuracyProvider
    public accuracyMode: AccuracyMode
    public validTypes: string[]
    protected options?: any
    protected resources?: any
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
        switch(key) {
            case 'baseDieSize':
                return 'Base damage die'
            case 'advantage':
                return 'Advantage (d)'
            case 'disadvantage':
                return 'Disadvantage (d)'
            case 'procChance':
                return 'General Proc Rate (d)'
            case 'cantripDie':
                return 'Base cantrip damage die'
            case 'saveType':
                return 'Save type (cantrips)'
            default:
                return ''
        }
    }

    getConfigurables(): {common: Set<string>, toggles: Set<string>, dials: Set<string>} {
        return {common: new Set(), toggles: new Set(), dials:new Set()}
    }

    getSummary(): string[] {
        let output = [];
        if (this.options) {
            for (let [key, value] of Object.entries(this.options)) {
                if (key == 'weaponType' || key == 'baseDieCount') { continue; }
                let description = this.getDescription(key)
                output.push(`${description}: ${value}`)
            }
        }
        if (this.resources) {
            for (let [key, value] of Object.entries(this.resources)) {
                let description = this.getDescription(key)
                output.push(`${description}: ${value}`)
            }
        }
        
        return output
    }
}