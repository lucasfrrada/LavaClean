package mcsv.mcsv_notificacion.infrastructure.mail;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
public class EmailSenderComponent {

    private final JavaMailSender mailSender;

    @Value("${app.lavaclean.correo.remitente}")
    private String correoRemitente;

    public EmailSenderComponent(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void enviarCorreoTextoPlano(String destinatario, String asunto, String mensaje) {
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setFrom(correoRemitente);
        mailMessage.setTo(destinatario);
        mailMessage.setSubject(asunto);
        mailMessage.setText(mensaje);

        mailSender.send(mailMessage);
    }
}