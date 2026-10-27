export interface AppError {
  message: string;
  statusCode?: number;
  isNetworkError: boolean;
  code?: string;
  raw?: any;
}

type AuthErrorHandler = () => void;
const authErrorListeners: AuthErrorHandler[] = [];

export const onAuthError = (handler: AuthErrorHandler) => {
  authErrorListeners.push(handler);
  return () => {
    const idx = authErrorListeners.indexOf(handler);
    if (idx > -1) authErrorListeners.splice(idx, 1);
  };
};

export const triggerAuthError = () => {
  authErrorListeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error('Error in auth error listener:', e);
    }
  });
};

/**
 * Standardize and translate API & network errors to user-friendly Indonesian messages
 */
export const parseApiError = (error: any): AppError => {
  if (!error) {
    return {
      message: 'Terjadi kesalahan tidak terduga.',
      isNetworkError: false,
    };
  }

  // Already parsed AppError
  if (error.isNetworkError !== undefined && error.message) {
    return error as AppError;
  }

  // Axios Response Error
  if (error.response) {
    const status = error.response.status;
    const serverMessage = error.response.data?.message;

    if (status === 401) {
      triggerAuthError();
      return {
        message: serverMessage || 'Sesi login Anda telah berakhir. Silakan masuk kembali.',
        statusCode: 401,
        isNetworkError: false,
        raw: error,
      };
    }

    if (status === 403) {
      return {
        message: serverMessage || 'Akses ditolak. Anda tidak memiliki izin untuk halaman ini.',
        statusCode: 403,
        isNetworkError: false,
        raw: error,
      };
    }

    if (status === 404) {
      return {
        message: serverMessage || 'Data yang Anda cari tidak ditemukan.',
        statusCode: 404,
        isNetworkError: false,
        raw: error,
      };
    }

    if (status >= 400 && status < 500) {
      return {
        message: serverMessage || 'Permintaan tidak dapat diproses. Mohon periksa kembali input Anda.',
        statusCode: status,
        isNetworkError: false,
        raw: error,
      };
    }

    if (status >= 500) {
      return {
        message: 'Terjadi kendala pada server kami. Silakan coba kembali beberapa saat lagi.',
        statusCode: status,
        isNetworkError: false,
        raw: error,
      };
    }

    return {
      message: serverMessage || `Terjadi kesalahan (Kode: ${status}).`,
      statusCode: status,
      isNetworkError: false,
      raw: error,
    };
  }

  // Timeout error
  if (error.code === 'ECONNABORTED' || (error.message && error.message.toLowerCase().includes('timeout'))) {
    return {
      message: 'Koneksi melebihi batas waktu (timeout). Silakan periksa jaringan dan coba lagi.',
      code: 'TIMEOUT',
      isNetworkError: true,
      raw: error,
    };
  }

  // Network error (no response received)
  if (
    error.request ||
    (error.message && error.message.toLowerCase().includes('network')) ||
    error.code === 'ERR_NETWORK'
  ) {
    return {
      message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
      code: 'NETWORK_ERROR',
      isNetworkError: true,
      raw: error,
    };
  }

  // Generic Javascript Error or string
  const customMessage = error.message || (typeof error === 'string' ? error : 'Terjadi kesalahan sistem.');
  return {
    message: customMessage,
    isNetworkError: false,
    raw: error,
  };
};

export default parseApiError;
