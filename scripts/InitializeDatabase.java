import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import org.flywaydb.core.Flyway;

/** Run from the repository root with the backend runtime libraries on the classpath. */
class InitializeDatabase {
    public static void main(String[] args) throws Exception {
        var env = new HashMap<String, String>();
        for (String line : Files.readAllLines(Path.of(".env"))) {
            int separator = line.indexOf('=');
            if (separator > 0 && !line.startsWith("#")) {
                env.put(line.substring(0, separator), line.substring(separator + 1));
            }
        }
        var flyway = Flyway.configure()
            .dataSource(env.getOrDefault("FLYWAY_URL", env.get("DB_URL")), env.get("DB_USERNAME"), env.get("DB_PASSWORD"))
            .locations("filesystem:achanvear.backend/src/main/resources/db/migration")
            .schemas("public")
            .defaultSchema("public")
            .baselineOnMigrate(false)
            .load();
        var result = flyway.migrate();
        flyway.validate();
        System.out.println("Migrations applied: " + result.migrationsExecuted);
        System.out.println("Schema version: " + flyway.info().current().getVersion());
    }
}
