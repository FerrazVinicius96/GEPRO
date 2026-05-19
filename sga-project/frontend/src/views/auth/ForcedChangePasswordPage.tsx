import React from 'react';
import axios, { AxiosError } from 'axios';
import ChangePasswordModal from '../../components/ChangePasswordModal';
import { useToast } from '../../contexts/ToastContext';
import { config } from '../../config/env';
import { BackendErrorResponse } from '../../types/api';

const ForcedChangePasswordPage = () => {
  const API_URL = config.apiUrl;
  const { addToast } = useToast();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Alteração de Senha Obrigatória</h1>
        <p className="text-gray-600">Por segurança, você precisa definir uma nova senha para continuar.</p>
      </div>
      <div className="w-full max-w-md">
        <ChangePasswordModal
          onClose={() => {}} // Fechamento bloqueado intencionalmente — troca é obrigatória
          onSave={async (passwordData) => {
            try {
              // TODO: migrar para userService quando o serviço expor este endpoint
              const response = await axios.post(`${API_URL}/users/me/change-password`, passwordData);
              const { token: newToken } = response.data;
              localStorage.setItem('token', newToken);
              addToast('Senha alterada com sucesso! Redirecionando...', 'success');
              setTimeout(() => {
                window.location.reload();
              }, 2000);
            } catch (error: unknown) {
              const axiosError = error as AxiosError<BackendErrorResponse>;
              const errorMessage = axiosError.response?.data?.message || 'Erro ao alterar a senha.';
              addToast(errorMessage, 'error');
            }
          }}
        />
      </div>
    </div>
  );
};

export default ForcedChangePasswordPage;
