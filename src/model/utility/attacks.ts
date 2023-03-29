import Dice from "./dice";
import { AccuracyProvider, AccuracyMode, SaveType } from "./types";
import Util from "./util";

export class AttackSource {
	private provider: AccuracyProvider;
	private options: AccuracyOptions;

	constructor(provider: AccuracyProvider, mode: AccuracyMode, advantage: number = 0, disadvantage: number = 0) {
		this.provider = provider;
		if (advantage + disadvantage > 1) { throw new Error('advantage + disadvantage must be <= 1');}
		this.options = {
			mode,
			advantage,
			disadvantage
		}
	}
	public boomingBlade(level: number, procRate: number, modifier: number, weaponDie: number = Dice.d8) : {damage: number, accuracy: number} {
		// let dmg = weaponDie + modifier;
		let extraDice = 0;
		let extraStatic = 0;
		if (level < 5) {
			extraStatic = procRate*Dice.d8
			extraDice = 0
		}
		else if (level < 9) {
			extraStatic = procRate*2*Dice.d8
			extraDice = Dice.d8
		}
		else if (level < 11) {
			extraStatic = procRate*2*Dice.d8
			extraDice = 2*Dice.d8
		}
		else if (level < 17) {
			extraStatic = procRate*3*Dice.d8
			extraDice = 3*Dice.d8
		}
		else {
			extraStatic = procRate*4*Dice.d8
			extraDice = 4*Dice.d8
		}
		
		let options = new AttackDamageOptions(weaponDie, extraStatic, extraDice, 0, 0, true, true );
		return this.damageWithVariableAccuracy(level, 1, modifier, options);
	}

	public attackCantrip(level:number, attacks: number, modifier: number, options: AttackDamageOptions) : DamageOutput {
		return this.damageWithVariableAccuracy(level, attacks, modifier, options);
	}

	public saveCantrip(level: number, targeting: SaveType, baseDie: number, extraPerHit: number, modifier: number) : DamageOutput {
		let {fail} = this.provider.vsSave(level, this.options.mode, modifier, 'flat', targeting );
		let dice = this.calculateCantripDice(level);
		let baseDamage = dice*baseDie + extraPerHit;
		return {damage: fail*baseDamage, accuracy: fail};
	}

	public weaponAttacks(level: number, attacks: number, modifier: number, options: AttackDamageOptions): DamageOutput {
		return this.damageWithVariableAccuracy(level, attacks, modifier, options);
	}

	public chanceToHitAtLeastOnce(level: number, modifier: number, attacks: number, extraCrit: number = 0, includeProficiency: boolean = true) : number {
		let advantage = this.provider.vsAC(level, this.options.mode, modifier, extraCrit, 'advantage');
		let disadvantage = this.provider.vsAC(level, this.options.mode, modifier, extraCrit, 'disadvantage');
		let flat = this.provider.vsAC(level, this.options.mode, modifier, extraCrit, includeProficiency ? 'flat' : 'flat-unproficient');
		let pHitAdvantage = advantage.hit + advantage.crit;
		let pHitDisadvantage = disadvantage.hit + disadvantage.crit;
		let pHitFlat = flat.hit + flat.crit;
		return this.options.advantage*this.toHitOnceOrMore(pHitAdvantage, attacks) + this.options.disadvantage*this.toHitOnceOrMore(pHitDisadvantage, attacks) + (1 - this.options.advantage - this.options.disadvantage)*this.toHitOnceOrMore(pHitFlat, attacks);
	}

	private toHitOnceOrMore(hitOrCrit: number, attacks: number) : number {
		if (attacks == 1) {
			return hitOrCrit;
		}
		return 1 - Math.pow(1-hitOrCrit, attacks);
	}

	private damageWithVariableAccuracy(level: number, attacks: number, modifier: number, options: AttackDamageOptions): DamageOutput {
		let advantage = this.provider.vsAC(level, this.options.mode, modifier, options.extraCritChance, 'advantage');
		let disadvantage = this.provider.vsAC(level, this.options.mode, modifier, options.extraCritChance, 'disadvantage');
		let flat = this.provider.vsAC(level, this.options.mode, modifier, options.extraCritChance, options.isProficient ? 'flat' : 'flat-unproficient');
		let flatChance = (1 - this.options.advantage - this.options.disadvantage);
		let onHit = options.onHit(modifier);
		let onCrit = options.onCrit(modifier);
		let advantageDamage = this.options.advantage * (AttackSource.getDamageWithCrits(attacks, onHit, onCrit, advantage.hit, advantage.crit));
		let disadvantageDamage = this.options.disadvantage * (AttackSource.getDamageWithCrits(attacks, onHit , onCrit, disadvantage.hit, disadvantage.crit) );
		let flatDamage = flatChance * (AttackSource.getDamageWithCrits(attacks, onHit, onCrit, flat.hit, flat.crit) );
		let damage = (advantageDamage + disadvantageDamage + flatDamage);
		let accuracy = this.options.advantage*advantage.hit + this.options.disadvantage*disadvantage.hit + flatChance*flat.hit;
		return {damage, accuracy};
	}

	private calculateCantripDice(level: number) : number {
		let cantripDice = 0
		if (level < 5) {
			cantripDice = 1;
		} else if (level < 11) {
			cantripDice = 2;
		} else if (level < 17) {
			cantripDice = 3
		} else {
			cantripDice = 4;
		}
		return cantripDice
	}

	static getDamageWithCrits(attacks:number, damagePerHit:number, damagePerCrit:number, hitChance:number, critChance:number): number {
		return attacks*(damagePerCrit*critChance + damagePerHit*hitChance);
	}
}

export type AccuracyOptions = {
	mode: AccuracyMode,
	advantage: number,
	disadvantage: number
}

export type DamageOutput = {
	damage: number,
	accuracy: number
}



export class AttackDamageOptions {
	baseDice: number = 0
	staticDamage: number = 0
	extraDice: number = 0
	extraDiceOnCrit: number = 0
	extraCritChance: number = 0
	isProficient: boolean = true
	addsModifier: boolean = true

	constructor(base: number, staticDamage :number = 0, extraDamageDice: number = 0, extraCritDice: number = 0, extraCritChance: number = 0, isProficient: boolean = true, addsModifier: boolean = true) {
		this.baseDice = base;
		this.staticDamage = staticDamage;
		this.extraCritChance = extraCritChance;
		this.extraDice = extraDamageDice;
		this.extraDiceOnCrit = extraCritDice;
		this.isProficient = isProficient;
		this.addsModifier = addsModifier;
	}

	static regularCantrip(level: number, baseDie: number, extraStatic: number = 0, extraDice: number = 0) : AttackDamageOptions {
		let base = AttackDamageOptions.calculateCantripDice(level)*baseDie;
		return new AttackDamageOptions(base, extraStatic, extraDice, 0, 0, true, false)
	}

	onHit(modifier: number) : number {
		let damage = this.baseDice;
		if (this.addsModifier) {
			damage += modifier
		}
		damage += this.staticDamage;
		damage += this.extraDice;
		return damage;
	}

	onCrit(modifier: number) : number {
		let damage = 2*(this.baseDice + this.extraDice);
		if (this.addsModifier) { damage += modifier; }
		damage += this.staticDamage;
		damage += this.extraDiceOnCrit;
		return damage;
	}

	private static calculateCantripDice(level: number) : number {
		let cantripDice = 0
		if (level < 5) {
			cantripDice = 1;
		} else if (level < 11) {
			cantripDice = 2;
		} else if (level < 17) {
			cantripDice = 3
		} else {
			cantripDice = 4;
		}
		return cantripDice
	}
}