import { CalculationProvider } from "../../controller";
import { AttackDamageOptions, AttackSource, DamageOutput } from "../utility/attacks";
import Dice from "../utility/dice";
import { PresetProvider, AccuracyProvider, Preset, AccuracyMode } from "../utility/types";
import { ClassEntity } from "./ClassEntity";
import { ClassOptions } from "./ExtrasFactory";

export class Ranger extends ClassEntity {
    public readonly name: string = 'Ranger';
    private modifiers: number[] = [3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]
    protected declare options: RangerOptions
    constructor(options: ClassOptions | null, provider: AccuracyProvider, mode: AccuracyMode) {
        super(provider, mode)
        this.options = {
            advantage: options?.advantage ?? 0,
            disadvantage: options?.disadvantage ?? 0,
            markUptime: options?.dials?.get('markUptime') ?? 0,
            baseDieSize: options?.baseDieSize ?? Dice.d8,
            hasArcheryFS: options?.toggles?.get('hasArcheryFS') ?? false,
            rounds: options?.dials?.get('rounds') ?? 1
        }
        if (options) {
            this.modifiers = options.modifiers.normal
        }
        this.validTypes = ['no-sub']
    }

    clone(): Ranger {
        return new Ranger(this.getClassOptions(), this.accuracyProvider, this.accuracyMode);
    }

    private getClassOptions(): ClassOptions {
        return new ClassOptions(
            this.options.advantage,
            this.options.disadvantage,
            this.options.baseDieSize,
            0, null, null, null, 
            new Map([['hasArcheryFS', this.options.hasArcheryFS]]),
            new Map([
                ['markUptime', this.options.markUptime],
                ['rounds', this.options.rounds]
            ])
        );
    }

    configure(options: ClassOptions): ClassEntity {
        this.options = {
            advantage: options.advantage ?? 0,
            disadvantage: options.disadvantage ?? 0,
            markUptime: options.dials?.get('markUptime') ?? 0,
            baseDieSize: options.baseDieSize ?? Dice.d8,
            hasArcheryFS: options.toggles?.get('hasArcheryFS') ?? false,
            rounds: options.dials?.get('rounds') ?? 1
        }
        return this
    }
    public calculate(type: string, level: number): DamageOutput {
        if (type != 'no-sub') { throw new Error('not implemented!')}
        let modifier = this.modifiers[level - 1]
        let attackModifier = this.options.hasArcheryFS && level > 1 ? modifier + 2 : modifier
        let attacks = level > 4 ? 2 : 1
        let hm = level > 1 ? this.options.markUptime * Dice.d6 : 0
        let attackProvider = new AttackSource(this.accuracyProvider, this.accuracyMode, this.options.advantage, this.options.disadvantage)
        return attackProvider.weaponAttacks(level, attacks, attackModifier, new AttackDamageOptions(this.options.baseDieSize, modifier, hm, 2*hm, 0, true, false))
    }
    public presets(provider: AccuracyProvider, mode: AccuracyMode): Preset[] {
        return [
            {name: 'Longbow Ranger (no hm)', type:'no-sub', obj: new Ranger(null, provider, mode)},
            {name: 'Longbow Ranger (archery)', type:'no-sub', obj: new Ranger(new ClassOptions(0, 0, Dice.d8, 0, 1, null, null, new Map([['archery', true]])), provider, mode)},
            {name: 'Longbow Ranger (archery + 100% hm)', type:'no-sub', obj: new Ranger(new ClassOptions(0, 0, Dice.d8, 0, 1, null, null, new Map([['archery', true]]), new Map([['markUptime', 1]])), provider, mode)},
        ]
    }

    getConfigurables(): { common: Set<string>; toggles: Set<string>; dials: Set<string>; } {
        return {
            common: new Set(['advantage', 'disadvantage', 'baseDieSize']),
            toggles: new Set(['hasArcheryFS']), 
            dials: new Set(['markUptime'])
        }
    }

    getDescription(key: string): string {
        switch(key) {
            case 'no-sub':
                return 'No subclass'
            case 'hasArcheryFS':
                return 'Archery Fighting Style'
            case 'markUptime':
                return 'Hunter\'s Mark Uptime (decimal)'
            case 'rounds':
                return 'Rounds per LR'
            default:
                return super.getDescription(key)
        }
    }
}

type RangerOptions = {
    advantage: number,
    disadvantage: number,
    markUptime: number,
    baseDieSize: number,
    hasArcheryFS: boolean,
    rounds: number
}