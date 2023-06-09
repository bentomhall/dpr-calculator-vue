import { CalculationProvider } from "../../controller";
import { AttackDamageOptions, AttackSource, DamageOutput } from "../utility/attacks";
import Dice from "../utility/dice";
import { WeaponDie } from "../utility/features";
import { PresetProvider, AccuracyProvider, Preset, AccuracyMode, SaveType } from "../utility/types";
import { ClassEntity } from "./ClassEntity";
import { ClassOptions } from "./ExtrasFactory";

export class Bard extends ClassEntity {
    public readonly name: string = 'Bard';
    private chaModifiers: number[] = [3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]
    private dexModifiers: number[] = [3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]
    protected declare options: BardOptions
    constructor(options: ClassOptions|null, provider: AccuracyProvider, mode: AccuracyMode) {
        super(provider, mode)
        if (options) {
            this.options = {
                advantage: options.advantage,
                disadvantage: options.disadvantage,
                saveType: options.saveType,
                baseDieSize: options.baseDieSize
            }
            this.chaModifiers = options.modifiers.normal
            this.dexModifiers = options.modifiers.normal
        } else {
            this.options = {
                advantage: 0,
                disadvantage: 0,
                saveType: 'WIS',
                baseDieSize: Dice.d4
            }
        }
        this.validTypes = ['cantrip-only', 'sword']
    }
    clone() : Bard {
        return new Bard(this.getClassOptions(), this.accuracyProvider, this.accuracyMode);
    }
    configure(options: ClassOptions): ClassEntity {
        this.options = {
            advantage: options.advantage,
            disadvantage: options.disadvantage,
            saveType: options.saveType,
            baseDieSize: options.baseDieSize
        }
        this.chaModifiers = options.modifiers.normal
        this.dexModifiers = options.modifiers.normal
        return this
    }
    getDescription(key: string): string {
        switch(key) {
            case 'cantrip-only':
                return 'Uses only cantrips'
            case 'sword':
                return 'Uses only rapier'
            default:
                return super.getDescription(key)
        }
    }
    calculate(type: string, level: number): DamageOutput {
        let modifier = type == 'cantrip-only' ? this.chaModifiers[level -1] : this.dexModifiers[level -1]
        let advantage = type == 'sword' ? this.options.advantage : 0
        let disadvantage = type == 'sword' ? this.options.disadvantage : 0
        let attackSource = new AttackSource(this.accuracyProvider, this.accuracyMode, advantage, disadvantage)
        if (type == 'cantrip-only') {
            return attackSource.saveCantrip(level, this.options.saveType, this.options.baseDieSize, 0, modifier)
        } else {
            return attackSource.weaponAttacks(level, 1, modifier, new AttackDamageOptions(this.options.baseDieSize, 0, 0, 0, 0, true, true))
        }
    }

    presets(accuracyProvider: AccuracyProvider, accuracyMode: AccuracyMode): Preset[] {
        return [
            {name: 'Bard (VM only)', type:'cantrip-only', obj: new Bard(null, accuracyProvider, accuracyMode)},
            {name: 'Bard (rapier only)', type:'sword', obj: new Bard(new ClassOptions(0, 0, Dice.d8, 0, 1, null, WeaponDie.d8), accuracyProvider, accuracyMode)}
        ]
    }

    getConfigurables(): { common: Set<string>; toggles: Set<string>; dials: Set<string>; } {
        return {
            common: new Set(['advantage', 'disadvantage', 'saveType', 'baseDieSize']),
            toggles: new Set(),
            dials: new Set()
        }
    }

    private getClassOptions(): ClassOptions {
        return new ClassOptions(this.options.advantage, this.options.disadvantage, this.options.baseDieSize, 0, 0, this.options.saveType)
    }
}

type BardOptions = {
    advantage: number,
    disadvantage: number,
    saveType: SaveType,
    baseDieSize: number
}
