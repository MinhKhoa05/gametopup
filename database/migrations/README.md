For existing databases, run each migration once and in order:

```sh
docker compose exec db sh -c 'mariadb -u"$MARIADB_USER" -p"$MARIADB_PASSWORD" "$MARIADB_DATABASE" < /migrations/001_create_notifications.sql'
```

For new installations, use `schema.sql` only.
