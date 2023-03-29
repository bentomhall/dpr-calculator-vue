import Dice from "../utility/dice";
import {AccuracyMode, AccuracyProvider, Preset, SaveType} from "../utility/types"
import { AttackDamageOptions, AttackSource, DamageOutput } from "../utility/attacks";
import { ClassEntity } from "./ClassEntity";
import { ClassOptions } from "./ExtrasFactory";

class Cleric extends ClassEntity {
	public readonly name = 'Cleric';
	private wisModifiers = [3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
	private strModifiers = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 5, 5];
	private options: ClericOptions

	public presets(provider: AccuracyProvider, mode: AccuracyMode): Preset[] {
		// return [			
		// 	['cleric_sf_nr', { name: 'Cleric (Sacred Flame only, Blessed Strikes)', obj: this, type: 'bs', resources: null, options: {cantripDie: Dice.d8, cantripSave: 'DEX'} }],
		// 	['cleric_sf_sw100', { name: 'Cleric (BS, Sacred Flame + Sacred Weapon, 100% uptime)', obj: this, type: 'bs', resources: { uptime: 1.0, proc: 0 }, options: {cantripDie: Dice.d8, cantripSave: 'DEX'} }],
		// 	['cleric_sfps_nr', { name: 'Cleric (Sacred Flame only, Potent Spellcasting)', obj: this, type: 'ps', resources: null, options: {cantripDie: Dice.d8, cantripSave: 'DEX'} }],
		// 	['cleric_sfps_sw100', { name: 'Cleric (PS, Sacred Flame + Sacred Weapon, 100% uptime)', obj: this, type: 'ps', resources: { uptime: 1.0, proc: 0 }, options: {cantripDie: Dice.d8, cantripSave: 'DEX'} }],
		// 	['cleric_bbps_50proc', { name: 'Cleric (PS, BB, 50% proc, no advantage)', obj: this, type: 'ps-bb', resources: { uptime: 0.0, proc: 0.5 }, options: {cantripDie: Dice.d8, cantripSave: 'AC'} }],
		// 	['cleric_ttdps_nr', { name: 'Cleric (TTD only, Potent Spellcasting)', obj: this, type: 'ps', resources: null, options: {cantripDie: Dice.d12, cantripSave: 'WIS'} }],
		// ] as [string, Preset][]
		return [
			{name: 'Cleric (SF + PS)', obj: new Cleric(null, provider, mode), type:"ps"}
		]
	}

	constructor(options: ClassOptions | null, provider: AccuracyProvider, mode: AccuracyMode) {
		super(provider, mode)
		this.options = {
			cantripDie: options?.baseDieSize ?? Dice.d8,
			cantripSave: options?.saveType ?? 'DEX',
			proc: options?.procChance ?? 0,
			uptime: options?.dials?.get('uptime') ?? 0
		}
		this.validTypes = ['ps', 'bs', 'ps-bb']
	}

	configure(options: ClassOptions): Cleric {
		this.options = {
			cantripDie: options.baseDieSize,
			cantripSave: options.saveType,
			proc: options.procChance,
			uptime: options.dials?.get('uptime') ?? 0
		}
		this.wisModifiers = options.modifiers.normal
		this.strModifiers = options.modifiers.special
		return this
	}

	getDescription(key: string): string {
		switch(key) {
			case 'ps':
				return 'Potent Spellcasting'
			case 'bs':
				return 'Blessed Strikes'
			case 'ps-bb':
				return 'Potent Spellcasting w/Booming Blade'
			case 'uptime':
				return 'Spiritual Weapon uptime (decimal)'
			default:
				return ''
		}
	}

	public calculate(type: string, level: number): DamageOutput {
		let sfDamage = {damage: 0, accuracy: 0};
		if (type == 'ps-bb') {
			sfDamage = this.boomingBlade(level, this.options.proc, this.strModifiers[level -1], Dice.d8, this.accuracyProvider, this.accuracyMode);
		} else {
			sfDamage = this.regularCantrip(type, level, this.accuracyProvider, this.accuracyMode, this.options.cantripDie, this.options.cantripSave);
		}
		if (this.options.uptime) {
			let swDamage = this.sacredWeapon(this.options.uptime, level, this.accuracyProvider, this.accuracyMode);
			return {damage: sfDamage.damage + (swDamage?.damage ?? 0), accuracy: (swDamage?.accuracy ?? sfDamage.accuracy + sfDamage.accuracy)/2};
		}
		return sfDamage;
	}

	private regularCantrip(type: string, level: number, provider: AccuracyProvider, mode: AccuracyMode, die: number, targeting: SaveType): DamageOutput {
		let source = new AttackSource(provider, mode, 0, 0);
		let modifier = this.wisModifiers[level - 1];
		let extra = 0;
		if (type == 'bs' && level > 8) { extra = Dice.d8}
		else if (type == 'ps' && level > 8) { extra = modifier; }
		return source.saveCantrip(level, targeting, die, extra, modifier);
	}

	private sacredWeapon(uptime: number, level: number, provider: AccuracyProvider, mode: AccuracyMode): DamageOutput {
		if (level < 3) { return {damage: 0.0, accuracy: -1};}
		let modifier = this.wisModifiers[level - 1];
		let source = new AttackSource(provider, mode, 0, 0);
		let output = source.weaponAttacks(level, 1, modifier, new AttackDamageOptions(Dice.d8));
		return {damage: output.damage*uptime, accuracy: output.accuracy};
	}

	private boomingBlade(level: number, procRate: number, modifier: number, weaponDie: number, provider: AccuracyProvider, mode: AccuracyMode) {
		let attacks = new AttackSource(provider, mode, 0, 0);
		return attacks.boomingBlade(level, procRate, modifier, weaponDie);
	}
}

export default Cleric;

type ClericOptions = {
	cantripSave: SaveType;
	cantripDie: number;
	uptime: number;
	proc: number;
}

