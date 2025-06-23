import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import {
  jobListingApplicationTable,
  jobListingTable,
  organizationSettingTable,
  organizationTable,
  userNotificationSettingTable,
  userResumeTable,
  userTable,
} from './schema';

const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle({
  client: sql,
  schema: {
    jobListingApplicationTable,
    jobListingTable,
    organizationSettingTable,
    organizationTable,
    userNotificationSettingTable,
    userResumeTable,
    userTable,
  },
});
