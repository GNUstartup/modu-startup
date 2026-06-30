// ============================================================
// 데이터 주고받기 (Supabase 버전)
// 모든 컴포넌트는 이 파일의 함수만 부릅니다.
// 함수 이름과 사용법은 기존(문지기 버전)과 동일하게 유지했습니다.
// ============================================================
import { supabase } from './supabaseClient';

const T_APPLICATIONS = 'applications';
const T_PARTICIPANTS = 'participants';

// 참가자명을 Auth용 "가짜 이메일"로 변환
// 예: "테스트팀" -> "테스트팀@modu.local"
// 참가자는 이 이메일을 볼 일이 없고, 내부적으로만 사용합니다.
function toAuthEmail(name: string): string {
  // 공백/특수문자가 이메일에 안전하도록 인코딩
  const safe = encodeURIComponent(String(name).trim().toLowerCase());
  return `${safe}@modu.local`;
}

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
  // 증빙 관련
  증빙_영수증?: string;
  증빙_수령?: string;
  증빙_기타1?: string;
  증빙_기타2?: string;
  증빙_메모?: string;
  증빙_제출일시?: string;
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

// ===== 로그인 (Supabase Auth) =====
export async function apiLogin(name: string, password: string): Promise<Participant> {
  // 1) Auth 금고에 로그인 (가짜 이메일 + 비밀번호)
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: toAuthEmail(name),
    password: password,
  });

  if (authError) {
    // Auth 실패: 참가자명 또는 비밀번호가 틀림
    throw new Error('참가자명 또는 비밀번호가 일치하지 않습니다.');
  }

  // 2) 로그인 성공 → participants 표에서 이 사람의 정보(예산·역할 등) 가져오기
  const { data, error } = await supabase
    .from(T_PARTICIPANTS)
    .select('*')
    .eq('참가자명', name.trim())
    .limit(1);

  if (error) throw new Error('정보 조회 중 오류가 발생했습니다: ' + error.message);
  if (!data || data.length === 0) {
    throw new Error('계정 정보를 찾을 수 없습니다. 관리자에게 문의하세요.');
  }

  const user = data[0];
  delete (user as any)['비밀번호']; // 만약 남아있어도 제거
  return user as Participant;
}

