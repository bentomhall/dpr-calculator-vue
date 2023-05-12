import Util from "../utility/util";
import Dice from "../utility/dice";
import { AccuracyMode, AccuracyProvider, Preset } from "../utility/types";
import { AttackDamageOptions, AttackSource, DamageOutput } from "../utility/attacks";
import { ClassEntity } from "./ClassEntity";
import { ClassOptions } from "./ExtrasFactory";
class Druid extends ClassEntity {
	public readonly name = 'Druid';
	private modifiers = [3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
	protected declare options: DruidOptions

	presets(accuracyProvider: AccuracyProvider, accuracyMode: AccuracyMode): Preset[] {
		return [
			{name: 'Moon Druid (brown/polar bear only)', obj: new Druid(null, accuracyProvider, accuracyMode), type:'moon'}
		]
	}

	getDescription(key: string): string {
		switch(key) {
			case 'moon':
				return 'Circle of the Moon'
			default:
				return super.getDescription(key)
		}
	}

	getConfigurables(): { common: Set<string>; toggles: Set<string>; dials: Set<string>; } {
		return {
			common:new Set(['advantage', 'disadvantage']),
			toggles: new Set(),
			dials: new Set()
		}
	}

	constructor(options: ClassOptions | null, accuracyProvider: AccuracyProvider, accuracyMode: AccuracyMode) {
		super(accuracyProvider, accuracyMode)
		this.validTypes = ['moon']
		if (options) {
			this.modifiers = options.modifiers.normal
		}
		this.options = {advantage: options?.advantage ?? 0, disadvantage: options?.disadvantage ?? 0}
	}

	configure(options: ClassOptions): ClassEntity {
		this.modifiers = options.modifiers.normal
		this.options = {advantage: options.advantage, disadvantage: options.disadvantage}
		return this
	}

	calculate(type: string, level: number): DamageOutput {
		if (type != 'moon') { throw new Error('Not implemented');}
		if (level == 1) {
				return this.produceFlame(level);
		}
		return this.bearForm(level);
	}

	clone() : Druid {
		return new Druid(this.getClassOptions(), this.accuracyProvider, this.accuracyMode);
	}

	private getClassOptions() : ClassOptions {
		return new ClassOptions(this.options.advantage, this.options.disadvantage, 0, 0);
	}

	private produceFlame(level: number) {
		let modifier = this.modifiers[level - 1];
		let source = new AttackSource(this.accuracyProvider, this.accuracyMode, this.options.advantage, this.options.disadvantage);
		let opt = AttackDamageOptions.regularCantrip(level, Dice.d8);
		return source.attackCantrip(level, 1, modifier, opt);
	}

	private bearForm(level: number) {
		let modifier = 6;
		let damageMod = 4;
		if (level >= 6) { modifier = 7; damageMod = 5;}
		let source = new AttackSource(this.accuracyProvider, this.accuracyMode, this.options.advantage, this.options.disadvantage);
		let bite = source.weaponAttacks(level, 1, modifier, new AttackDamageOptions(Dice.d8, damageMod, 0, 0, 0, false, false));
		let claws = source.weaponAttacks(level, 1, modifier, new AttackDamageOptions(2*Dice.d6, damageMod, 0, 0, 0, false, false));
		return {damage: bite.damage + claws.damage, accuracy: Util.average([bite.accuracy, claws.accuracy])};
	}
}

export default Druid;

type DruidOptions = {
	advantage: number,
	disadvantage: number
}