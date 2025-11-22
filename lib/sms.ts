// Eskiz.uz SMS API integration

interface EskizAuthResponse {
  message: string;
  data: {
    token: string;
  };
}

interface EskizSMSResponse {
  status: string;
  message: string;
}

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

async function getAuthToken(): Promise<string> {
  // Проверяем кэшированный токен
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const email = process.env.ESKIZ_EMAIL;
  const password = process.env.ESKIZ_PASSWORD;
  const apiUrl = process.env.ESKIZ_API_URL || 'https://notify.eskiz.uz/api';

  if (!email || !password) {
    throw new Error('Eskiz.uz credentials not configured');
  }

  try {
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(`Eskiz auth failed: ${response.statusText}`);
    }

    const data: EskizAuthResponse = await response.json();
    cachedToken = data.data.token;
    tokenExpiry = Date.now() + 25 * 24 * 60 * 60 * 1000; // 25 дней

    return cachedToken;
  } catch (error) {
    console.error('Eskiz auth error:', error);
    throw new Error('Failed to authenticate with Eskiz.uz');
  }
}

export async function sendSMS(phone: string, message: string): Promise<boolean> {
  const apiUrl = process.env.ESKIZ_API_URL || 'https://notify.eskiz.uz/api';

  try {
    const token = await getAuthToken();

    // Форматируем номер телефона (убираем + если есть)
    const formattedPhone = phone.replace('+', '');

    const response = await fetch(`${apiUrl}/message/sms/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        mobile_phone: formattedPhone,
        message: message,
        from: '4546',
      }),
    });

    if (!response.ok) {
      // Если токен невалидный, сбрасываем кэш и пробуем еще раз
      if (response.status === 401) {
        cachedToken = null;
        tokenExpiry = 0;
        return sendSMS(phone, message); // Рекурсивный вызов
      }
      throw new Error(`Eskiz SMS send failed: ${response.statusText}`);
    }

    const data: EskizSMSResponse = await response.json();
    // Eskiz может вернуть 'waiting' или 'success' - оба случая считаем успешными
    return data.status === 'success' || data.status === 'waiting';
  } catch (error) {
    console.error('SMS send error:', error);
    return false;
  }
}

export async function sendOTP(phone: string, otp: string, type: 'register' | 'reset' = 'register'): Promise<boolean> {
  // Разные сообщения для регистрации и восстановления пароля
  let message: string;

  if (type === 'register') {
    message = `Edubaza.uz saytida ro'yxatdan o'tish uchun tasdiqlash kodi: ${otp}`;
  } else {
    message = `Edubaza.uz saytida parolni tiklash uchun kod: ${otp}`;
  }

  return sendSMS(phone, message);
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
