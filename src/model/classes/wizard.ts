import { CalculationProvider } from "../../controller";
import { AttackDamageOptions, AttackSource, DamageOutput } from "../utility/attacks";
import Dice from "../utility/dice";
import { AccuracyMode, AccuracyProvider, Preset, PresetProvider, SaveType } from "../utility/types";
import Util from "../utility/util";
import { ClassEntity } from "./ClassEntity";
import { ClassOptions } from "./ExtrasFactory";

export class Wizard extends ClassEntity {
    public readonly name: string = 'Wizard';
    private modifiers: number[] = [3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
	private dexModifier: number[] = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 5, 5];
	protected declare options: WizardOptions
	constructor(options: ClassOptions|null, provider: AccuracyProvider, mode: AccuracyMode) {
		super(provider, mode)
		this.validTypes = ['cantrip-only', 'bladesinger']
		this.options = {
			advantage: options?.advantage ?? 0,
			disadvantage: options?.disadvantage ?? 0,
			cantripDie: options?.baseDieSize ?? Dice.d10,
			preferWeapons: options?.toggles?.get('preferWeapons') ?? false,
			procChance: options?.procChance,
			empoweredEvocation: options?.toggles?.get('empoweredEvocation') ?? false
		}
		
		if (options) {
			this.modifiers = options.modifiers.normal
			this.dexModifier = options.modifiers.special
		}
	}

	configure(options: ClassOptions): ClassEntity {
		this.options = {
			advantage: options.advantage ?? 0,
			disadvantage: options.disadvantage ?? 0,
			cantripDie: options.baseDieSize ?? Dice.d10,
			preferWeapons: options.toggles?.get('preferWeapons') ?? false,
			procChance: options.procChance,
			empoweredEvocation: options.toggles?.get('empoweredEvocation') ?? false
		}
		
		this.modifiers = options.modifiers.normal
		this.dexModifier = options.modifiers.special
		return this
	}

	getDescription(key: string): string {
		switch(key) {
			case 'cantrip-only':
				return 'Non-bladesinger, only cantrips'
			case 'bladesinger':
				return 'Bladesinger'
			case 'preferWeapons':
				return 'Focus on weapons, not spells (BS)'
			case 'empoweredEvocation':
				return 'Has Empowered Evocation'
			case 'procChance':
				return 'Booming Blade proc chance'
			default:
				return super.getDescription(key)
		}
	}

    public calculate(type: string, level: number): DamageOutput {
        if (type == 'cantrip-only') {
        	return this.cantripOnly(level, this.accuracyProvider, this.accuracyMode, this.options);
        } else if (type == 'bladesinger') {
			return this.bladesinger(level, this.accuracyProvider, this.accuracyMode, this.options);
		}
        return {damage: NaN, accuracy: NaN};
    }
    public presets(provider: AccuracyProvider, mode: AccuracyMode): Preset[] {
		// return [
		// 	['wizard_firebolt', {name: 'Wizard (firebolt only, non-evocation)', obj: this, type: 'cantrip-only', resources: null, options: {cantripDie: Dice.d10, empoweredEvocation: false, proc: 0}}],
		// 	['wizard_firebolt_ee', {name: 'Wizard (firebolt only, Evocation)', obj: this, type: 'cantrip-only', resources: null, options: {cantripDie: Dice.d10, empoweredEvocation: true, proc: 0}}],
		// 	['wizard_bladesinger_fb_rBB_1', {name: 'Wizard (bladesinger, prioritize INT, 100% proc)', obj: this, type: 'bladesinger', resources: null, options: {cantripDie: Dice.d10, empoweredEvocation: false, preferWeapons: false, proc: 1}}],
		// 	['wizard_bladesinger_BB_rBB_1', {name: 'Wizard (bladesinger, prioritize DEX, 100% proc)', obj: this, type: 'bladesinger', resources: null, options: {cantripDie: Dice.d10, empoweredEvocation: false, preferWeapons: true, proc: 1}}],
		// 	['wizard_bladesinger_fb_rBB_0', {name: 'Wizard (bladesinger, prioritize INT, 0% proc)', obj: this, type: 'bladesinger', resources: null, options: {cantripDie: Dice.d10, empoweredEvocation: false, preferWeapons: false, proc: 0}}],
		// 	['wizard_bladesinger_BB_rBB_0', {name: 'Wizard (bladesinger, prioritize DEX, 0% proc)', obj: this, type: 'bladesinger', resources: null, options: {cantripDie: Dice.d10, empoweredEvocation: false, preferWeapons: true, proc: 0}}],
		// ]
		return [
			{name: 'Wizard (FB only, non-evo)', type:'cantrip-only', obj: new Wizard(new ClassOptions(0, 0, Dice.d10, 0), provider, mode)}
		]
    }

	getConfigurables(): { common: Set<string>; toggles: Set<string>; dials: Set<string>; } {
		return {
			common: new Set(['advantage', 'disadvantage', 'procChance', 'baseDieSize']),
            toggles: new Set(['empoweredEvocation', 'preferWeapons']), 
            dials:new Set([])
		}
	}

	//firebolt or weapon until extra attack, then weapon + weapon cantrip.
	public bladesinger(level: number, accuracyProvider: AccuracyProvider, accuracyMode: AccuracyMode, options?: WizardOptions): DamageOutput {
		let weaponMod = options?.preferWeapons ? this.modifiers[level -1] : this.dexModifier[level - 1];
		let spellMod = options?.preferWeapons ? this.dexModifier[level-1] : this.modifiers[level - 1];
		let attackProvider = new AttackSource(accuracyProvider, accuracyMode, 0, 0);
		if (level < 6 && options?.preferWeapons == false) {
			let attackOptions = AttackDamageOptions.regularCantrip(level, options.cantripDie, 0, 0);
			return attackProvider.attackCantrip(level, options?.cantripDie ?? Dice.d10, spellMod, attackOptions);
		} else if (level < 6) {
			return attackProvider.boomingBlade(level, options.procChance, weaponMod);
		} else {
			let attackOptions = new AttackDamageOptions(Dice.d8, 0, 0, 0, 0, true, true);
			let weaponDamage = attackProvider.weaponAttacks(level, 1, weaponMod, attackOptions);
			let spellDamage = attackProvider.boomingBlade(level, options.procChance, weaponMod);
			let damage = weaponDamage.damage + spellDamage.damage;
			let accuracy = Util.average([weaponDamage.accuracy, spellDamage.accuracy]);
			return {damage, accuracy}
		}
	}

	private cantripOnly(level: number, accuracyProvider: AccuracyProvider, accuracyMode: AccuracyMode, options?: WizardOptions): DamageOutput {
		let modifier = this.modifiers[level - 1];
		let attacks = new AttackSource(accuracyProvider, accuracyMode, 0, 0);
		let extraDamage = level >= 10 && options?.empoweredEvocation ? modifier : 0;
		let attackOptions = AttackDamageOptions.regularCantrip(level, options.cantripDie, extraDamage, 0);
		return attacks.attackCantrip(level, 1, modifier, attackOptions);
	}
}

type WizardOptions = {
    cantripDie: number,
    empoweredEvocation: boolean,
	preferWeapons: boolean,
	procChance: number,
	advantage: number,
	disadvantage: number
}