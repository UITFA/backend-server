import { BadRequestException } from '@nestjs/common';
import { ISortEntity } from 'src/interfaces/ISortEntity';

export function sortProp(
  sortString: string,
  fieldType: any,
  sortType: any,
): ISortEntity {
  if (sortString === null) {
    return null;
  }
  const valueSplit = sortString.split('|');
  if (sortString.length > 0 && valueSplit.length !== 2) {
    throw new BadRequestException('Wrong sorting format');
  }
  if (valueSplit.length !== 2) {
    return null;
  }

  if ((<any>Object).values(fieldType).includes(valueSplit[0])) {
    if ((<any>Object).values(sortType).includes(valueSplit[1])) {
      return {
        field: <typeof fieldType>valueSplit[0],
        type: <typeof sortType>valueSplit[1],
      };
    }
    const convertedSORT = Object.values(sortType);
    const valuesSORT = convertedSORT.splice(convertedSORT.length / 2 - 1);
    throw new BadRequestException(`Sort type only: [${valuesSORT.toString()}]`);
  }
  const convertedField = Object.values(fieldType);
  const valuesField = convertedField.splice(convertedField.length / 2 - 1);
  throw new BadRequestException(`Sort field only: [${valuesField.toString()}]`);
}
