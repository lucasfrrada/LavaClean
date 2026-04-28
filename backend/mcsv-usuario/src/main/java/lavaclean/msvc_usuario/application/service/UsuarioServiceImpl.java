package lavaclean.msvc_usuario.application.service;

import lavaclean.msvc_usuario.api.dto.UsuarioResponse;
import lavaclean.msvc_usuario.application.mapper.UsuarioMapper; // Asumiendo que creaste el Mapper
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
@RequiredArgsConstructor // Esta anotación crea el constructor automáticamente
public class UsuarioServiceImpl implements UsuarioService {

    // Al poner "final", Lombok sabe que debe inyectarlos. ¡Adiós @Autowired!
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
        // Solución: Obtenemos las entidades y usamos el Mapper para convertirlas a Response
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
    public UsuarioEntity save(UsuarioEntity usuarioEntity) {
        if (this.usuarioRepository.findByCorreo(usuarioEntity.getCorreo()).isPresent()) {
            throw new UsuarioException("El correo " + usuarioEntity.getCorreo() + " ya se encuentra registrado.");
        }
        return this.usuarioRepository.save(usuarioEntity);
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
    public UsuarioEntity asignarRol(Long idUsuario, Integer idRol) {
        UsuarioEntity usuarioEntity = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new UsuarioException("Usuario con id " + idUsuario + " no encontrado"));

        RolEntity nuevoRolEntity = this.rolRepository.findById(idRol).orElseThrow(
                () -> new UsuarioException("El Rol con id " + idRol + " no existe.")
        );

        usuarioEntity.setIdRolEntity(nuevoRolEntity);
        return this.usuarioRepository.save(usuarioEntity);
    }
}