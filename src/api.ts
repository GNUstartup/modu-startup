// ============================================================
// 문지기(구글 시트 백엔드)와 통신하는 공통 도우미
// 모든 컴포넌트는 Airtable을 직접 부르지 않고 이 파일을 통해서만 데이터를 주고받습니다.
// ============================================================

// 문지기 주소는 Vercel 환경변수(VITE_GAS_URL)에 숨겨둡니다.
const GAS_URL = import.meta.env.VITE_GAS_URL as string;

// 신청 한 건의 데이터 모양 (구글 시트 '신청내역' 탭의 칸들과 일치)
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
  // 비목별 상세
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
}

// 문지기에게 요청을 보내는 핵심 함수
async function callGatekeeper(payload: Record<string, any>): Promise<any> {
  if (!GAS_URL) {
    throw new Error('서버 주소(VITE_GAS_URL)가 설정되지 않았습니다. Vercel 환경변수를 확인하세요.');
  }

  const response = await fetch(GAS_URL, {
    method: 'POST',
    // Apps Script는 단순 요청을 받아야 CORS 문제가 안 생깁니다.
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`서버 응답 오류 (${response.status})`);
  }

  const data = await response.json();
  if (!data.ok) {
    throw new Error(data.error || '알 수 없는 오류가 발생했습니다.');
  }
  return data;
}

// ===== 각 기능별 함수 =====

// 로그인
export async function apiLogin(name: string, password: string) {
  const data = await callGatekeeper({ action: 'login', name, password });
  return data.user as Participant;
}

// 신청 목록 가져오기 (관리자=전체, 참가자=본인 것만)
export async function apiGetApplications(name: string, role: string) {
  const data = await callGatekeeper({ action: 'getApplications', name, role });
  return (data.applications || []) as Application[];
}

// 새 신청 만들기
export async function apiCreateApplication(application: Application) {
  const data = await callGatekeeper({ action: 'createApplication', application });
  return data.신청번호 as string;
}

// 신청 상태 변경 (승인/반려)
export async function apiUpdateStatus(params: {
  신청번호: string;
  상태: string;
  반려사유?: string;
  처리자?: string;
}) {
  return await callGatekeeper({ action: 'updateStatus', ...params });
}

// 참가자 한 명 정보 가져오기 (예산 등 최신값 조회용)
export async function apiGetParticipant(name: string) {
  const data = await callGatekeeper({ action: 'getParticipant', name });
  return data.participant as Participant;
}

// 회원가입
export async function apiSignup(params: {
  참가자명: string;
  비밀번호: string;
  팀장명?: string;
  연락처?: string;
  경상국립대생여부?: boolean;
}) {
  const data = await callGatekeeper({ action: 'signup', ...params });
  return data.참가자명 as string;
}

// 참가자 전체 목록 (관리자용)
export async function apiGetParticipants(role: string) {
  const data = await callGatekeeper({ action: 'getParticipants', role });
  return (data.participants || []) as Participant[];
}
