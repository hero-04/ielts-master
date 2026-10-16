# Private test content

JSON test files that must NOT be committed (third-party material, or anything not yet cleared
for the public repo). Everything in this folder except this README is git-ignored.

Import with:
    python manage.py import_content content/private/<file>.json --dry-run
    DATABASE_URL='<neon>' DEBUG=True python manage.py import_content content/private/<file>.json
