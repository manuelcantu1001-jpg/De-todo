import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

export const events = sqliteTable(
  'events',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    status: text('status', { enum: ['open', 'closed'] })
      .notNull()
      .default('open'),
    baseCurrency: text('base_currency').notNull().default('MXN'),
    version: integer('version').notNull().default(1),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    closedAt: text('closed_at'),
  },
  (table) => [uniqueIndex('events_slug_unique').on(table.slug)],
);

export const members = sqliteTable(
  'members',
  {
    id: text('id').primaryKey(),
    eventId: text('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    role: text('role', { enum: ['owner', 'member'] })
      .notNull()
      .default('member'),
    sessionToken: text('session_token'),
    claimToken: text('claim_token'),
    clabe: text('clabe'),
    bank: text('bank'),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    index('members_event_idx').on(table.eventId),
    index('members_session_idx').on(table.sessionToken),
    uniqueIndex('members_claim_unique').on(table.claimToken),
  ],
);

export const expenses = sqliteTable(
  'expenses',
  {
    id: text('id').primaryKey(),
    eventId: text('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    amountCents: integer('amount_cents').notNull(),
    currency: text('currency', { enum: ['MXN', 'USD'] }).notNull(),
    fxMillis: integer('fx_millis').notNull().default(1000),
    payerMemberId: text('payer_member_id')
      .notNull()
      .references(() => members.id),
    createdByMemberId: text('created_by_member_id')
      .notNull()
      .references(() => members.id),
    spentOn: text('spent_on').notNull(),
    createdAt: text('created_at').notNull(),
    deletedAt: text('deleted_at'),
  },
  (table) => [index('expenses_event_idx').on(table.eventId)],
);

export const expenseShares = sqliteTable(
  'expense_shares',
  {
    expenseId: text('expense_id')
      .notNull()
      .references(() => expenses.id, { onDelete: 'cascade' }),
    memberId: text('member_id')
      .notNull()
      .references(() => members.id),
    shareCents: integer('share_cents').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.expenseId, table.memberId] }),
    index('expense_shares_member_idx').on(table.memberId),
  ],
);

export const payments = sqliteTable(
  'payments',
  {
    id: text('id').primaryKey(),
    eventId: text('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    fromMemberId: text('from_member_id')
      .notNull()
      .references(() => members.id),
    toMemberId: text('to_member_id')
      .notNull()
      .references(() => members.id),
    amountCents: integer('amount_cents').notNull(),
    confirmedByMemberId: text('confirmed_by_member_id')
      .notNull()
      .references(() => members.id),
    createdAt: text('created_at').notNull(),
  },
  (table) => [index('payments_event_idx').on(table.eventId)],
);

export const auditLog = sqliteTable(
  'audit_log',
  {
    id: text('id').primaryKey(),
    eventId: text('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    actorMemberId: text('actor_member_id').references(() => members.id),
    action: text('action').notNull(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id').notNull(),
    details: text('details'),
    createdAt: text('created_at').notNull(),
  },
  (table) => [index('audit_event_idx').on(table.eventId)],
);
