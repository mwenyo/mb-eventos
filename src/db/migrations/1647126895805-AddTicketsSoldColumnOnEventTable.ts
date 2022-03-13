import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddTicketsSoldColumnOnEventTable1647126895805 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('event',
      [
        new TableColumn(
          {
            name: 'ticketsSold',
            type: 'integer',
            isNullable: false,
            default: 0
          }),
        new TableColumn(
          {
            name: 'description',
            type: 'text',
            isNullable: true
          }),
        new TableColumn(
          {
            name: 'endDate',
            type: 'timestamptz',
            isNullable: true
          }),
      ]
    );
    await queryRunner.changeColumn(
      'event',
      'date',
      new TableColumn({
        name: 'startDate',
        type: 'timestamptz',
        isNullable: true,
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('event', ['ticketsSold', 'description', 'startDate'])
    await queryRunner.changeColumn(
      'event',
      'startDate',
      new TableColumn({
        name: 'date',
        type: 'timestamptz',
        isNullable: true,
      })
    )
  }

}
