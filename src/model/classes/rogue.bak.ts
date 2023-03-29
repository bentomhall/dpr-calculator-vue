import { CalculationProvider } from "../../controller";
import { AttackDamageOptions, AttackSource, DamageOutput } from "../utility/attacks";
import Dice from "../utility/dice";
import { AccuracyMode, AccuracyProvider, BaselineProvider, Preset, PresetProvider } from "../utility/types";
import { ClassOptions } from "./ExtrasFactory";

class Rogue implements PresetProvider, BaselineProvider, CalculationProvider {
	public readonly name = 'Rogue';
	private attacks: number = 1;
	private sneakAttackDice: number[] = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10];
	private modifiers: number[] = [3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];

	public presets() {
		return [
			['red_baseline', { name: 'Baseline Rogue', obj: this, type: 'red', resources: null, options: {advantage: 0, disadvantage: 0, baseDie: Dice.d6, useSneakAttack: true} }],
			['rogue_twf', { name: 'TWF rogue', obj: this, type: 'twf', resources: null, options: {advantage: 0, disadvantage: 0, baseDie: Dice.d6, useSneakAttack: true} }],
			['rogue_advantage', {name: 'Shortbow Rogue with constant advantage', obj: this, type: 'red', resources: null, options: {advantage: 1, disadvantage: 0, baseDie: Dice.d6, useSneakAttack: true}}],
			['rogue_no_sa', {name: 'Shortbow Rogue with no sneak attack', obj: this, type: 'red', resources: null, options: {advantage: 1, disadvantage: 0, baseDie: Dice.d6, useSneakAttack: false}}],
			['rogue_twf_no_sa', {name: 'TWF Rogue with no sneak attack', obj: this, type: 'twf', resources: null, options: {advantage: 1, disadvantage: 0, baseDie: Dice.d6, useSneakAttack: false}}],
		] as [string, Preset][]
	}

	public getConfiguration(options: ClassOptions): RogueOptions {
		return new RogueOptions(options.advantage, options.disadvantage, options.baseDieSize, options.procChance != 0);
	}

	calculate(type: string, level: number, provider: AccuracyProvider, accuracyMode: AccuracyMode, resources: RogueResources | null = null, options?: RogueOptions | null) {
		switch(type) {
			case 'red':
				return this.shortbow(level, provider, accuracyMode, options);
			case 'twf':
				return this.calculateTWF(level, provider, accuracyMode, options);
		}
	}

	private shortbow(level: number, provider: AccuracyProvider, mode: AccuracyMode, options: RogueOptions) : DamageOutput {
		let modifier = this.modifiers[level - 1];
		let attackSource = new AttackSource(provider, mode, options.advantage, options.disadvantage);
		let attackOptions = new AttackDamageOptions(options.baseDie, 0, 0, 0, 0, true, true);
		let main = attackSource.weaponAttacks(level, 1, modifier, attackOptions);
		let damage = main.damage + (options.useSneakAttack ? this.sneakAttack(level, modifier, 1, options, provider, mode) : 0);
		return {damage, accuracy: main.accuracy};
	}

	calculateRED(level: number, provider: AccuracyProvider, mode: AccuracyMode) {
		return this.shortbow(level, provider, mode, {advantage: 0, disadvantage: 0, baseDie: Dice.d6, useSneakAttack: true});
	}

	private calculateTWF(level: number, provider: AccuracyProvider, mode: AccuracyMode, options: RogueOptions) {
		let modifier = this.modifiers[level - 1];
		let attackSource = new AttackSource(provider, mode, options.advantage, options.disadvantage);
		let mainAttackOptions = new AttackDamageOptions(options.baseDie, 0, 0, 0, 0, true, true);
		let offAttackOptions = new AttackDamageOptions(options.baseDie, 0, 0, 0, 0, true, false);
		let main = attackSource.weaponAttacks(level, 1, modifier, mainAttackOptions);
		let off = attackSource.weaponAttacks(level, 1, modifier, offAttackOptions);
		let damage = main.damage + off.damage + (options.useSneakAttack ? this.sneakAttack(level, modifier, 2, options, provider, mode) : 0);
		return {damage, accuracy: main.accuracy};
	}

	private sneakAttack(level: number, modifier: number, attacks: number, options: RogueOptions, provider: AccuracyProvider, mode: AccuracyMode) : number {
		let flatChance = 1 - options.advantage - options.disadvantage;
		let advantage = provider.vsAC(level, mode, modifier, 0, 'advantage');
		let flat = provider.vsAC(level, mode, modifier, 0, 'flat');
		let sneakAttackDamage = this.sneakAttackDice[level - 1]*Dice.d6;
		let pAdvantage = advantage.hit + 2*advantage.crit;
		let pFlat = flat.hit + 2*flat.crit;
		if (attacks == 1) {
			return options.advantage * sneakAttackDamage*pAdvantage + flatChance * sneakAttackDamage*pFlat;

		}
		let procChance = {a: 2 - advantage.hit - advantage.crit, f: 2 - flat.hit - flat.crit}
		return sneakAttackDamage * (options.advantage * procChance.a * pAdvantage + flatChance * procChance.f * pFlat);
	}
}

export default Rogue;

class RogueOptions {
	advantage: number;
	disadvantage: number;
	baseDie: number;
	useSneakAttack: boolean

	constructor(advantage:number, disadvantage:number, baseDie:number = Dice.d6, useSneakAttack:boolean = true) {
		this.advantage = advantage;
		this.disadvantage = disadvantage;
		this.baseDie = baseDie;
		this.useSneakAttack = useSneakAttack;
	}
}

class RogueResources {
	rounds: number = 0
}