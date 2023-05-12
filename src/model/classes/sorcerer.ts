import { AttackDamageOptions, AttackSource, DamageOutput } from "../utility/attacks";
import Dice from "../utility/dice";
import { AccuracyProvider, Preset, AccuracyMode } from "../utility/types";
import { ClassEntity } from "./ClassEntity";
import { ClassOptions } from "./ExtrasFactory";

export class Sorcerer extends ClassEntity {
  public readonly name: string = 'Sorcerer';
  private readonly modifiers: number[] = [3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
  protected declare options: SorcererOptions
  protected declare resources: SorcererResources

  constructor(options: ClassOptions|null, provider: AccuracyProvider, mode: AccuracyMode) {
    super(provider, mode)
    this.options = {
      useQuicken: options?.toggles?.get('useQuicken') ?? false,
      cantripDie: options?.baseDieSize ?? Dice.d10,
      hasMatchingElementalAffinity: options?.toggles?.get('hasMatchingElementalAffinity') ?? false,
      advantage: options?.advantage ?? 0,
      disadvantage: options?.disadvantage ?? 0
    }
    this.resources = {
      rounds: options?.dials?.get('rounds') ?? 1
    }
    if (options) {
      this.modifiers = options.modifiers.normal
    }
    this.validTypes = ['cantrip-only']
  }

  clone(): Sorcerer {
    return new Sorcerer(this.getClassOptions(), this.accuracyProvider, this.accuracyMode);
  }

  private getClassOptions(): ClassOptions {
    return new ClassOptions(
      this.options.advantage,
      this.options.disadvantage,
      this.options.cantripDie,
      0,
      null,
      null,
      null,
      new Map([['useQuicken', this.options.useQuicken], ['hasMatchingElementalAffinity', this.options.hasMatchingElementalAffinity]]),
      new Map([['rounds', this.resources.rounds]])
    );
  }

  configure(options: ClassOptions): ClassEntity {
    this.options = {
      useQuicken: options?.toggles?.get('useQuicken') ?? false,
      cantripDie: options?.baseDieSize ?? Dice.d10,
      hasMatchingElementalAffinity: options?.toggles?.get('hasMatchingElementalAffinity') ?? false,
      advantage: options?.advantage ?? 0,
      disadvantage: options?.disadvantage ?? 0
    }
    this.resources = {
      rounds: options?.dials?.get('rounds') ?? 1
    }
    return this
  }

  getDescription(key: string): string {
      switch(key) {
        case 'cantrip-only':
          return 'Draconic, only cantrips'
        case 'useQuicken':
          return 'Use sorc. points on quicken'
        case 'hasMatchingElementalAffinity':
          return 'Cantrip damage matches draconic elemental affinity'
        case 'rounds':
          return 'Combat rounds per LR'
        default:
          return super.getDescription(key)
      }
  }

  getConfigurables(): { common: Set<string>; toggles: Set<string>; dials: Set<string>; } {
      return {
        common:new Set(['advantage', 'disadvantage', 'baseDieSize']), 
        toggles:new Set(['useQuicken', 'hasMatchingElementalAffinity']),
        dials: new Set(['rounds'])
      }
  }

  public calculate(type: string, level: number): DamageOutput {
    let modifier = this.modifiers[level - 1];
    let source = new AttackSource(this.accuracyProvider, this.accuracyMode, this.options.advantage, this.options.disadvantage);
    let extra = this.options.hasMatchingElementalAffinity && level >= 6 ? modifier : 0;
		let opt = AttackDamageOptions.regularCantrip(level, this.options.cantripDie, extra, 0);
    let regular = source.attackCantrip(level, 1, modifier, opt);
    let quicken = source.attackCantrip(level, 2, modifier, opt);
    if (type == 'cantrip-only') {
      let damage = regular.damage;
      if (this.options.useQuicken) {
        let quickenRounds = level >= 3 ? Math.min(Math.floor(level/2), this.resources.rounds) : 0;
        damage = (regular.damage * (this.resources.rounds - quickenRounds) + quickenRounds*quicken.damage)/this.resources.rounds;
      } 
      return {damage, accuracy: regular.accuracy}
    }
    return {damage: NaN, accuracy: NaN};
  }
  public presets(provider: AccuracyProvider, mode: AccuracyMode): Preset[] {
    // return [
    //   ['sorcerer_no_quicken', {name: 'Firebolt sorcerer (no quicken or EA)', type:'cantrip-only', obj: this, resources: null, options: {useQuicken: false, cantripDie: Dice.d10, matchingElementalAffinity: false}}],
    //   ['sorcerer_ea_no_quicken', {name: 'Firebolt sorcerer (EA, no quicken)', type:'cantrip-only', obj: this, resources: null, options: {useQuicken: false, cantripDie: Dice.d10, matchingElementalAffinity: true}}],
    //   ['sorcerer_quicken', {name: 'Firebolt sorcerer (no EA, quicken as much as possible, 15 rounds/day)', type:'cantrip-only', obj: this, resources: {roundsPerDay: 15}, options: {useQuicken: true, cantripDie: Dice.d10, matchingElementalAffinity: false}}],
    //   ['sorcerer_quicken_ea', {name: 'Firebolt sorcerer (EA, quicken as much as possible, 15 rounds/day)', type:'cantrip-only', obj: this, resources: {roundsPerDay: 15}, options: {useQuicken: true, cantripDie: Dice.d10, matchingElementalAffinity: true}}],
    // ]
    return [
      { name: 'Firebolt (no quicken/EA)', type:'cantrip-only', obj: new Sorcerer(null, provider, mode)}
    ]
  }
}

type SorcererOptions = {
    useQuicken: boolean;
    cantripDie: number;
    hasMatchingElementalAffinity: boolean;
    advantage: number;
    disadvantage: number;
}

type SorcererResources = {
    rounds: number;
}