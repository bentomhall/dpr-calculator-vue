import { CalculationProvider } from "../../controller";
import { AttackSource, DamageOutput } from "../utility/attacks";
import Dice from "../utility/dice";
import { WeaponDie } from "../utility/features";
import { AccuracyMode, AccuracyProvider, Preset, PresetProvider } from "../utility/types";
import { ClassEntity } from "./ClassEntity";
import { ClassOptions } from "./ExtrasFactory";

export class Barbarian extends ClassEntity{
	public readonly name: string = 'Barbarian';
	private options: BarbarianOptions
	private resources: BarbarianResources
	presets(accuracyProvider: AccuracyProvider, mode: AccuracyMode): Preset[] {
		// return [
		// 	['barbarian_no_rage', {name: 'Barbarian (no rage or reckless)', obj: this, resources: {useRage: false, roundsPerLR: 1, recklessPercent: 0, combats: 1}, type: 'no-sub', options: {weaponDieSize: Dice.d12, gWMProcRate: 0}}],
		// 	['barbarian_100_rage', {name: 'Barbarian (100% rage)', obj: this, resources: {useRage: true, roundsPerLR: 1, recklessPercent: 0, combats: 1}, type: 'no-sub', options: {weaponDieSize: Dice.d12, gWMProcRate: 0}}],
		// 	['barbarian_100_rage_reckless', {name: 'Barbarian (100% rage and reckless)', obj: this, resources: {useRage: true, roundsPerLR: 1, recklessPercent: 1, combats: 1}, type: 'no-sub', options: {weaponDieSize: Dice.d12, gWMProcRate: 0}}],
		// 	['barbarian_rage_5_lr', {name: 'Barbarian (no reckless, 5 fights per day)', obj: this, resources: {useRage: false, roundsPerLR: 15, recklessPercent: 0, combats: 5}, type: 'no-sub', options: {weaponDieSize: Dice.d12, gWMProcRate: 0, weaponDieNumber: 1}}],
		// 	['barbarian_frenzy_5_lr', {name: 'Barbarian (frenzy 1/day, no reckless, 5 fights per day)', obj: this, resources: {useRage: true, roundsPerLR: 15, recklessPercent: 0, combats: 5}, type: 'frenzy', options: {weaponDieSize: Dice.d12, gWMProcRate: 0, weaponDieNumber: 1}}],
		// 	['barbarian_gwm_rage_reckless', {name: 'Barbarian w/GWM (100% rage and reckless)', obj: this, resources: {useRage: true, roundsPerLR: 1, recklessPercent: 1, combats: 1}, type: 'gwm', options: {weaponDieSize: Dice.d12, gWMProcRate: 0.1, weaponDieNumber: 1}}],
		// 	['barbarian_100_reckless', {name: 'Barbarian (100% reckless, no rage)', obj: this, resources: {useRage: false, roundsPerLR: 1, recklessPercent: 1, combats: 1}, type: 'no-sub', options: {weaponDieSize: Dice.d12, gWMProcRate: 0}}],
		// 	['barbarian_experimental_pa', {name: 'Barbarian (crit on 10+ but no advantage)', obj: this, resources: {useRage: true, roundsPerLR: 1, recklessPercent: 1, combats: 1}, type: 'expt', options: {weaponDIeSize: Dice.d12, gWMProcRate: 0, weaponDieNumber: 1}}]
		// ];
		return [
			{name: 'Barbarian (no rage/reckless)', obj: new Barbarian(new ClassOptions(0, 0, Dice.d12, 0, 1, 'DEX', WeaponDie.d12, new Map([['useRage', false]])), accuracyProvider, this.accuracyMode), type: 'no-sub'},
			{name: 'Barbarian (100% rage)', obj: new Barbarian(new ClassOptions(0, 0, Dice.d12, 0, 1, 'DEX', WeaponDie.d12, new Map([['useRage', true]]), new Map([['roundsPerLR', 1], ['combats', 1]])), accuracyProvider, this.accuracyMode), type: 'no-sub'}
		]
	}

	constructor(options: ClassOptions, accuracyProvider: AccuracyProvider, accuracyMode: AccuracyMode) {
		super(accuracyProvider, accuracyMode)
		this.options = {
			weaponDieSize: options?.baseDieSize ?? Dice.d12,
			weaponDieNumber: options?.baseDieCount ?? 1,
			gWMProcRate: options?.dials?.get('gWMProcRate') ?? 0
		}
		this.resources = {
			useRage: options?.toggles?.get('useRage') ?? false,
			roundsPerLR: options?.dials?.get('roundsPerLR') ?? 1,
			recklessPercent: options?.dials?.get('recklessPercent') ?? 0,
			combats: options?.dials?.get('combats') ?? 1
		}
		this.validTypes = ['gwm', 'frenzy', 'expt', 'no-sub']
	}

	getDescription(key: string): string {
		switch(key) {
			case 'gwm':
				return 'Great Weapon Master (feat)'
			case 'frenzy':
				return 'Frenzy (subclass)'
			case 'expt':
				return 'Experimental'
			case 'no-sub':
				return 'No subclass selected'
			case 'combats':
				return 'Combats per rong rest'
			case 'roundsPerLR':
				return 'Combat rounds per long rest'
			case 'recklessPercent':
				return 'Fraction using Reckless Attack (decimal)'
			case 'useRage':
				return 'Use rage as much as possible'
			case 'gWMProcRate':
				return 'Proc rate (decimal) for GWM (if selected)'
			default:
				return ''
		}
	}

