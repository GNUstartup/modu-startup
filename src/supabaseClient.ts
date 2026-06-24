// ============================================================
// Supabase 연결 설정
// URL과 키는 Vercel 환경변수에 숨겨둡니다.
// ============================================================
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase 연결 정보(VITE_SUPABASE_URL / VITE_SUPABASE_KEY)가 설정되지 않았습니다.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
