package mcsv.mcsv_notificacion.application;

import lombok.RequiredArgsConstructor;
import mcsv.mcsv_notificacion.infrastructure.persistence.repository.NotificacionRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotifiacionService {

    private final NotificacionRepository notificacionRepository;

}
