package com.doctorchannel.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI doctorChannelingOpenAPI() {
        Server localServer = new Server();
        localServer.setUrl("http://localhost:8080");
        localServer.setDescription("Local Development Server");

        Server productionServer = new Server();
        productionServer.setUrl("http://your-ec2-ip:8080");
        productionServer.setDescription("Production Server");

        Contact contact = new Contact();
        contact.setName("Mediland Hospital");
        contact.setEmail("admin@mediland.com");
        contact.setUrl("https://mediland.com");

        License license = new License()
                .name("Proprietary")
                .url("https://mediland.com/license");

        Info info = new Info()
                .title("Doctor Channeling System API")
                .version("1.0.0")
                .description("REST API for Mediland Hospital - Kalmunai Doctor Appointment Booking System")
                .contact(contact)
                .license(license);

        return new OpenAPI()
                .info(info)
                .servers(List.of(localServer, productionServer));
    }
}
