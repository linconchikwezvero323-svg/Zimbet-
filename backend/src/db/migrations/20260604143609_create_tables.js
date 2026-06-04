/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('users', table => {
      table.uuid('id').primary();
      table.string('username').unique().notNullable();
      table.string('phone_number').unique().notNullable();
      table.text('password_hash').notNullable();
      table.decimal('balance', 12, 2).defaultTo(0.00);
      table.string('currency', 3).defaultTo('USD');
      table.string('role').defaultTo('user');
      table.timestamps(true, true);
    })
    .createTable('sports', table => {
      table.uuid('id').primary();
      table.string('name').notNullable();
      table.string('slug').unique().notNullable();
    })
    .createTable('leagues', table => {
      table.uuid('id').primary();
      table.uuid('sport_id').references('id').inTable('sports');
      table.string('name').notNullable();
      table.string('country');
    })
    .createTable('events', table => {
      table.uuid('id').primary();
      table.uuid('league_id').references('id').inTable('leagues');
      table.string('home_team').notNullable();
      table.string('away_team').notNullable();
      table.timestamp('start_time').notNullable();
      table.string('status').defaultTo('upcoming');
      table.integer('result_home');
      table.integer('result_away');
      table.timestamps(true, true);
    })
    .createTable('markets', table => {
      table.uuid('id').primary();
      table.uuid('event_id').references('id').inTable('events');
      table.string('name').notNullable();
      table.string('status').defaultTo('open');
    })
    .createTable('outcomes', table => {
      table.uuid('id').primary();
      table.uuid('market_id').references('id').inTable('markets');
      table.string('name').notNullable();
      table.decimal('odds', 10, 3).notNullable();
      table.string('status').defaultTo('active');
    })
    .createTable('bets', table => {
      table.uuid('id').primary();
      table.uuid('user_id').references('id').inTable('users');
      table.decimal('stake', 12, 2).notNullable();
      table.decimal('potential_payout', 12, 2).notNullable();
      table.string('status').defaultTo('pending');
      table.timestamps(true, true);
    })
    .createTable('bet_legs', table => {
      table.uuid('id').primary();
      table.uuid('bet_id').references('id').inTable('bets').onDelete('CASCADE');
      table.uuid('outcome_id').references('id').inTable('outcomes');
      table.decimal('odds_at_placement', 10, 3).notNullable();
      table.string('status').defaultTo('pending');
    })
    .createTable('transactions', table => {
      table.uuid('id').primary();
      table.uuid('user_id').references('id').inTable('users');
      table.decimal('amount', 12, 2).notNullable();
      table.string('type').notNullable();
      table.string('payment_method');
      table.string('external_reference').unique();
      table.string('status').defaultTo('pending');
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('transactions')
    .dropTableIfExists('bet_legs')
    .dropTableIfExists('bets')
    .dropTableIfExists('outcomes')
    .dropTableIfExists('markets')
    .dropTableIfExists('events')
    .dropTableIfExists('leagues')
    .dropTableIfExists('sports')
    .dropTableIfExists('users');
};
