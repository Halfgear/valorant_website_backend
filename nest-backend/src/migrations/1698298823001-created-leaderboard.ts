import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedLeaderboard1698298823001 implements MigrationInterface {
    name = 'CreatedLeaderboard1698298823001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "leaderboards" ("id" SERIAL NOT NULL, "game_name" character varying NOT NULL, "tag_line" character varying NOT NULL, "player_id" character varying NOT NULL, "region_id" integer NOT NULL DEFAULT '1', "is_rso_ed" boolean NOT NULL DEFAULT false, "rank" integer NOT NULL, "tier" integer NOT NULL DEFAULT '0', "level" integer NOT NULL DEFAULT '1', "player_card_id" character varying(46) NOT NULL, "rating" integer NOT NULL, "win" integer NOT NULL DEFAULT '0', "draw" integer NOT NULL DEFAULT '0', "lose" integer NOT NULL DEFAULT '0', "average_combat_score" integer NOT NULL DEFAULT '0', "main_position" character varying NOT NULL DEFAULT 'None', "main_agent_ids" text array NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_0e19a8186cce78888c4db8736e0" UNIQUE ("player_id"), CONSTRAINT "PK_190f95e31621935228328d6c20a" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "leaderboards"`);
    }

}
