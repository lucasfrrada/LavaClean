package lavaclean.auth.application.service;

import lavaclean.auth.api.dto.request.AuthRequest;
import lavaclean.auth.api.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse login(AuthRequest request);
}
