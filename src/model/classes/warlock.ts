import Util from "../utility/util";
import Dice from "../utility/dice";
import { AccuracyMode, AccuracyProvider, Preset } from "../utility/types";
import { AttackDamageOptions, AttackSource } from "../utility/attacks";
import { ClassEntity } from "./ClassEntity";
import { ClassOptions } from "./ExtrasFactory";

class Warlock extends ClassEntity {
	public readonly name = 'Warlock';
	modifiers = [3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
	protected declare options: WarlockOptions
	protected declare resources: WarlockResources

	presets(provider: AccuracyProvider, mode: AccuracyMode): Preset[] {
		// return [
		// 	['warlock_ab_nr', { name: 'Warlock (EB/AB, no hex)', obj: this, type: 'nr', resources: null, options: {hasAB: true} }],
		// 	['warlock_no_ab_nr', { name: 'Warlock (EB, no AB, no hex)', obj: this, type: 'nr', resources: null, options: {hasAB: false} }],
		// 	['warlock_ab_hex', { name: 'Warlock (EB/AB, unlimited hex)', obj: this, type: 'hex', resources: { rounds: 1, duration: 100 }, options: {hasAB: true} }],
		// ] as [string, Preset][]
		return [
			{name: 'Warlock (EB/AB, no hex)', type:'nr', obj:new Warlock(new ClassOptions(0, 0, Dice.d10, 0, 1, null, null, new Map([['hasAB', true]])), provider, mode)}
		]
	}

	getConfigurables(): { common: Set<string>; toggles: Set<string>; dials: Set<string>; } {
		return {
			common: new Set(['advantage', 'disadvantage']), 
            toggles:new Set(['hasAB']),
            dials: new Set(['rounds', 'duration'])
		}
	}

	constructor(options: ClassOptions|null, provider: AccuracyProvider, mode: AccuracyMode) {
		super(provider, mode)
		this.options = {
			advantage: options?.advantage ?? 0,
			disadvantage: options?.disadvantage ?? 0,
			hasAB: options?.toggles?.get('hasAB') ?? false
		}
		this.resources = {
			rounds: options?.dials?.get('rounds') ?? 1,
			duration: options?.dials?.get('duration') ?? 0
		}
		this.validTypes = ['nr', 'hex']
		if (options) {
			this.modifiers = options.modifiers.normal
		}
	}

	clone(): Warlock {
		return new Warlock(this.getClassOptions(), this.accuracyProvider, this.accuracyMode);
	}

	private getClassOptions(): ClassOptions {
		return new ClassOptions(
			this.options.advantage,
			this.options.disadvantage,
			4.5,
			0,
			null,
			null,
			null,
			new Map([['hasAB', this.options.hasAB]]),
			new Map([['rounds', this.resources.rounds], ['duration', this.resources.duration]])
		)
	}

	configure(options: ClassOptions): ClassEntity {
		this.options = {
			advantage: options.advantage,
			disadvantage: options.disadvantage ,
			hasAB: options.toggles?.get('hasAB') ?? false
		}
		this.resources = {
			rounds: options.dials?.get('rounds') ?? 1,
			duration: options.dials?.get('duration') ?? 0
		}
		return this
	}

	getDescription(key: string): string {
		switch(key) {
			case 'nr':
				return 'No hex'
			case 'hex':
				return 'Use slots on Hex'
			case 'hasAB':
				return 'Has Agonizing Blast'
			case 'rounds':
				return 'Combat rounds per SR'
			case 'duration':
				return 'Hex duration/cast (rounds)'
			default:
				return super.getDescription(key)
		}
	}
	
	calculate(type: string, level: number) {
		let {slots, spellLevel} = this.getSlots(level);
		let modifier = this.modifiers[level - 1];
		let hexDamage = type == 'hex' ? this.getHexUptime(this.resources.rounds, spellLevel, this.resources.duration)*Dice.d6 : 0;
		let attacks = this.getAttacks(level);
		let source = new AttackSource(this.accuracyProvider, this.accuracyMode, this.options.advantage, this.options.disadvantage);
		let attackOptions = new AttackDamageOptions(Dice.d10, 0, hexDamage, 0, 0, true, this.options.hasAB && level > 1);
		let damage = source.weaponAttacks(level, attacks, modifier, attackOptions);
		return damage
	}

	getSlots(level: number) {
		let slotLevel = Math.min(Math.ceil(level / 2), 5);
		if (level == 1) {
			return {slots: 1, spellLevel: slotLevel}
		} else {
			return {slots: 2, spellLevel: slotLevel}
		}
	}

	getAttacks(level : number) {
		if (level < 5) { return 1;}
		else if (level < 11) { return 2;}
		else if (level < 17) { return 3;}
		return 4;
	}

	getHexUptime(rounds: number, spellLevel: number, duration: number) {
		if (duration > 2*rounds) { return 1.0; }
		else if (duration > rounds && spellLevel > 2) {
			return 1.0;
		} else {
			return 1.0/Math.max(duration, rounds);
		}
	}
}

export default Warlock

type WarlockOptions = {
	hasAB: boolean,
	advantage: number,
	disadvantage: number
}

type WarlockResources = {
	rounds: number,
	duration: number
}