import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateEventTable1647029399340 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'event',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          }, {
            name: 'promoterId',
            type: 'uuid',
            isNullable: true,
          }, {
            name: 'name',
            type: 'varchar',
            isNullable: true
          }, {
            name: 'address',
            type: 'varchar',
            isNullable: true
          }, {
            name: 'tickets',
            type: 'int4',
            isNullable: true,
          }, {
            name: 'date',
            type: 'timestamptz',
            isNullable: true,
          }, {
            name: 'limitByParticipant',
            type: 'boolean',
            default: false
          }, {
            name: 'createdBy',
            type: 'varchar',
            isNullable: true,
          }, {
            name: 'createdAt',
            type: 'timestamptz',
            default: 'now()',
          }, {
            name: 'updatedBy',
            type: 'varchar',
            isNullable: true,
          }, {
            name: 'updatedAt',
            type: 'timestamptz',
            default: 'now()',
          }, {
            name: 'deletedBy',
            type: 'varchar',
            isNullable: true,
          }, {
            name: 'deletedAt',
            type: 'timestamptz',
            isNullable: true,
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('event');
  }


}
