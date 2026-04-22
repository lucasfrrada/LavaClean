package lavaclean.msvc_usuario.application.service;

import lavaclean.msvc_usuario.domain.exception.UsuarioException;
import lavaclean.msvc_usuario.domain.model.entities.Rol;
import lavaclean.msvc_usuario.domain.model.entities.Usuario;
import lavaclean.msvc_usuario.domain.repository.RolRepository;
import lavaclean.msvc_usuario.domain.repository.UsuarioRepository;
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

    public UsuarioServiceImpl(UsuarioRepository usuarioRepository, RolRepository rolRepository) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Usuario findById(Long id) {
        return this.usuarioRepository.findById(id).orElseThrow(
                () -> new UsuarioException("Usuario con id " + id + " no encontrado en el sistema.")
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<Usuario> findAll() {
        return this.usuarioRepository.findAll();
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        // Reutilización de findById para lanzar la excepción automáticamente si no existe
        Usuario usuario = this.findById(id);
        this.usuarioRepository.delete(usuario);
    }

    @Override
    @Transactional
    public Usuario save(Usuario usuario) {
        // Validación correo duplicado
        if (this.usuarioRepository.findByCorreo(usuario.getCorreo()).isPresent()) {
            throw new UsuarioException("El correo " + usuario.getCorreo() + " ya se encuentra registrado.");
        }

        // NOTA: En el futuro, agregar lógica para encriptar la contraseña (hash)
        // antes de hacer el save().

        return this.usuarioRepository.save(usuario);
    }

    @Override
    @Transactional
    public Usuario update(Long id, Usuario usuarioActualizado) {
        Usuario usuarioExistente = this.findById(id);

        // Solo actualizar datos de perfil
        usuarioExistente.setNombres(usuarioActualizado.getNombres());
        usuarioExistente.setApPaterno(usuarioActualizado.getApPaterno());
        usuarioExistente.setApMaterno(usuarioActualizado.getApMaterno());
        usuarioExistente.setTelefono(usuarioActualizado.getTelefono());

        return this.usuarioRepository.save(usuarioExistente);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Usuario> findByCorreo(String correo) {
        return this.usuarioRepository.findByCorreo(correo);
    }

    @Override
    @Transactional
    public Usuario asignarRol(Long idUsuario, Integer idRol) {
        Usuario usuario = this.findById(idUsuario);

        Rol nuevoRol = this.rolRepository.findById(idRol).orElseThrow(
                () -> new UsuarioException("El Rol con id " + idRol + " no existe.")
        );

        usuario.setRol(nuevoRol);
        return this.usuarioRepository.save(usuario);
    }

}
