package achanvear.peru;

import achanvear.peru.company.infrastructure.external.ApiPeruProperties;
import achanvear.peru.freelance.infrastructure.external.AwsS3Properties;
import achanvear.peru.freelance.infrastructure.external.DniValidationApiProperties;
import achanvear.peru.profile.infrastructure.external.AiValidatorProperties;
import achanvear.peru.profile.infrastructure.external.AwsProfileS3Properties;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties({ApiPeruProperties.class, AwsS3Properties.class, DniValidationApiProperties.class, AiValidatorProperties.class, AwsProfileS3Properties.class})
public class AchanvearApplication {

	public static void main(String[] args) {
		try {
			Dotenv dotenv = Dotenv.configure()
					.directory(".")
					.ignoreIfMissing()
					.load();

			dotenv.entries().forEach(entry -> {
				System.setProperty(entry.getKey(), entry.getValue());
			});

			System.out.println(".env file loaded successfully");
		} catch (Exception e) {
			System.err.println("Error loading .env file: " + e.getMessage());
		}

		SpringApplication.run(AchanvearApplication.class, args);
	}

}
