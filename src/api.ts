// ============================================================
// 데이터 주고받기 (Supabase 버전)
// 모든 컴포넌트는 이 파일의 함수만 부릅니다.
// 함수 이름과 사용법은 기존(문지기 버전)과 동일하게 유지했습니다.
// ============================================================
import { supabase } from './supabaseClient';

const T_APPLICATIONS = 'applications';
const T_PARTICIPANTS = 'participants';

// 신청 한 건의 데이터 모양
export interface Application {
  신청번호?: string;
  참가자명?: string;
  비목?: string;
  신청금액?: number;
  상태?: string;
  신청일시?: string;
  첨부파일?: string;
  반려사유?: string;
  처리이력?: string;
  출발지?: string;
  도착지?: string;
  대중교통?: string;
  구매품목?: string;
  구매처?: string;
  구매품목설명?: string;
  업체명?: string;
  계약명?: string;
  외주용역설명?: string;
  멘토명?: string;
  멘토소속?: string;
  멘토직급?: string;
  멘토링시간?: string;
  멘토링주제?: string;
  [key: string]: any;
}

// 참가자(로그인 사용자) 정보 모양
export interface Participant {
  참가자명: string;
  팀장명?: string;
  연락처?: string;
  경상국립대생여부?: boolean | string;
  역할?: string;
  여비_배정액?: number;
  재료비_배정액?: number;
  외주용역비_배정액?: number;
  지급수수료_배정액?: number;
  [key: string]: any;
}

// ===== 로그인 =====
export async function apiLogin(name: string, password: string): Promise<Participant> {
  const { data, error } = await supabase
    .from(T_PARTICIPANTS)
    .select('*')
    .eq('참가자명', name)
    .limit(1);

  if (error) throw new Error('로그인 중 오류가 발생했습니다: ' + error.message);
  if (!data || data.length === 0) throw new Error('존재하지 않는 참가자명입니다.');

  const user = data[0];
  if (String(user['비밀번호']) !== String(password)) {
    throw new Error('비밀번호가 일치하지 않습니다.');
  }

  // 비밀번호는 돌려주지 않음
  delete (user as any)['비밀번호'];
  return user as Participant;
}

// ===== 신청 목록 가져오기 =====
// 관리자: 전체 / 참가자: 본인 것만
export async function apiGetApplications(name: string, role: string): Promise<Application[]> {
  let query = supabase.from(T_APPLICATIONS).select('*');

  if (role !== '관리자') {
    query = query.eq('참가자명', name);
  }

  const { data, error } = await query;
  if (error) throw new Error('신청 내역을 불러오지 못했습니다: ' + error.message);
  return (data || []) as Application[];
}

// ===== 새 신청 만들기 =====
export async function apiCreateApplication(application: Application): Promise<string> {
  // 신청번호 자동 부여: 올해-0001 형식
  const year = new Date().getFullYear();
  const prefix = `${year}-`;

  // 올해 신청 중 가장 큰 번호 찾기
  const { data: existing, error: selErr } = await supabase
    .from(T_APPLICATIONS)
    .select('신청번호')
    .like('신청번호', `${prefix}%`);

  if (selErr) throw new Error('신청번호 생성 실패: ' + selErr.message);

  let maxSeq = 0;
  (existing || []).forEach((row: any) => {
    const seq = parseInt(String(row['신청번호']).substring(prefix.length), 10);
    if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
  });
  const newNumber = prefix + String(maxSeq + 1).padStart(4, '0');

  const toInsert = {
    ...application,
    신청번호: newNumber,
    상태: '담당자 확인 전',
    신청일시: new Date().toISOString(),
  };

  const { error: insErr } = await supabase.from(T_APPLICATIONS).insert(toInsert);
  if (insErr) throw new Error('신청 저장 실패: ' + insErr.message);

  return newNumber;
}

// ===== 신청 상태 변경 (승인/반려) =====
export async function apiUpdateStatus(params: {
  신청번호: string;
  상태: string;
  반려사유?: string;
  처리자?: string;
}) {
  // 기존 처리이력 가져오기
  const { data: rows, error: selErr } = await supabase
    .from(T_APPLICATIONS)
    .select('처리이력')
    .eq('신청번호', params.신청번호)
    .limit(1);

  if (selErr) throw new Error('상태 변경 실패: ' + selErr.message);
  if (!rows || rows.length === 0) throw new Error('해당 신청번호를 찾을 수 없습니다: ' + params.신청번호);

  const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  const entry = `${now} / ${params.처리자 || '관리자'} / ${params.상태}`;
  const prev = (rows[0] as any)['처리이력'] || '';
  const combined = prev ? `${prev}\n${entry}` : entry;

  const updateData: Record<string, any> = {
    상태: params.상태,
    처리이력: combined,
  };
  if (params.반려사유 !== undefined) {
    updateData['반려사유'] = params.반려사유;
  }

  const { error: updErr } = await supabase
    .from(T_APPLICATIONS)
    .update(updateData)
    .eq('신청번호', params.신청번호);

  if (updErr) throw new Error('상태 변경 실패: ' + updErr.message);
  return { ok: true, 신청번호: params.신청번호, 상태: params.상태 };
}

// ===== 참가자 한 명 정보 =====
export async function apiGetParticipant(name: string): Promise<Participant> {
  const { data, error } = await supabase
    .from(T_PARTICIPANTS)
    .select('*')
    .eq('참가자명', name)
    .limit(1);

  if (error) throw new Error('참가자 조회 실패: ' + error.message);
  if (!data || data.length === 0) throw new Error('참가자를 찾을 수 없습니다.');

  const p = data[0];
  delete (p as any)['비밀번호'];
  return p as Participant;
}

// ===== 회원가입 =====
export async function apiSignup(params: {
  참가자명: string;
  비밀번호: string;
  팀장명?: string;
  연락처?: string;
  경상국립대생여부?: boolean;
}): Promise<string> {
  // 중복 확인
  const { data: existing } = await supabase
    .from(T_PARTICIPANTS)
    .select('참가자명')
    .eq('참가자명', params.참가자명)
    .limit(1);

  if (existing && existing.length > 0) {
    throw new Error('이미 존재하는 참가자명입니다.');
  }

  const { error } = await supabase.from(T_PARTICIPANTS).insert({
    참가자명: params.참가자명,
    비밀번호: params.비밀번호,
    팀장명: params.팀장명 || '',
    연락처: params.연락처 || '',
    경상국립대생여부: !!params.경상국립대생여부,
    역할: '참가자',
    여비_배정액: 0,
    재료비_배정액: 0,
    외주용역비_배정액: 0,
    지급수수료_배정액: 0,
  });

  if (error) throw new Error('회원가입 실패: ' + error.message);
  return params.참가자명;
}

// ===== 참가자 전체 목록 (관리자용) =====
export async function apiGetParticipants(role: string): Promise<Participant[]> {
  if (role !== '관리자') throw new Error('권한이 없습니다.');

  const { data, error } = await supabase
    .from(T_PARTICIPANTS)
    .select('*');

  if (error) throw new Error('참가자 목록을 불러오지 못했습니다: ' + error.message);
  const list = (data || []) as Participant[];
  // 비밀번호 제거
  list.forEach((p: any) => { delete p['비밀번호']; });
  return list;
}
