import { AttackDamageOptions, AttackSource } from "./attacks";
import Dice from "./dice";

export class FightingStyleHandler {
  public static dueling(): AttackModifier {
    return { flatDamage: 2 };
  }

  public static greatWeapon(weaponDie: WeaponDie): AttackModifier {
    let mod = 0;
    switch (weaponDie) {
      case WeaponDie.d4:
        mod = .5;
        break;
      case WeaponDie.d4x2:
        mod = 1.0;
        break;
      case WeaponDie.d6:
        mod = 0.66;
        break;
      case WeaponDie.d6x2:
        mod = 1.33;
        break;
      case WeaponDie.d8:
        mod = 0.75;
        break;
      case WeaponDie.d10:
        mod = 0.8;
        break;
      case WeaponDie.d12:
        mod = 0.83;
        break
      default:
        break;
    }
    return {flatDamage: mod};
  }

  static archery() : AttackModifier {
    return {accuracy: 2};
  }

  static twoWeapon(modifier: number) : AttackModifier {
    return {flatDamage: modifier};
  }
}

export class Feat {
  static powerAttack() : AttackModifier {
    return {
      flatDamage: 10,
      accuracy: -5
    }
  }

  static poleArmMaster(level: number, modifier: number, options: AttackDamageOptions, source: AttackSource) : AttackModifier {
    let pam = source.weaponAttacks(level, 1, modifier, new AttackDamageOptions(Dice.d4, options.staticDamage, options.extraDice, options.extraCritChance, options.extraCritChance, options.isProficient, options.addsModifier));
    return {
      flatDamage: pam.damage
    };
  }

  static crossbowExpert(level: number, modifier: number, options: AttackDamageOptions, source: AttackSource) : AttackModifier {
    let ba = source.weaponAttacks(level, 1, modifier, new AttackDamageOptions(Dice.d6, options.staticDamage, options.extraDice, options.extraCritChance, options.extraCritChance, options.isProficient, options.addsModifier));
    return {
      flatDamage: ba.damage
    }
  }

  static greatWeaponMaster(level: number, modifier: number, procRate: number, options: AttackDamageOptions, source: AttackSource): AttackModifier {
    let ba = source.weaponAttacks(level, 1, modifier, options);
    return { flatDamage: procRate*ba.damage }
  }
}

export type AttackModifier = {
  flatDamage?: number,
  accuracy?: number,
  dieBasedDamage?: number
}

export enum WeaponDie {
  d4,
  d4x2,
  d6,
  d8,
  d10,
  d12,
  d6x2
}