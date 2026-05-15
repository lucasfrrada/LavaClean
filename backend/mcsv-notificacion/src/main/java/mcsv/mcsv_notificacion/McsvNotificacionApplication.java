package mcsv.mcsv_notificacion;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients
@SpringBootApplication
public class McsvNotificacionApplication {

	public static void main(String[] args) {
		SpringApplication.run(McsvNotificacionApplication.class, args);
	}

}
