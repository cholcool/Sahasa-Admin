-- Dev only: `prisma migrate dev` creates a temporary shadow database, so the app
-- user needs CREATE/DROP DATABASE. Never grant this on Hostinger.
GRANT ALL PRIVILEGES ON *.* TO 'sahasa'@'%';
FLUSH PRIVILEGES;
