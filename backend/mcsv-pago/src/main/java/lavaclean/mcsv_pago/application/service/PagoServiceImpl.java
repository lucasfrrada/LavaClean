package lavaclean.mcsv_pago.application.service;

import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.resources.preference.Preference;
import lavaclean.mcsv_pago.api.dto.PagoRequest;
import lavaclean.mcsv_pago.api.dto.PagoResponse;
import lavaclean.mcsv_pago.application.client.UsuarioClient;
import lavaclean.mcsv_pago.infrastructure.persistence.entity.PagoEntity;
import lavaclean.mcsv_pago.infrastructure.persistence.repository.PagoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PagoServiceImpl implements PagoService {

    private final PagoRepository pagoRepository;
    private final UsuarioClient usuarioClient;

    @Value("${mercadopago.access.token}")
    private String accessToken;

    @PostConstruct
    public void init() {
        // Se ejecuta al arrancar el microservicio para autenticarte con Mercado Pago
        MercadoPagoConfig.setAccessToken(accessToken);
    }

    @Override
    @Transactional
    public PagoResponse procesarPagoPedido(PagoRequest request) throws Exception {

        // 1. Verificación de seguridad distribuida via OpenFeign
        try {
            usuarioClient.obtenerUsuarioPorId(request.getIdUsuario());
        } catch (Exception e) {
            throw new RuntimeException("Seguridad: El usuario con ID " + request.getIdUsuario() + " no existe o no está registrado.");
        }

        // 2. Generar la Preferencia de Pago en los servidores de Mercado Pago
        PreferenceItemRequest itemRequest = PreferenceItemRequest.builder()
                .title("LavaClean Servicio - Pedido " + request.getIdPedido())
                .quantity(1)
                .unitPrice(new BigDecimal(request.getMonto()))
                .currencyId("CLP")
                .build();

        PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                .items(Collections.singletonList(itemRequest))
                .build();

        PreferenceClient client = new PreferenceClient();
        Preference preference = client.create(preferenceRequest);

        String urlSandbox = preference.getSandboxInitPoint();

        PagoEntity nuevoPago = PagoEntity.builder()
                .idPedido(request.getIdPedido())
                .idUsuario(request.getIdUsuario())
                .monto(request.getMonto())
                .estadoPago("PENDIENTE")
                .urlPago(urlSandbox)
                .build();

        PagoEntity savedPago = pagoRepository.save(nuevoPago);

        // 4. Devolvemos la URL limpia lista para que React redireccione
        return PagoResponse.builder()
                .idPago(savedPago.getIdPago())
                .idPedido(savedPago.getIdPedido())
                .idUsuario(savedPago.getIdUsuario())
                .monto(savedPago.getMonto())
                .estadoPago(savedPago.getEstadoPago())
                .urlPago(savedPago.getUrlPago())
                .fechaCreacion(savedPago.getFechaCreacion())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PagoEntity buscarPorId(Long id) {
        return pagoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pago no encontrado con el ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public PagoEntity buscarPorIdPedido(String idPedido) {
        return pagoRepository.findByIdPedido(idPedido)
                .orElseThrow(() -> new RuntimeException("No se registra pago para el pedido: " + idPedido));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PagoEntity> listarTodos() {
        return pagoRepository.findAll();
    }

    @Override
    @Transactional
    public PagoEntity actualizarEstadoPago(String idPedido, String nuevoEstado) {
        PagoEntity pago = buscarPorIdPedido(idPedido);
        pago.setEstadoPago(nuevoEstado.toUpperCase());
        return pagoRepository.save(pago);
    }

    @Override
    @Transactional
    public void eliminarPago(Long id) {
        PagoEntity pago = buscarPorId(id);
        pagoRepository.delete(pago);
    }
}