import { Column, MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddStatusColumnOnEventTable1647114737445 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('event',
      new TableColumn(
        {
          name: 'status',
          type: 'integer',
          isNullable: false,
          default: 1
        })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('event', 'status')
  }

}