	configure(options: ClassOptions): ClassEntity {
		this.options = {
			weaponDieSize: options.baseDieSize ?? Dice.d12,
			weaponDieNumber: options.baseDieCount ?? 1,
			gWMProcRate: options.dials?.get('gWMProcRate') ?? 0
		}
		this.resources = {
			useRage: options.toggles?.get('useRage') ?? false,
			roundsPerLR: Math.max(options.dials?.get('roundsPerLR') ?? 1, 1),
			recklessPercent: options.dials?.get('reckless') ?? 0,
			combats: Math.max(options.dials?.get('combats') ?? 1, 1)
		}
		return this
	}

	calculate(type: string, level: number): { damage: number; accuracy: number; } {
		let modifier = type != 'gwm' ? this.modifiers[level - 1]: this.featModifiers[level -1];
		let {hit, crit} = this.accuracyProvider.vsAC(level, this.accuracyMode, modifier, 0, 'flat');
		let advantage = this.accuracyProvider.vsAC(level, this.accuracyMode, modifier, 0, 'advantage');
		let fractionRaging = this.resources.useRage ? this.percentRaging(level, this.resources.combats) : 0
		let weaponDice = (this.options.weaponDieSize ?? Dice.d12);
		let numberOfDice = this.options.weaponDieNumber ?? 1;
		let reckless = level > 1 ? this.resources.recklessPercent : 0;
		let hitDamage = numberOfDice*weaponDice + modifier + fractionRaging*this.rageBonus(level);
		let critDamage = this.critDamage(level, weaponDice, numberOfDice) + modifier + fractionRaging*this.rageBonus(level);
		let total = 0;
		if (type == 'frenzy' && level >= 3) {
			let roundsFrenzied = Math.floor(this.resources.roundsPerLR/this.resources.combats) - 1;
			let regular = this.resources.roundsPerLR - roundsFrenzied;
			let regularDamage = (1-reckless)*AttackSource.getDamageWithCrits(this.attacks(level), hitDamage, critDamage, hit, crit)+reckless*AttackSource.getDamageWithCrits(this.attacks(level), hitDamage, critDamage, advantage.hit, advantage.crit);
			let frenziedDamage = (1-reckless)*AttackSource.getDamageWithCrits(this.attacks(level) + 1, hitDamage, critDamage, hit, crit)+reckless*AttackSource.getDamageWithCrits(this.attacks(level) + 1, hitDamage, critDamage, advantage.hit, advantage.crit);
			total = (regular*regularDamage + frenziedDamage*roundsFrenzied)/this.resources.roundsPerLR;
		} else if (type == 'gwm' && level >=4) {
			let adjustedFlat = this.accuracyProvider.vsAC(level, this.accuracyMode, modifier - 5, 0, 'flat');
			let adjustedAdvantage = this.accuracyProvider.vsAC(level, this.accuracyMode, modifier - 5, 0, 'advantage');
			hitDamage += 10;
			critDamage += 10;
			total = (1-reckless)*AttackSource.getDamageWithCrits(this.attacks(level), hitDamage, critDamage, adjustedFlat.hit, adjustedFlat.crit)+reckless*AttackSource.getDamageWithCrits(this.attacks(level), hitDamage, critDamage, adjustedAdvantage.hit, adjustedAdvantage.crit);
		} else if (type == 'expt' && level >=6) {
			let modified = this.accuracyProvider.vsAC(level, this.accuracyMode, modifier, 9, 'flat');
			total = AttackSource.getDamageWithCrits(this.attacks(level), hitDamage, critDamage, modified.hit, modified.crit);
		} else {
			total = (1-reckless)*AttackSource.getDamageWithCrits(this.attacks(level), hitDamage, critDamage, hit, crit)+reckless*AttackSource.getDamageWithCrits(this.attacks(level), hitDamage, critDamage, advantage.hit, advantage.crit);
		}
		return {damage: total, accuracy: hit}
	}

	private frenzy(level: number, reckless: number, base: number, extra: number, extraMultiplied: number, roundsFrenzied: number, roundsPerLR: number, source: AttackSource): DamageOutput {
		let regularRounds = roundsPerLR - roundsFrenzied;
		let attacks = this.attacks(level);
		let modifier = this.modifiers[level -1 ];
		return {damage: NaN, accuracy: NaN};
	}

	private greatWeaponMaster(level: number, reckless: number, base: number, extra: number, extraMultiplied: number, source: AttackSource) : DamageOutput {
		return {damage: NaN, accuracy: NaN};
	}

	private modifiers = [3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 7];
	private featModifiers = [3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 7];
	private attacks(level: number) : number {
		if (level < 5) { return 1;}
		return 2;
	}

	private rageBonus(level: number): number {
		if (level < 9) { return 2}
		else if (level < 16) { return 3}
		return 4
	}

	private ragesPerDay(level: number) : number {
		if (level < 3) { return 2}
		else if (level < 6) { return 3}
		else if (level < 12) { return 4}
		else if (level < 17) { return 5}
		else if (level < 20) { return 6}
		return 1000000000; //technically unlimited, but....
	}

	private percentRaging(level: number, combats: number) : number {
		let rages = this.ragesPerDay(level);
		if (combats > rages) {
				return rages/combats;
		}
		return 1
	}

	private critDamage(level: number, die: number, numberOfDice: number) : number {
		let extra = 0;
		if (level < 9) {
			extra = 0;
		} else if (level < 13) {
			extra = 1; 
		} else if (level < 17) {
			extra = 2;
		} else {
			extra = 3;
		}
		return die*(2*numberOfDice + extra);
	}
}

type BarbarianResources = {
	useRage: boolean,
	roundsPerLR: number,
	recklessPercent: number,
    combats: number
}

type BarbarianOptions = {
	weaponDieSize: number,
	weaponDieNumber: number,
	gWMProcRate: number
}