package lavaclean.msvc_usuario.infrastructure.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Desactiva la protección CSRF (necesario para Postman)
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll() // PERMITE TODO (Solo para desarrollo)
                );
        return http.build();
    }
}