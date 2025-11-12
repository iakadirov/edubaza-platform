import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    const email = process.env.ESKIZ_EMAIL;
    const password = process.env.ESKIZ_PASSWORD;
    const apiUrl = process.env.ESKIZ_API_URL || 'https://notify.eskiz.uz/api';

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: 'ESKIZ_EMAIL or ESKIZ_PASSWORD not found in environment variables ❌',
      }, { status: 500 });
    }

    // Get auth token
    const authResponse = await axios.post(`${apiUrl}/auth/login`, {
      email,
      password,
    });

    if (authResponse.data && authResponse.data.data && authResponse.data.data.token) {
      const token = authResponse.data.data.token;

      // Get user info to verify token works
      const userInfoResponse = await axios.get(`${apiUrl}/auth/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Eskiz.uz API connection successful! ✅',
        data: {
          email,
          tokenReceived: true,
          tokenLength: token.length,
          userInfo: userInfoResponse.data.data,
          timestamp: new Date().toISOString(),
        }
      });
    } else {
      throw new Error('No token received from Eskiz.uz');
    }

  } catch (error) {
    console.error('Eskiz.uz API error:', error);

    return NextResponse.json({
      success: false,
      message: 'Eskiz.uz API connection failed ❌',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: axios.isAxiosError(error) ? error.response?.data : undefined
    }, { status: 500 });
  }
}
