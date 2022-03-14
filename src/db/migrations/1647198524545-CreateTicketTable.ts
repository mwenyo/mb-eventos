import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";
import TicketStatus from "../../enumerators/ticket-status";

export class CreateTicketTable1647198524545 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'ticket',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          }, {
            name: 'participantId',
            type: 'uuid',
            isNullable: true,
          }, {
            name: 'eventId',
            type: 'uuid',
            isNullable: true,
          }, {
            name: 'code',
            type: 'varchar',
            default: false
          }, {
            name: 'status',
            type: 'integer',
            default: TicketStatus.ACTIVE
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

    await queryRunner.createForeignKey('ticket',
      new TableForeignKey({
        columnNames: ['participantId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'RESTRICT'
      })
    )

    await queryRunner.createForeignKey('ticket',
      new TableForeignKey({
        columnNames: ['eventId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'event',
        onDelete: 'RESTRICT'
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("ticket");
    const participantFk = table.foreignKeys.find(fk => fk.columnNames.indexOf("participantId") !== -1);
    const eventFk = table.foreignKeys.find(fk => fk.columnNames.indexOf("eventId") !== -1);
    await queryRunner.dropForeignKey('ticket', eventFk);
    await queryRunner.dropForeignKey('ticket', participantFk);
    await queryRunner.dropTable('ticket');
  }

}
