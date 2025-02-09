/* tslint:disable:naming-convention */
'use strict';

import { Transform, TransformFnParams } from 'class-transformer';
import * as _ from 'lodash';

/**
 * @description trim spaces from start and end, replace multiple spaces with one.
 * @example
 * @ApiProperty()
 * @IsString()
 * @Trim()
 * name: string;
 * @returns {(target: any, key: string) => void}
 * @constructor
 */
export function Trim() {
  return Transform((param: TransformFnParams) => {
    if (_.isArray(param.value)) {
      return (param.value as string[]).map((v) =>
        _.trim(v).replace(/\s\s+/g, ' '),
      );
    }
    return _.trim(param.value).replace(/\s\s+/g, ' ');
  });
}
