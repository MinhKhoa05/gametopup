For existing databases, run each migration once and in order. New installations should use `schema.sql` only because it includes the full schema.

```sh
docker compose exec db sh -c 'mariadb -u"$MARIADB_USER" -p"$MARIADB_PASSWORD" "$MARIADB_DATABASE" < /migrations/001_create_notifications.sql'
```

Available migrations:

| File | Purpose |
| ---- | ------- |
| `001_create_notifications.sql` | Creates the `notifications` table used by in-app deposit and order status messages |
