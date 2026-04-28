package lavaclean.msvc_usuario.application.service;

import lavaclean.msvc_usuario.domain.exception.UsuarioException;
import lavaclean.msvc_usuario.infrastructure.persistence.entity.RolEntity;
import lavaclean.msvc_usuario.infrastructure.persistence.entity.UsuarioEntity;
import lavaclean.msvc_usuario.infrastructure.persistence.repository.RolRepository;
import lavaclean.msvc_usuario.infrastructure.persistence.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioServiceImpl implements UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private RolRepository rolRepository;

    // Buscar usuario por ID
    @Override
    @Transactional
    public UsuarioEntity findById(Long id) {
        return this.usuarioRepository.findById(id).orElseThrow(
                () -> new UsuarioException("UsuarioEntity con id " + id + " no encontrado en el sistema.")
        );
    }

    // Listar todos los Usuarios
    @Override
    @Transactional
    public List<UsuarioEntity> findAll() {
        return this.usuarioRepository.findAll();
    }

    // Eliminar Usurio por ID
    @Override
    @Transactional
    public void deleteById(Long id) {
        // Reutilización de findById para lanzar la excepción automáticamente si no existe
        UsuarioEntity usuarioEntity = this.findById(id);
        this.usuarioRepository.delete(usuarioEntity);
    }

    // Guardar Nuevo Usuario
    @Override
    @Transactional
    public UsuarioEntity save(UsuarioEntity usuarioEntity) {
        // Validación correo duplicado
        if (this.usuarioRepository.findByCorreo(usuarioEntity.getCorreo()).isPresent()) {
            throw new UsuarioException("El correo " + usuarioEntity.getCorreo() + " ya se encuentra registrado.");
        }

        // NOTA: En el futuro, agregar lógica para encriptar la contraseña (hash)
        // antes de hacer el save().

        return this.usuarioRepository.save(usuarioEntity);
    }

    // Update Datos de Perfil Usuario por ID
    @Override
    @Transactional
    public UsuarioEntity update(Long id, UsuarioEntity usuarioEntityActualizado) {
        UsuarioEntity usuarioEntityExistente = usuarioRepository.findById(id)
                        .orElseThrow(() -> new UsuarioException("Alumno con id "+id+" no encontrado"));

        // Solo actualizar datos de perfil
        usuarioEntityExistente.setNombres(usuarioEntityActualizado.getNombres());
        usuarioEntityExistente.setApPaterno(usuarioEntityActualizado.getApPaterno());
        usuarioEntityExistente.setApMaterno(usuarioEntityActualizado.getApMaterno());
        usuarioEntityExistente.setTelefono(usuarioEntityActualizado.getTelefono());

        return this.usuarioRepository.save(usuarioEntityExistente);
    }

    // Buscar Usuario por correo
    @Override
    @Transactional
    public Optional<UsuarioEntity> findByCorreo(String correo) {
        return this.usuarioRepository.findByCorreo(correo);
    }


    @Override
    @Transactional
    public UsuarioEntity asignarRol(Long idUsuario, Integer idRol) {
        UsuarioEntity usuarioEntity = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new UsuarioException("Alumno con id "+idUsuario+" no encontrado"));;

        RolEntity nuevoRolEntity = this.rolRepository.findById(idRol).orElseThrow(
                () -> new UsuarioException("El Rol con id " + idRol + " no existe.")
        );

        usuarioEntity.setIdRolEntity(nuevoRolEntity);
        return this.usuarioRepository.save(usuarioEntity);
    }

}
