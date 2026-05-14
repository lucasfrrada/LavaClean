package lavaclean.msvc_usuario.application.service;

import lavaclean.msvc_usuario.api.dto.UsuarioRequest;
import lavaclean.msvc_usuario.api.dto.UsuarioResponse;
import lavaclean.msvc_usuario.application.mapper.UsuarioMapper;
import lavaclean.msvc_usuario.domain.enums.RolEnum;
import lavaclean.msvc_usuario.domain.exception.UsuarioException;
import lavaclean.msvc_usuario.infrastructure.persistence.entity.UsuarioEntity;
import lavaclean.msvc_usuario.infrastructure.persistence.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;


    @Override
    @Transactional(readOnly = true)
    public UsuarioEntity findById(Long id) {
        return this.usuarioRepository.findById(id).orElseThrow(
                () -> new UsuarioException("Usuario con id " + id + " no encontrado en el sistema.")
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<UsuarioResponse> findAll() {
        return this.usuarioRepository.findAll()
                .stream()
                .map(UsuarioMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        UsuarioEntity usuarioEntity = this.findById(id);
        this.usuarioRepository.delete(usuarioEntity);
    }

    @Override
    @Transactional
    public UsuarioEntity registrarUsuario(UsuarioRequest request) {
        if (this.usuarioRepository.findByCorreo(request.getCorreo()).isPresent()) {
            throw new UsuarioException("El correo " + request.getCorreo() + " ya se encuentra registrado.");
        }

        UsuarioEntity nuevoUsuario = UsuarioMapper.toEntity(request);

        // Se asigna el rol CLIENTE por defecto
        nuevoUsuario.setRol(RolEnum.CLIENTE);

        // Cifrado de contraseña
        String hashSeguro = passwordEncoder.encode(request.getContrasenia());
        nuevoUsuario.setContrasenia(hashSeguro);

        return this.usuarioRepository.save(nuevoUsuario);
    }

    @Override
    @Transactional
    public UsuarioEntity update(Long id, UsuarioEntity usuarioEntityActualizado) {
        UsuarioEntity usuarioEntityExistente = usuarioRepository.findById(id)
                .orElseThrow(() -> new UsuarioException("Usuario con id " + id + " no encontrado"));

        usuarioEntityExistente.setNombres(usuarioEntityActualizado.getNombres());
        usuarioEntityExistente.setApPaterno(usuarioEntityActualizado.getApPaterno());
        usuarioEntityExistente.setApMaterno(usuarioEntityActualizado.getApMaterno());
        usuarioEntityExistente.setTelefono(usuarioEntityActualizado.getTelefono());

        return this.usuarioRepository.save(usuarioEntityExistente);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UsuarioEntity> findByCorreo(String correo) {
        return this.usuarioRepository.findByCorreo(correo);
    }

    @Override
    @Transactional
    public UsuarioEntity asignarRol(Long idUsuario, String nombreRol) {
        UsuarioEntity usuarioEntity = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new UsuarioException("Usuario con id " + idUsuario + " no encontrado"));

        // Asignamos el nuevo Enum validando que exista
        try {
            RolEnum nuevoRol = RolEnum.valueOf(nombreRol.toUpperCase());
            usuarioEntity.setRol(nuevoRol);
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new UsuarioException("El Rol '" + nombreRol + "' no existe.");
        }

        return this.usuarioRepository.save(usuarioEntity);
    }
}