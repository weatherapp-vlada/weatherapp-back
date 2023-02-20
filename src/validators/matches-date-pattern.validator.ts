import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'matchesDatePattern', async: false })
export class MatchesDatePatternConstraint
  implements ValidatorConstraintInterface
{
  validate(propertyValue: string) {
    return /^\d{4}\-\d{2}\-\d{2}$/.test(propertyValue);
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be in YYYY-MM-DD format.`;
  }
}
