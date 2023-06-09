import { AccuracyMode, AccuracyProvider, BaselineProvider, DataSet, GlobalResources } from "./model/utility/types";
import D20AccuracyProvider from './model/utility/accuracy'
import Rogue from './model/classes/rogue'
import { DamageOutput } from "./model/utility/attacks";
import { ClassOptions } from "./model/classes/ExtrasFactory";
import { ClassEntity } from "./model/classes/ClassEntity";
import { Barbarian } from "./model/classes/barbarian";
import Cleric from "./model/classes/cleric";
import { objectToString } from "@vue/shared";
import Druid from "./model/classes/druid";
import Fighter from "./model/classes/fighter";
import Monk from "./model/classes/monk";
import { Paladin } from "./model/classes/paladin";
import { Sorcerer } from "./model/classes/sorcerer";
import Warlock from "./model/classes/warlock";
import { Wizard } from "./model/classes/wizard";
import { Bard } from "./model/classes/bard";
import { Ranger } from "./model/classes/ranger";
import { CustomData } from "./model/classes/custom";

export interface Calculable {
    provider: CalculationProvider,
    type: string,
    label: string,
    color: string,
    customData?: (number|null)[]
}

export class InputSet implements Calculable{
    public provider: ClassEntity
    public type: string
    public options?: any
    public resources?: any
    public label: string
    public color: string
    public customData?: (number|null)[]
    public key: string

    constructor(cls: ClassEntity, type: string, label: string, color: string) {
        this.provider = cls;
        this.type = type
        this.label = label
        this.color = color
        if (cls instanceof CustomData) {
            this.customData = (cls as CustomData).data;
        }
        this.key = crypto.randomUUID();
    }
}

export interface CalculationProvider {
    calculate(type: string, level: number): DamageOutput
    getSummary(): string[]
    clone(): CalculationProvider
}

export class CalculationController {
    private accuracyMode: AccuracyMode
    private accuracyProvider: AccuracyProvider
    private baseline: BaselineProvider

    constructor(accuracyProvider?: AccuracyProvider) {
        if (accuracyProvider) { this.accuracyProvider = accuracyProvider } else { this.accuracyProvider = new D20AccuracyProvider('dmg')}
        this.accuracyMode = 'equal';
        this.baseline = new Rogue(null, this.accuracyProvider, this.accuracyMode);
    }

    public setAccuracyMode(mode: AccuracyMode) {
        this.accuracyMode = mode;
        (this.baseline as unknown as ClassEntity).accuracyMode = mode
    }

    public setAccuracyProvider(provider: AccuracyProvider) {
        this.accuracyProvider = provider;
        (this.baseline as unknown as ClassEntity).accuracyProvider = provider
    }

    public calculate(data: Calculable[]): DataSet[]  {
        let dataSets : DataSet[] = [];
        for (let d of data) {
            let output : DataSet = {
                raw: [],
                red: [],
                accuracy: [],
                color: d.color,
                name: d.label
            }
            for (let level = 1; level <= 20; level++) {
                let {raw, red, accuracy} = {raw: -1, red: -1, accuracy: -1};
                if (d.customData) {
                    let results = this.calculateCustom(d.customData[level -1], level)
                    raw = results.raw
                    red = results.red
                    accuracy = results.accuracy
                } else {
                    let results = this.calculateLevel(d, level)
                    raw = results.raw
                    red = results.red
                    accuracy = results.accuracy
                }
                output.raw.push(raw)
                output.red.push(red)
                output.accuracy.push(accuracy)
            }
            dataSets.push(output);
        }
        return dataSets
    }

    public getCalculatables(provider: AccuracyProvider, mode: AccuracyMode): Map<string, ClassEntity> {
        let map = new Map<string, ClassEntity>();
        map.set('rogue', new Rogue(null, provider, mode));
        map.set('barbarian', new Barbarian(null, provider, mode));
        map.set('cleric', new Cleric(null, provider, mode));
        map.set('druid', new Druid(null, provider, mode));
        map.set('fighter', new Fighter(null, provider, mode));
        map.set('monk', new Monk(null, provider, mode));
        map.set('paladin', new Paladin(null, provider, mode));
        map.set('sorcerer', new Sorcerer(null, provider, mode));
        map.set('warlock', new Warlock(null, provider, mode));
        map.set('wizard', new Wizard(null, provider, mode));
        map.set('bard', new Bard(null, provider, mode));
        map.set('ranger', new Ranger(null, provider, mode));
        map.set('custom', new CustomData(null, provider, mode));
        return map;
    }

    private calculateLevel(data: Calculable, level: number) : {raw: number | null, red: number | null, accuracy: number | null} {
        if (data.customData) {
            return this.calculateCustom(data.customData[level - 1], level);
        }
        let raw = data.provider.calculate(data.type, level)
        let red = this.baseline.calculateRED(level, this.accuracyProvider, this.accuracyMode, null);
        return {raw: raw.damage, red: raw.damage/red.damage, accuracy: raw.accuracy};
    }

    private calculateCustom(customData: number, level: number): {raw: number | null, red: number | null, accuracy: number} {
        let red = this.baseline.calculateRED(level, this.accuracyProvider, this.accuracyMode, null);
        return {raw: customData, red: customData ? customData/ red.damage : null , accuracy: red.accuracy}
    }
}