// ===== 로그아웃 (Auth 세션 종료) =====
export async function apiLogout(): Promise<void> {
  await supabase.auth.signOut();
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
    상태: '담당자 검토 대기 중',
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

// ===== 회원가입 (Supabase Auth) =====
export async function apiSignup(params: {
  참가자명: string;
  비밀번호: string;
  팀장명?: string;
  연락처?: string;
  경상국립대생여부?: boolean;
}): Promise<string> {
  const name = params.참가자명.trim();

  // 1) 참가자명 중복 확인 (participants 표)
  const { data: existing } = await supabase
    .from(T_PARTICIPANTS)
    .select('참가자명')
    .eq('참가자명', name)
    .limit(1);

  if (existing && existing.length > 0) {
    throw new Error('이미 존재하는 참가자명입니다.');
  }

  // 2) Auth 금고에 계정 생성 (가짜 이메일 + 비밀번호)
  const { error: authError } = await supabase.auth.signUp({
    email: toAuthEmail(name),
    password: params.비밀번호,
  });

  if (authError) {
    throw new Error('회원가입 실패: ' + authError.message);
  }

  // 3) participants 표에 정보 저장 (비밀번호는 저장하지 않음)
  const { error: insError } = await supabase.from(T_PARTICIPANTS).insert({
    참가자명: name,
    팀장명: params.팀장명 || '',
    연락처: params.연락처 || '',
    경상국립대생여부: !!params.경상국립대생여부,
    역할: '참가자',
    여비_배정액: 0,
    재료비_배정액: 0,
    외주용역비_배정액: 0,
    지급수수료_배정액: 0,
  });

  if (insError) throw new Error('정보 저장 실패: ' + insError.message);
  return name;
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

// ===== 첨부파일 업로드 (Supabase Storage) =====
// 'attachments' 버킷에 파일을 올리고 { url, 원본파일명 }을 반환합니다.
// Storage 키는 한글/특수문자를 제거한 안전한 이름으로만 만듭니다.
export async function apiUploadFile(file: File): Promise<{ url: string; 원본파일명: string }> {
  // 원본 확장자 추출 (없으면 빈 문자열)
  const dotIndex = file.name.lastIndexOf('.');
  const ext = dotIndex !== -1 ? file.name.slice(dotIndex) : '';

  // 랜덤 영숫자 6자리 생성
  const rand = Math.random().toString(36).slice(2, 8);

  // Storage에 저장할 안전한 키: 타임스탬프_랜덤.확장자
  const safeKey = `${Date.now()}_${rand}${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('attachments')
    .upload(safeKey, file);

  if (uploadError) throw new Error('파일 업로드 실패: ' + uploadError.message);

  const { data } = supabase.storage
    .from('attachments')
    .getPublicUrl(safeKey);

  if (!data?.publicUrl) throw new Error('파일 URL을 가져오지 못했습니다.');

  return { url: data.publicUrl, 원본파일명: file.name };
}

// ===== 증빙 제출 (정산 신청) =====
// 사전 승인 완료된 신청에 대해 참가자가 증빙을 제출하고 상태를 "정산 신청"으로 변경합니다.
export async function apiSubmitSettlement(params: {
  신청번호: string;
  참가자명: string;
  증빙_영수증?: string;
  증빙_수령?: string;
  증빙_기타1?: string;
  증빙_기타2?: string;
  증빙_메모?: string;
}): Promise<void> {
  // 기존 처리이력 가져오기
  const { data: rows, error: selErr } = await supabase
    .from(T_APPLICATIONS)
    .select('처리이력')
    .eq('신청번호', params.신청번호)
    .limit(1);

  if (selErr) throw new Error('증빙 제출 실패: ' + selErr.message);
  if (!rows || rows.length === 0) throw new Error('해당 신청번호를 찾을 수 없습니다: ' + params.신청번호);

  // 처리이력에 한 줄 추가
  const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  const entry = `${now} / ${params.참가자명} / 정산 신청`;
  const prev = (rows[0] as any)['처리이력'] || '';
  const combined = prev ? `${prev}\n${entry}` : entry;

  // 업데이트할 데이터 구성 (undefined 칸은 제외)
  const updateData: Record<string, any> = {
    상태: '정산 신청',
    증빙_제출일시: new Date().toISOString(),
    처리이력: combined,
  };
  if (params.증빙_영수증 !== undefined) updateData['증빙_영수증'] = params.증빙_영수증;
  if (params.증빙_수령   !== undefined) updateData['증빙_수령']   = params.증빙_수령;
  if (params.증빙_기타1  !== undefined) updateData['증빙_기타1']  = params.증빙_기타1;
  if (params.증빙_기타2  !== undefined) updateData['증빙_기타2']  = params.증빙_기타2;
  if (params.증빙_메모   !== undefined) updateData['증빙_메모']   = params.증빙_메모;

  const { error: updErr } = await supabase
    .from(T_APPLICATIONS)
    .update(updateData)
    .eq('신청번호', params.신청번호);

  if (updErr) throw new Error('증빙 제출 저장 실패: ' + updErr.message);
}

// ===== 신청 수정 후 재제출 (1차 반려 → 재검토 요청) =====
// "수정 필요" 상태의 신청 내용을 수정하고 상태를 "담당자 검토 대기 중"으로 되돌립니다.
// 반려사유는 이력 확인을 위해 그대로 둡니다.
export async function apiUpdateApplication(params: {
  신청번호: string;
  참가자명: string;
  fields: Partial<Application>; // 수정할 내용 칸들
}): Promise<void> {
  // 기존 처리이력 가져오기
  const { data: rows, error: selErr } = await supabase
    .from(T_APPLICATIONS)
    .select('처리이력')
    .eq('신청번호', params.신청번호)
    .limit(1);

  if (selErr) throw new Error('신청 수정 실패: ' + selErr.message);
  if (!rows || rows.length === 0) throw new Error('해당 신청번호를 찾을 수 없습니다: ' + params.신청번호);

  // 처리이력에 한 줄 추가
  const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  const entry = `${now} / ${params.참가자명} / 수정 후 재제출`;
  const prev = (rows[0] as any)['처리이력'] || '';
  const combined = prev ? `${prev}\n${entry}` : entry;

  // 업데이트 데이터: 수정 내용 + 상태 복구 + 이력
  // 신청번호·참가자명·신청일시 등 불변 칸은 덮어쓰지 않도록 제거
  const { 신청번호: _n, 참가자명: _p, 신청일시: _d, 상태: _s, 처리이력: _h, 반려사유: _r, ...rest } = params.fields as any;
  const updateData: Record<string, any> = {
    ...rest,
    상태: '담당자 검토 대기 중',
    처리이력: combined,
  };

  const { error: updErr } = await supabase
    .from(T_APPLICATIONS)
    .update(updateData)
    .eq('신청번호', params.신청번호);

  if (updErr) throw new Error('신청 수정 저장 실패: ' + updErr.message);
}

// ===== 사이트 설정 =====
const T_SETTINGS = '사이트설정';

export async function apiGetSetting(설정키: string): Promise<string> {
  const { data, error } = await supabase
    .from(T_SETTINGS)
    .select('설정값')
    .eq('설정키', 설정키)
    .limit(1);
  if (error) throw new Error('설정 조회 실패: ' + error.message);
  return (data && data.length > 0) ? ((data[0] as any)['설정값'] || '') : '';
}

export async function apiUpdateSetting(설정키: string, 설정값: string): Promise<void> {
  // upsert: 키가 있으면 업데이트, 없으면 삽입
  const { error } = await supabase
    .from(T_SETTINGS)
    .upsert({ 설정키, 설정값 }, { onConflict: '설정키' });
  if (error) throw new Error('설정 저장 실패: ' + error.message);
}

// ===== 공지사항 =====
const T_NOTICES = '공지사항';

export interface Notice {
  id?: number;
  제목: string;
  내용: string;
  작성일시?: string;
}

export async function apiGetNotices(): Promise<Notice[]> {
  const { data, error } = await supabase
    .from(T_NOTICES)
    .select('*')
    .order('작성일시', { ascending: false });
  if (error) throw new Error('공지사항 조회 실패: ' + error.message);
  return (data || []) as Notice[];
}

export async function apiCreateNotice(제목: string, 내용: string): Promise<void> {
  const { error } = await supabase
    .from(T_NOTICES)
    .insert({ 제목, 내용 });
  if (error) throw new Error('공지 작성 실패: ' + error.message);
}

export async function apiUpdateNotice(id: number, 제목: string, 내용: string): Promise<void> {
  const { error } = await supabase
    .from(T_NOTICES)
    .update({ 제목, 내용 })
    .eq('id', id);
  if (error) throw new Error('공지 수정 실패: ' + error.message);
}

export async function apiDeleteNotice(id: number): Promise<void> {
  const { error } = await supabase
    .from(T_NOTICES)
    .delete()
    .eq('id', id);
  if (error) throw new Error('공지 삭제 실패: ' + error.message);
}

// ===== 비목 =====
const T_CATEGORIES = '비목';

export interface Category {
  id?: number;
  비목명: string;
  결제방식?: string;
  정산패턴?: string;
  정렬순서?: number;
  사용여부?: boolean;
  생성일시?: string;
}

export async function apiGetActiveCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from(T_CATEGORIES)
    .select('*')
    .eq('사용여부', true)
    .order('정렬순서', { ascending: true });
  if (error) throw new Error('비목 조회 실패: ' + error.message);
  return (data || []) as Category[];
}

export async function apiGetCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from(T_CATEGORIES)
    .select('*')
    .order('정렬순서', { ascending: true });
  if (error) throw new Error('비목 조회 실패: ' + error.message);
  return (data || []) as Category[];
}

export async function apiCreateCategory(params: {
  비목명: string;
  결제방식?: string;
  정산패턴?: string;
  정렬순서?: number;
}): Promise<void> {
  const { error } = await supabase.from(T_CATEGORIES).insert({
    비목명: params.비목명,
    결제방식: params.결제방식 || '',
    정산패턴: params.정산패턴 || '',
    정렬순서: params.정렬순서 ?? 0,
    사용여부: true,
  });
  if (error) throw new Error('비목 추가 실패: ' + error.message);
}

export async function apiUpdateCategory(id: number, params: Partial<Category>): Promise<void> {
  const { id: _id, 생성일시: _dt, ...rest } = params as any;
  const { error } = await supabase.from(T_CATEGORIES).update(rest).eq('id', id);
  if (error) throw new Error('비목 수정 실패: ' + error.message);
}

export async function apiSetCategoryActive(id: number, 사용여부: boolean): Promise<void> {
  const { error } = await supabase.from(T_CATEGORIES).update({ 사용여부 }).eq('id', id);
  if (error) throw new Error('비목 사용여부 변경 실패: ' + error.message);
}

// ===== 질문칸 =====
const T_FIELDS = '질문칸';

export interface Field {
  id?: number;
  비목id: number;
  칸이름: string;
  칸종류: 'text' | 'number' | 'textarea' | 'select' | 'file';
  선택지?: string;
  필수여부?: boolean;
  정렬순서?: number;
}

export async function apiGetFields(비목id: number): Promise<Field[]> {
  const { data, error } = await supabase
    .from(T_FIELDS)
    .select('*')
    .eq('비목id', 비목id)
    .order('정렬순서', { ascending: true });
  if (error) throw new Error('질문칸 조회 실패: ' + error.message);
  return (data || []) as Field[];
}

export async function apiCreateField(params: {
  비목id: number;
  칸이름: string;
  칸종류: Field['칸종류'];
  선택지?: string;
  필수여부?: boolean;
  정렬순서?: number;
}): Promise<void> {
  const { error } = await supabase.from(T_FIELDS).insert({
    비목id: params.비목id,
    칸이름: params.칸이름,
    칸종류: params.칸종류,
    선택지: params.선택지 || '',
    필수여부: params.필수여부 ?? false,
    정렬순서: params.정렬순서 ?? 0,
  });
  if (error) throw new Error('질문칸 추가 실패: ' + error.message);
}

export async function apiUpdateField(id: number, params: Partial<Field>): Promise<void> {
  const { id: _id, 비목id: _cid, ...rest } = params as any;
  const { error } = await supabase.from(T_FIELDS).update(rest).eq('id', id);
  if (error) throw new Error('질문칸 수정 실패: ' + error.message);
}

export async function apiDeleteField(id: number): Promise<void> {
  const { error } = await supabase.from(T_FIELDS).delete().eq('id', id);
  if (error) throw new Error('질문칸 삭제 실패: ' + error.message);
}

// ===== 동적 신청 생성 =====
export async function apiCreateDynamicApplication(params: {
  참가자명: string;
  비목명: string;
  동적답변: Record<string, any>;
  신청금액: number;
  처리이력?: string;
}): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `${year}-`;

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

  const toInsert: Record<string, any> = {
    신청번호: newNumber,
    참가자명: params.참가자명,
    비목: params.비목명,
    동적비목: params.비목명,
    동적답변: params.동적답변,
    신청금액: params.신청금액,
    상태: '담당자 검토 대기 중',
    신청일시: new Date().toISOString(),
  };
  if (params.처리이력) toInsert['처리이력'] = params.처리이력;

  const { error: insErr } = await supabase.from(T_APPLICATIONS).insert(toInsert);
  if (insErr) throw new Error('신청 저장 실패: ' + insErr.message);

  return newNumber;
}
