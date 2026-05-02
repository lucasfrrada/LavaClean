package mcsv.mcsv_notificacion.application.service;

import lombok.RequiredArgsConstructor;
import mcsv.mcsv_notificacion.infrastructure.persistence.repository.NotificacionRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificacionServiceImpl implements NotificacionService {

    private final NotificacionRepository notificacionRepository;
}
