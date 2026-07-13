package mcsv.mcsv_notificacion.infrastructure.brevo.dto;

import java.util.List;
import java.util.Map;

public record BrevoEmailRequest
        (
                List<BrevoRecipient> to,
                Long templateId,
                Map<String, Object> params
        ){}
