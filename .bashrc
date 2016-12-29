PATH="/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"
echo /Applications/Postgres.app/Contents/Versions/latest/bin | sudo tee /etc/paths.d/postgresapp
export DATABASE_URL="postgresql://localhost/Anya"