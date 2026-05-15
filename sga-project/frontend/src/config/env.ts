/**
 * Ponto único de acesso às variáveis de ambiente do frontend.
 * Evita strings mágicas espalhadas pelo código e facilita troca de ambiente.
 */

export const config = {
  // Ajuste rápido: Usa a variável de ambiente se existir,
  // ou aponta dinamicamente para o mesmo IP que serviu a página, na porta 5000.
  apiUrl: process.env.REACT_APP_API_URL
    ? `${process.env.REACT_APP_API_URL}/api`
    : `http://${window.location.hostname}:5000/api`,
} as const;

