import { MigrationInterface, QueryRunner } from 'typeorm';

// tslint:disable-next-line: class-name
export class addHasEquipment1573323878129 implements MigrationInterface {
  name = 'addHasEquipment1573323878129';

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "Volunteer" ADD "hasEquipment" boolean NOT NULL DEFAULT false`);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "Volunteer" DROP COLUMN "hasEquipment"`);
  }
}
