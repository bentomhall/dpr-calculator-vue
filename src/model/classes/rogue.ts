import { CalculationProvider } from "../../controller";
import { AttackDamageOptions, AttackSource, DamageOutput } from "../utility/attacks";
import Dice from "../utility/dice";
import { AccuracyMode, AccuracyProvider, BaselineProvider, Preset, PresetProvider } from "../utility/types";
import { ClassEntity } from "./ClassEntity";
import { ClassOptions } from "./ExtrasFactory";

class Rogue extends ClassEntity implements BaselineProvider {
	public readonly name = 'Rogue';
	private sneakAttackDice: number[] = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10];
	private modifiers: number[] = [3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
	protected declare options: RogueOptions
	protected declare resources: RogueResources

	public presets(accuracyProvider: AccuracyProvider, accuracyMode: AccuracyMode): Preset[] {
		return [
			{name: 'Baseline Rogue', obj:new Rogue(new ClassOptions(0, 0, Dice.d6, 1, null, null, null, new Map([['useSneakAttack', true]])), accuracyProvider, accuracyMode), type:'red'},
			{name: 'TWF Rogue', obj: new Rogue(new ClassOptions(0, 0, Dice.d6, 1, null, null, null, new Map([['useSneakAttack', true]])), accuracyProvider, accuracyMode), type:'twf'},
			{name: 'Shortbow Rogue (100% advantage)', obj: new Rogue(new ClassOptions(1, 0, Dice.d6, 1, null, null, null, new Map([['useSneakAttack', true]])), accuracyProvider, accuracyMode), type: 'red'}
		]
	}

	public constructor(options: ClassOptions | null, accuracyProvider: AccuracyProvider, accuracyMode: AccuracyMode) {
		super(accuracyProvider, accuracyMode);
		if (options) {
			this.options = new RogueOptions(options.advantage, options.disadvantage, options.baseDieSize, options?.toggles?.get('useSneakAttack') ?? false)
		} else {
			this.options = new RogueOptions(0, 0, Dice.d6, true);
		}
		this.modifiers = options?.modifiers.normal ?? [3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]
		this.validTypes = ['red', 'twf']
	}

	public configure(options: ClassOptions): Rogue {
		this.options = new RogueOptions(options.advantage, options.disadvantage, options.baseDieSize, options.toggles?.get('useSneakAttack') ?? false)
		this.modifiers = options.modifiers.normal
		return this
	}

	calculate(type: string, level: number) {
		switch(type) {
			case 'red':
				return this.shortbow(level);
			case 'twf':
				return this.calculateTWF(level);
		}
	}

	getDescription(key: string): string {
		switch(key) {
			case 'red':
				return 'Shortbow'
			case 'twf':
				return 'Two Weapon Fighting'
			case 'useSneakAttack':
				return 'Use Sneak Attack'
			default:
				return super.getDescription(key)
		}
	}

	getConfigurables(): { common: Set<string>; toggles: Set<string>; dials: Set<string>; } {
		return {
			common: new Set(['baseDieSize', 'advantage', 'disadvantage']),
            toggles: new Set(['useSneakAttack']),
            dials: new Set([])
		}
	}

	private shortbow(level: number) : DamageOutput {
		let modifier = this.modifiers[level - 1];
		let attackSource = new AttackSource(this.accuracyProvider, this.accuracyMode, this.options.advantage, this.options.disadvantage);
		let attackOptions = new AttackDamageOptions(this.options.baseDieSize, 0, 0, 0, 0, true, true);
		let main = attackSource.weaponAttacks(level, 1, modifier, attackOptions);
		let damage = main.damage + (this.options.useSneakAttack ? this.sneakAttack(level, modifier, 1) : 0);
		return {damage, accuracy: main.accuracy};
	}

	calculateRED(level: number, provider: AccuracyProvider, mode: AccuracyMode) {
		this.options = new RogueOptions(0,0,Dice.d6, true);
		this.accuracyMode = mode;
		this.accuracyProvider = provider;
		return this.shortbow(level);
	}

	private calculateTWF(level: number) {
		let modifier = this.modifiers[level - 1];
		let attackSource = new AttackSource(this.accuracyProvider, this.accuracyMode, this.options.advantage, this.options.disadvantage);
		let mainAttackOptions = new AttackDamageOptions(this.options.baseDieSize, 0, 0, 0, 0, true, true);
		let offAttackOptions = new AttackDamageOptions(this.options.baseDieSize, 0, 0, 0, 0, true, false);
		let main = attackSource.weaponAttacks(level, 1, modifier, mainAttackOptions);
		let off = attackSource.weaponAttacks(level, 1, modifier, offAttackOptions);
		let damage = main.damage + off.damage + (this.options.useSneakAttack ? this.sneakAttack(level, modifier, 2) : 0);
		return {damage, accuracy: main.accuracy};
	}

	private sneakAttack(level: number, modifier: number, attacks: number) : number {
		let flatChance = 1 - this.options.advantage - this.options.disadvantage;
		let advantage = this.accuracyProvider.vsAC(level, this.accuracyMode, modifier, 0, 'advantage');
		let flat = this.accuracyProvider.vsAC(level, this.accuracyMode, modifier, 0, 'flat');
		let sneakAttackDamage = this.sneakAttackDice[level - 1]*Dice.d6;
		let pAdvantage = advantage.hit + 2*advantage.crit;
		let pFlat = flat.hit + 2*flat.crit;
		if (attacks == 1) {
			return this.options.advantage * sneakAttackDamage*pAdvantage + flatChance * sneakAttackDamage*pFlat;

		}
		let procChance = {a: 2 - advantage.hit - advantage.crit, f: 2 - flat.hit - flat.crit}
		return sneakAttackDamage * (this.options.advantage * procChance.a * pAdvantage + flatChance * procChance.f * pFlat);
	}
}

export default Rogue;

class RogueOptions {
	advantage: number;
	disadvantage: number;
	baseDieSize: number;
	useSneakAttack: boolean

	constructor(advantage:number, disadvantage:number, baseDie:number = Dice.d6, useSneakAttack:boolean = true) {
		this.advantage = advantage;
		this.disadvantage = disadvantage;
		this.baseDieSize = baseDie;
		this.useSneakAttack = useSneakAttack;
	}
}

class RogueResources {
	rounds: number = 0
}