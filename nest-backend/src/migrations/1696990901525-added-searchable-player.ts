import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedSearchablePlayer1696990901525 implements MigrationInterface {
    name = 'AddedSearchablePlayer1696990901525'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."player_search"`);
        await queryRunner.query(`CREATE TABLE "player_search" ("id" SERIAL NOT NULL, "player_id" character varying(128) NOT NULL, "region_id" integer NOT NULL, "is_RSOed" boolean NOT NULL DEFAULT false, "game_name" character varying NOT NULL, "tag_line" character varying NOT NULL, "tier" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_906e07e390447fd4091a5e87388" UNIQUE ("player_id"), CONSTRAINT "PK_9732b7d59a9fcabd236e1f83f5d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_96fee3bd6114062a13151a8604" ON "player_search" ("game_name") `);
        await queryRunner.query(`CREATE INDEX "IDX_a47d66fae2fe90367485f71caa" ON "player_leaderboards" ("region_id", "date_id", "main_position_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_a47d66fae2fe90367485f71caa"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_96fee3bd6114062a13151a8604"`);
        await queryRunner.query(`DROP TABLE "player_search"`);
        await queryRunner.query(`CREATE INDEX "player_search" ON "player_leaderboards" ("region_id", "main_position_id", "date_id") `);
    }

}
