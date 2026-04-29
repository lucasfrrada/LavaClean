package lavaclean.msvc_usuario.application.service;

import lavaclean.msvc_usuario.api.dto.UsuarioRequest; // <-- ¡Faltaba importar esto!
import lavaclean.msvc_usuario.api.dto.UsuarioResponse;
import lavaclean.msvc_usuario.application.mapper.UsuarioMapper;
import lavaclean.msvc_usuario.domain.exception.UsuarioException;
import lavaclean.msvc_usuario.infrastructure.persistence.entity.RolEntity;
import lavaclean.msvc_usuario.infrastructure.persistence.entity.UsuarioEntity;
import lavaclean.msvc_usuario.infrastructure.persistence.repository.RolRepository;
import lavaclean.msvc_usuario.infrastructure.persistence.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;

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

    // 👇 AQUÍ ESTÁ LA CORRECCIÓN: Ahora recibe UsuarioRequest 👇
    @Override
    @Transactional
    public UsuarioEntity registrarUsuario(UsuarioRequest request) {
        // 1. Validar correo duplicado
        if (this.usuarioRepository.findByCorreo(request.getCorreo()).isPresent()) {
            throw new UsuarioException("El correo " + request.getCorreo() + " ya se encuentra registrado.");
        }

        // 2. Usar el Mapper para transformar los datos básicos (Nombres, correo, teléfono)
        UsuarioEntity nuevoUsuario = UsuarioMapper.toEntity(request);

        // 3. Buscar el Rol en la BD y asignarlo
        RolEntity rolAsignado = rolRepository.findById(Long.valueOf(request.getIdRol()))
                .orElseThrow(() -> new UsuarioException("El rol especificado no existe en el sistema"));
        nuevoUsuario.setIdRolEntity(rolAsignado);

        // 4. Asignar la contraseña manualmente
        nuevoUsuario.setContrasenia(request.getContrasenia());

        // 5. Guardar en la base de datos
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
    public UsuarioEntity asignarRol(Long idUsuario, Long idRol) {
        UsuarioEntity usuarioEntity = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new UsuarioException("Usuario con id " + idUsuario + " no encontrado"));

        RolEntity nuevoRolEntity = this.rolRepository.findById(idRol).orElseThrow(
                () -> new UsuarioException("El Rol con id " + idRol + " no existe.")
        );

        usuarioEntity.setIdRolEntity(nuevoRolEntity);
        return this.usuarioRepository.save(usuarioEntity);
    }
}