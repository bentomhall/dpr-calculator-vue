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
		this.validTypes = ['cantrip-only', 'bladesinger', 'magic-missile']
		this.options = {
			advantage: options?.advantage ?? 0,
			disadvantage: options?.disadvantage ?? 0,
			cantripDie: options?.baseDieSize ?? Dice.d10,
			preferWeapons: options?.toggles?.get('preferWeapons') ?? false,
			procChance: options?.procChance,
			empoweredEvocation: options?.toggles?.get('empoweredEvocation') ?? false,
			rounds: options?.dials?.get('rounds') ?? 0,
			useArcaneRecovery: options?.toggles?.get('useArcaneRecovery') ?? false,
			magicMissileRollOnce: options?.toggles?.get('magicMissileRollOnce') ?? false
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
			empoweredEvocation: options.toggles?.get('empoweredEvocation') ?? false,
			rounds: options.dials?.get('rounds') ?? 0,
			useArcaneRecovery: options.toggles?.get('useArcaneRecovery') ?? false,
			magicMissileRollOnce: options.toggles?.get('magicMissileRollOnce') ?? false
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
			case 'rounds':
				return 'Total combat rounds per day'
			case 'useArcaneRecovery':
				return 'Uses Arcane Recovery'
			case 'magic-missile':
				return 'Casts MM if slots, otherwise firebolt'
			case 'magicMissileRollOnce':
				return 'Roll MM as N*(1d4+1), not (Nd4+N)'
			default:
				return super.getDescription(key)
		}
	}

    public calculate(type: string, level: number): DamageOutput {
        if (type == 'cantrip-only') {
        	return this.cantripOnly(level);
        } else if (type == 'bladesinger') {
			return this.bladesinger(level);
		} else if (type == 'magic-missile') {
			return this.magicMissile(level)
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
			{name: 'Wizard (FB only, non-evo)', type:'cantrip-only', obj: new Wizard(new ClassOptions(0, 0, Dice.d10, 0), provider, mode)},
			{name: 'MM Mage (non-evo)', type:'magic-missile', obj: new Wizard(new ClassOptions(0, 0, Dice.d10, 0, 1, 'DEX', null, new Map([['empoweredEvocation', true], ['magicMissileRollOnce', true]]), new Map([['rounds', 10]])), provider, mode)}
		]
    }

	getConfigurables(): { common: Set<string>; toggles: Set<string>; dials: Set<string>; } {
		return {
			common: new Set(['advantage', 'disadvantage', 'procChance', 'baseDieSize']),
            toggles: new Set(['empoweredEvocation', 'preferWeapons', 'useArcaneRecovery', 'magicMissileRollOnce']), 
            dials:new Set(['rounds'])
		}
	}

	//firebolt or weapon until extra attack, then weapon + weapon cantrip.
	public bladesinger(level: number): DamageOutput {
		let weaponMod = this.options.preferWeapons ? this.modifiers[level -1] : this.dexModifier[level - 1];
		let spellMod = this.options.preferWeapons ? this.dexModifier[level-1] : this.modifiers[level - 1];
		let attackProvider = new AttackSource(this.accuracyProvider, this.accuracyMode, this.options.advantage, this.options.disadvantage);
		if (level < 6 && this.options.preferWeapons == false) {
			let attackOptions = AttackDamageOptions.regularCantrip(level, this.options.cantripDie, 0, 0);
			return attackProvider.attackCantrip(level, this.options.cantripDie ?? Dice.d10, spellMod, attackOptions);
		} else if (level < 6) {
			return attackProvider.boomingBlade(level, this.options.procChance, weaponMod);
		} else {
			let attackOptions = new AttackDamageOptions(Dice.d8, 0, 0, 0, 0, true, true);
			let weaponDamage = attackProvider.weaponAttacks(level, 1, weaponMod, attackOptions);
			let spellDamage = attackProvider.boomingBlade(level, this.options.procChance, weaponMod);
			let damage = weaponDamage.damage + spellDamage.damage;
			let accuracy = Util.average([weaponDamage.accuracy, spellDamage.accuracy]);
			return {damage, accuracy}
		}
	}

	private cantripOnly(level: number): DamageOutput {
		let modifier = this.modifiers[level - 1];
		let attacks = new AttackSource(this.accuracyProvider, this.accuracyMode, this.options.advantage, this.options.disadvantage);
		let extraDamage = level >= 10 && this.options.empoweredEvocation ? modifier : 0;
		let attackOptions = AttackDamageOptions.regularCantrip(level, this.options.cantripDie, extraDamage, 0);
		return attacks.attackCantrip(level, 1, modifier, attackOptions);
	}

	private magicMissile(level:number) :DamageOutput {
		let slots = this.getSlotsUsed(level);
		let damage = 0;
		let accuracyByRound: number[] = []
		for (let slot of slots) {
			if (slot == 0) {
				let cantrip = this.cantripOnly(level)
				accuracyByRound.push(cantrip.accuracy)
				damage += cantrip.damage
			} else {
				if (!this.options.empoweredEvocation || level < 10) {
					//rolling strategy doesn't matter
					damage += (2 + slot)*(Dice.d4+1)
				} else {
					let extra = this.options.empoweredEvocation && level >= 10 ? this.modifiers[level - 1] : 0
					if (this.options.magicMissileRollOnce) {
						damage += (2 + slot)*(Dice.d4 + 1 + extra)
					} else {
						damage += (2 + slot)*(Dice.d4 + 1) + extra
					}
				}
				accuracyByRound.push(1)
			}
		}
		return {damage: damage/this.options.rounds, accuracy:Util.average(accuracyByRound)}
	}

	private getSlotsUsed(level: number) : number[] {
		let slots = this.slots.get(level) ?? [];
		let slotIndexes: number[] = [];
		slots.reverse().forEach((v:number, i:number) => {
			let counter = 0;
			while (counter < v) {
			  slotIndexes.push(i);
			  counter += 1;
			}
		  }
		);
		if (slotIndexes.length > this.options.rounds) {
			return slotIndexes.slice(0, this.options.rounds)
		} else {
			let extraNeeded = this.options.rounds - slotIndexes.length;
			let zeros = Array(extraNeeded).fill(0);
			return slotIndexes.concat(zeros);
		}
	}
	
	private slots: Map<number, number[]> = new Map([
		[1, [2]],
		[2, [3]],
		[3, [4, 2]],
		[4, [4, 3]],
		[5, [4, 3, 2]],
		[6, [4, 3, 3]],
		[7, [4, 3, 3, 1]],
		[8, [4, 3, 3, 2]],
		[9, [4, 3, 3, 3, 1]],
		[10, [4, 3, 3, 3, 2]],
		[11, [4, 3, 3, 3, 2, 1]],
		[12, [4, 3, 3, 3, 2, 1]], 
		[13, [4, 3, 3, 3, 2, 1, 1]],
		[14, [4, 3, 3, 3, 2, 1, 1]],
		[15, [4, 3, 3, 3, 2, 1, 1, 1]],
		[16, [4, 3, 3, 3, 2, 1, 1, 1]],
		[17, [4, 3, 3, 3, 2, 1, 1, 1, 1]],
		[18, [4, 3, 3, 3, 3, 1, 1, 1, 1]],
		[19, [4, 3, 3, 3, 3, 2, 1, 1, 1]],
		[20, [4, 3, 3, 3, 2, 2, 2, 1, 1]]
	])

	private mmDamagePerSlot(slotLevel: number, characterLevel: number): number {
		
		if (!this.options.empoweredEvocation && characterLevel >= 10) {
			//rolling strategy doesn't matter
			return (2 + slotLevel)*(Dice.d4+1)
		} else {
			if (this.options.magicMissileRollOnce) {
				return (2 + slotLevel)*(Dice.d4 + 1 + this.modifiers[characterLevel - 1])
			} else {
				return (2 + slotLevel)*(Dice.d4 + 1) + this.modifiers[characterLevel - 1]
			}
		}
	}
}

type WizardOptions = {
    cantripDie: number,
    empoweredEvocation: boolean,
	preferWeapons: boolean,
	procChance: number,
	advantage: number,
	disadvantage: number,
	rounds: number,
	useArcaneRecovery: boolean,
	magicMissileRollOnce: boolean,
}