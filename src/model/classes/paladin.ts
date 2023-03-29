import { CalculationProvider } from "../../controller";
import { AttackDamageOptions, AttackSource, DamageOutput } from "../utility/attacks";
import Dice from "../utility/dice";
import { AttackModifier, Feat, FightingStyleHandler, WeaponDie } from "../utility/features";
import { PresetProvider, AccuracyProvider, Preset, AccuracyMode } from "../utility/types";
import Util from "../utility/util";
import { ClassEntity } from "./ClassEntity";
import { ClassOptions } from "./ExtrasFactory";

export class Paladin extends ClassEntity {
  public readonly name: string = 'Paladin';
  private modifiers = [3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
  private featModifiers = [3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5];
  private options: PaladinOptions
  private resources: PaladinResources
  public calculate(type: string, level: number): DamageOutput {
    let source = new AttackSource(this.accuracyProvider, this.accuracyMode, this.options.advantage, this.options.disadvantage);
    let smiteDice = this.smite(level, this.resources, this.resources.totalRounds, type == 'glaive' && level >=4);
    if (type == 'glaive') {
      return this.poleArmMaster(level, source, this.options, smiteDice);
    }
    if (this.options.greatWeaponMaster) {
      return this.greatWeaponMaster(level, source, this.options, smiteDice);
    }
    return this.regular(level, source, this.options, smiteDice);
  }

  getDescription(key: string): string {
      switch(key) {
        case 'gs':
          return 'Greatsword (no subclass)'
        case 'gwm':
          return 'Greatsword w/GWM (no subclass)'
        case 'longsword':
          return 'Longsword + dueling (no subclass)'
        case 'glaive':
          return 'Glaive w/PAM (no subclass)'
        case 'rounds':
          return 'Rounds per LR'
        case 'greatWeaponStyle':
          return 'Use GW Fighting Style'
        case 'greatWeaponMaster':
          return 'Take GWM at 4'
        case 'oncePerTurn':
          return 'Limit smites to once per turn'
        case 'highestSlotFirst':
          return 'Use highest slot for smiting first'
        default:
          return ''
      }
  }

  constructor(options: ClassOptions | null, provider: AccuracyProvider, mode: AccuracyMode) {
    super(provider, mode)
    this.validTypes = ['gs', 'gwm', 'longsword', 'glaive']
    this.options = {
      weaponType: options?.weaponType ?? WeaponDie.d8,
      baseDie: options?.baseDieSize ?? Dice.d8,
      advantage: options?.advantage ?? 0,
      disadvantage: options?.disadvantage ?? 0,
      greatWeaponStyle: options?.toggles?.get('greatWeaponStyle') ?? false,
      greatWeaponMaster: options?.toggles?.get('greatWeaponMaster') ?? false
    }
    this.resources = {
      totalRounds: options?.dials?.get('rounds') ?? 10,
      oncePerTurn: options?.toggles?.get('oncePerTurn') ?? false,
      highestFirst: options?.toggles?.get('highestSlotFirst') ?? false
    }
  }

  configure(options: ClassOptions): Paladin {
    this.options = {
      weaponType: options?.weaponType ?? WeaponDie.d8,
      baseDie: options?.baseDieSize ?? Dice.d8,
      advantage: options?.advantage ?? 0,
      disadvantage: options?.disadvantage ?? 0,
      greatWeaponStyle: options?.toggles?.get('greatWeaponStyle') ?? false,
      greatWeaponMaster: options?.toggles?.get('greatWeaponMaster') ?? false
    }
    this.resources = {
      totalRounds: options?.dials?.get('rounds') ?? 10,
      oncePerTurn: options?.toggles?.get('oncePerTurn') ?? false,
      highestFirst: options?.toggles?.get('highestSlotFirst') ?? false
    }
    return this
  }



  public presets(provider: AccuracyProvider, mode: AccuracyMode): Preset[] {
    // return [
    //   ['paladin', { name: 'Regular GS', obj: this, type: 'gs', resources: null, options: { advantage: 0, disadvantage: 0, baseDie: 2 * Dice.d6, greatWeaponStyle: true, weaponType: WeaponDie.d6x2 } }],
    //   ['paladin_gs_gwm', { name: 'Regular GS/GWM', obj: this, type: 'gwm', resources: null, options: { advantage: 0, disadvantage: 0, baseDie: 2 * Dice.d6, greatWeaponStyle: true, weaponType: WeaponDie.d6x2, greatWeaponMaster: true } }],
    //   ['paladin_snb', { name: 'Regular SnB', obj: this, type: 'longsword', resources: null, options: { advantage: 0, disadvantage: 0, baseDie: Dice.d8, greatWeaponStyle: false, weaponType: WeaponDie.d8 } }],
    //   ['paladin_pam', { name: 'Regular PAM', obj: this, type: 'glaive', resources: null, options: { advantage: 0, disadvantage: 0, baseDie: Dice.d10, greatWeaponStyle: false, weaponType: WeaponDie.d10 } }],
    //   ['paladin_gs_smite', { name: 'Paladin GS Full Smite 9rnd', obj: this, type: 'gs', resources: {highestFirst: false, oncePerTurn: false, totalRounds: 9}, options: { advantage: 0, disadvantage: 0, baseDie: 2 * Dice.d6, greatWeaponStyle: true, weaponType: WeaponDie.d6x2 } }],
    //   ['paladin_gs_smite_high', { name: 'Paladin GS Full Smite High First', obj: this, type: 'gs', resources: {highestFirst: true, oncePerTurn: false, totalRounds: 9}, options: { advantage: 0, disadvantage: 0, baseDie: 2 * Dice.d6, greatWeaponStyle: true, weaponType: WeaponDie.d6x2 } }],
    //   ['paladin_pam_smite_5', { name: 'Paladin PAM Full Smite 9rnd', obj: this, type: 'glaive', resources: {highestFirst: false, oncePerTurn: false, totalRounds: 9}, options: { advantage: 0, disadvantage: 0, baseDie: Dice.d10, greatWeaponStyle: true, weaponType: WeaponDie.d10 } }],
    //   ['paladin_gs_smite_opt', { name: 'Paladin GS Smite OPT 9rnd ', obj: this, type: 'gs', resources: {highestFirst: true, oncePerTurn: true, totalRounds: 9}, options: { advantage: 0, disadvantage: 0, baseDie: 2 * Dice.d6, greatWeaponStyle: true, weaponType: WeaponDie.d6x2 } }],
    // ]
    return [
      {name: 'Regular GS Paladin', type:'gs', obj: new Paladin(new ClassOptions(0, 0, 2*Dice.d6, 0, 2, null, WeaponDie.d6x2, new Map([['greatWeaponStyle', true]])), provider, mode)}
    ]
  }

  private poleArmMaster(level: number, source: AttackSource, options: PaladinOptions, smiteDice?: {hit: number, crit:number}) : DamageOutput {
    let modifier = this.featModifiers[level - 1];
    let extra = options.greatWeaponStyle && level > 1 ? FightingStyleHandler.greatWeapon(options.weaponType).flatDamage : 0;
    let extraDice = level < 11 ? smiteDice.hit*Dice.d8 : (1 + smiteDice.hit)*Dice.d8;
    let extraCritDice = level < 11 ? smiteDice.crit*Dice.d8 : (2+smiteDice.hit)*Dice.d8;
    let pam: AttackModifier = {flatDamage: 0, accuracy: 0};
    if (level >= 4) {pam = Feat.poleArmMaster(level, modifier, new AttackDamageOptions(Dice.d4, extra, extraDice, extraCritDice, 0, true, true), source)};
    let primary = source.weaponAttacks(level, level >= 5 ? 2 : 1, modifier, new AttackDamageOptions(options.baseDie, extra, level >= 11 ? Dice.d8: 0, 0, 0, true, true));
    return {damage: primary.damage + pam.flatDamage, accuracy: primary.accuracy}
  }

  private regular(level: number, source: AttackSource, options: PaladinOptions, smiteDice?: {hit: number, crit:number}): DamageOutput {
    let modifier = this.modifiers[level - 1];
    let extra = level > 1 ? (options.greatWeaponStyle ? FightingStyleHandler.greatWeapon(options.weaponType).flatDamage : FightingStyleHandler.dueling().flatDamage) : 0;
    let extraDice = level < 11 ? smiteDice.hit*Dice.d8 : (1 + smiteDice.hit)*Dice.d8;
    let extraCritDice = level < 11 ? smiteDice.crit*Dice.d8 : (2+smiteDice.hit)*Dice.d8; 
    return source.weaponAttacks(level, level < 5 ? 1 : 2, modifier, new AttackDamageOptions(options.baseDie, extra, extraDice, extraCritDice));
  }

  private greatWeaponMaster(level: number, source: AttackSource, options: PaladinOptions, smiteDice?: {hit: number, crit:number}): DamageOutput {
    let zero : AttackModifier = {flatDamage: 0, accuracy: 0};
    let gwfs = level >= 2 ? FightingStyleHandler.greatWeapon(options.weaponType): zero;
    let gwm = level >= 4 ? Feat.powerAttack() : zero;
    let attackModifier = this.featModifiers[level - 1] + gwm.accuracy;
    let damageModifier = this.featModifiers[level - 1] + gwm.flatDamage;
    let extra = options.greatWeaponStyle && level > 1 ? gwfs.flatDamage + damageModifier : damageModifier;
    let extraDice = level < 11 ? smiteDice.hit*Dice.d8 : (1 + smiteDice.hit)*Dice.d8;
    let extraCritDice = level < 11 ? smiteDice.crit*Dice.d8 : (2+smiteDice.hit)*Dice.d8;
    return source.weaponAttacks(level, level < 5 ? 1 : 2, attackModifier, new AttackDamageOptions(options.baseDie, extra, extraDice, extraCritDice, 0, true, false));
  }

  private smite(level: number, resources: PaladinResources, totalRounds: number, getsBonusAttack: boolean = false): {hit: number, crit:number} {
    let totalAttacks = level < 5 ? totalRounds : 2*totalRounds;
    if (getsBonusAttack) { totalAttacks += totalRounds; }
    let slots = this.getSlots(level);
    if (slots.length == 0) { return {hit: 0, crit: 0}; }
    let indexes = this.slotsToIndexes(slots, resources.highestFirst, resources.oncePerTurn ? totalRounds : totalAttacks);
    let regularDice = indexes.map(i => this.getSmiteDice(i));
    let critDice = regularDice.map(j => 2*j);
    return {hit: Util.sum(regularDice)/totalAttacks, crit: Util.sum(critDice)/totalAttacks};
  }

  private slotsToIndexes(slots: number[], highestFirst: boolean, total: number): number[] {
    let copy = structuredClone(slots);
    let slotIndexes: number[] = [];
    if (highestFirst) {
      copy.reverse().forEach((v:number, i:number) => {
        let counter = 0;
        while (counter < v) {
          slotIndexes.push(copy.length - 1 - i);
          counter += 1;
        }
      });
    } else {
      copy.forEach((v:number, i:number) => {
        let counter = 0;
        while (counter < v) {
          slotIndexes.push(i);
          counter += 1;
        }
      });
    }
    return slotIndexes.slice(0, total + 1);
  }

  /**
   * 
   * @param slotIndex 0-indexed spell level
   */
  private getSmiteDice(slotIndex:number): number {
    if (slotIndex < 0) { throw new Error('Cannot smite without slots!')}
    return Math.min(2+slotIndex, 5);
  }

  private getSlots(level: number) : number[] {
    if (level == 1) { return [];}
    if (level == 2) { return [2];}
    if (level < 5) { return [3];}
    if (level < 7) { return [4, 2];}
    if (level < 9) { return [4, 3];}
    if (level < 11) { return [4, 3, 2];}
    if (level < 13) { return [4, 3, 3];}
    if (level < 15) { return [4, 3, 3, 1];}
    if (level < 17) { return [4, 3, 3, 2];}
    if (level < 19) { return [4, 3, 3, 3, 1];}
    return [4, 3, 3, 3, 2];
  }
}

type PaladinOptions = {
  advantage: number,
  disadvantage: number,
  baseDie: number,
  greatWeaponStyle: boolean,
  weaponType: WeaponDie,
  greatWeaponMaster?: boolean
}

type PaladinResources = {
  oncePerTurn: boolean,
  highestFirst: boolean,
  totalRounds: number
}