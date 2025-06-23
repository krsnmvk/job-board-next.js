import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const userTable = pgTable('users', {
  id: uuid('id').notNull().defaultRandom().primaryKey(),
  name: text('name').notNull(),
  imageUrl: text('image_url').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .$onUpdate(() => new Date()),
});

export const organizationTable = pgTable('organizations', {
  id: uuid('id').notNull().defaultRandom().primaryKey(),
  name: text('name').notNull(),
  imageUrl: text('image_url').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .$onUpdate(() => new Date()),
});

export const wageIntervalEnum = pgEnum('wage_interval_enum', [
  'hourly',
  'yearly',
]);

export const locationRequirementEnum = pgEnum('location_requirement_enum', [
  'in_office',
  'hybrid',
  'remote',
]);

export const statusEnum = pgEnum('status_enum', [
  'draft',
  'published',
  'delisted',
]);

export const experienceLevelEnum = pgEnum('experience_level_enum', [
  'junior',
  'mid_level',
  'senior',
]);

export const typeEnum = pgEnum('type_enum', [
  'intership',
  'part_time',
  'full_time',
]);

export const jobListingTable = pgTable(
  'job_listings',
  {
    id: uuid('id').notNull().defaultRandom().primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    wage: integer('wage'),
    wageInterval: wageIntervalEnum(),
    stateAbbreviation: text('state_abbreviation'),
    city: text('city'),
    isFeatured: boolean('is_featured').notNull().default(false),
    locationRequirement: locationRequirementEnum().notNull(),
    status: statusEnum().notNull().default('draft'),
    experienceLevel: experienceLevelEnum().notNull(),
    type: typeEnum().notNull(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizationTable.id, { onDelete: 'cascade' }),
    postedAt: timestamp('posted_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [index().on(t.stateAbbreviation)]
);

export const stageEnum = pgEnum('stage_enum', [
  'denied',
  'applied',
  'interested',
  'interviewed',
  'hired',
]);

export const jobListingApplicationTable = pgTable(
  'job_listing_applications',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
    jobListingId: uuid('job_listing_id')
      .notNull()
      .references(() => organizationTable.id, { onDelete: 'cascade' }),
    coverLetter: text('cover_letter'),
    stage: stageEnum().notNull().default('applied'),
    rating: integer('rating'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [primaryKey({ columns: [t.userId, t.jobListingId] })]
);

export const organizationSettingTable = pgTable(
  'organization_settings',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizationTable.id, { onDelete: 'cascade' }),
    newApplicationEmailNotifications: boolean(
      'new_application_email_notifications'
    )
      .notNull()
      .default(false),
    minimumRating: integer('minimum_rating'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [primaryKey({ columns: [t.userId, t.organizationId] })]
);

export const userNotificationSettingTable = pgTable(
  'user_notification_settings',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
    newJobEmailNotifications: boolean('new_job_email_notifications')
      .notNull()
      .default(false),
    isPrompt: text('is_prompt'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [primaryKey({ columns: [t.userId] })]
);

export const userResumeTable = pgTable(
  'user_resumes',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
    resumeFileUrl: text('resume_file_url').notNull(),
    resumeFileKey: text('resume_file_key').notNull(),
    aiSummary: text('ai_summary'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [primaryKey({ columns: [t.userId] })]
);

export const userRelations = relations(userTable, ({ many, one }) => ({
  notificationSettings: one(userNotificationSettingTable),
  resume: one(userResumeTable),
  organizationSettings: many(organizationSettingTable),
}));

export const jobListingRelations = relations(
  jobListingTable,
  ({ many, one }) => ({
    organization: one(organizationTable, {
      fields: [jobListingTable.organizationId],
      references: [organizationTable.id],
    }),
    application: many(jobListingApplicationTable),
  })
);

export const jobListingApplicationRelations = relations(
  jobListingApplicationTable,
  ({ one }) => ({
    jobListing: one(jobListingTable, {
      fields: [jobListingApplicationTable.jobListingId],
      references: [jobListingTable.id],
    }),
    user: one(userTable, {
      fields: [jobListingApplicationTable.userId],
      references: [userTable.id],
    }),
  })
);

export const organizationRelations = relations(jobListingTable, ({ many }) => ({
  jobListings: many(jobListingTable),
  organizationSettings: many(organizationSettingTable),
}));

export const organizationSettingRelations = relations(
  organizationSettingTable,
  ({ one }) => ({
    organization: one(organizationTable, {
      fields: [organizationSettingTable.organizationId],
      references: [organizationTable.id],
    }),
    user: one(userTable, {
      fields: [organizationSettingTable.userId],
      references: [userTable.id],
    }),
  })
);

export const userNotificationSettingRelations = relations(
  userNotificationSettingTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [userNotificationSettingTable.userId],
      references: [userTable.id],
    }),
  })
);

export const userResumeRelations = relations(userResumeTable, ({ one }) => ({
  user: one(userTable, {
    fields: [userResumeTable.userId],
    references: [userTable.id],
  }),
}));
