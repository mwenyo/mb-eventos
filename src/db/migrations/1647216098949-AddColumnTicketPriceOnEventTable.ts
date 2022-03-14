import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddColumnTicketPriceOnEventTable1647216098949 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('event', new TableColumn({
      name: 'ticketPrice',
      type: 'numeric',
      default: 0
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('event', 'ticketPrice');
  }

}
