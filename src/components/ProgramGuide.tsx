import { Info, AlertCircle, Clock, Calendar } from 'lucide-react';

export default function ProgramGuide() {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden mb-6">
            <div className="bg-indigo-50 border-b border-indigo-100 p-5 flex items-center">
                <Info className="w-5 h-5 text-indigo-600 mr-2" />
                <h3 className="text-lg font-bold text-indigo-900">프로그램 집행 안내 및 유의사항</h3>
            </div>

            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                        <h4 className="text-sm font-bold text-red-800 mb-1">전체 구조: 사업단 구매대행 방식</h4>
                        <p className="text-sm text-red-700">본 프로그램의 모든 예산 집행은 <strong>사업단 구매대행 방식</strong>으로 진행됩니다. 학생(팀) 개인 카드로 선결제 후 청구하는 방식은 <strong>절대 불가</strong>하오니 유의하시기 바랍니다.</p>
                    </div>
                </div>

                <div className="overflow-x-auto mb-6">
                    <table className="min-w-full divide-y divide-neutral-200 border border-neutral-200 rounded-lg">
                        <thead className="bg-neutral-50/80">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-center text-[13px] font-bold text-neutral-600 tracking-wider">비목</th>
                                <th scope="col" className="px-4 py-3 text-center text-[13px] font-bold text-neutral-600 tracking-wider">집행 내용</th>
                                <th scope="col" className="px-4 py-3 text-center text-[13px] font-bold text-neutral-600 tracking-wider">프로세스 및 비고</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-neutral-200">
                            <tr>
                                <td className="px-4 py-3 whitespace-nowrap text-center">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold text-[#0288D1] bg-[#E1F5FE]">여비</span>
                                </td>
                                <td className="px-4 py-3 text-sm text-neutral-700 font-medium text-center">
                                    시외교통비
                                </td>
                                <td className="px-4 py-3 text-sm text-neutral-600">
                                    목적지 및 일정 제출 → 담당자 확인 → 영수증 증빙 (시외버스, KTX 등)
                                </td>
                            </tr>
                            <tr className="bg-neutral-50/30">
                                <td className="px-4 py-3 whitespace-nowrap text-center">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold text-[#2E7D32] bg-[#E8F5E9]">재료비</span>
                                </td>
                                <td className="px-4 py-3 text-sm text-neutral-700 font-medium text-center">
                                    시제품 제작 소요 재료
                                </td>
                                <td className="px-4 py-3 text-sm text-neutral-600">
                                    견적 및 링크 제출 → 담당자 대행 구매 → 수령 확인 및 결과보고서 제출
                                </td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 whitespace-nowrap text-center">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold text-[#7B1FA2] bg-[#F3E5F5]">외주용역비</span>
                                </td>
                                <td className="px-4 py-3 text-sm text-neutral-700 font-medium text-center">
                                    시제품 고도화 (디자인, 개발 등)
                                </td>
                                <td className="px-4 py-3 text-sm text-neutral-600">
                                    과업지시서 및 견적 제출 → 3자 계약 체결 → 결과물 검수 및 잔금 지급
                                </td>
                            </tr>
                            <tr className="bg-neutral-50/30">
                                <td className="px-4 py-3 whitespace-nowrap text-center">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold text-[#F57F17] bg-[#FFF8E1]">지급수수료</span>
                                </td>
                                <td className="px-4 py-3 text-sm text-neutral-700 font-medium text-center">
                                    전문가 멘토링, 인증 수수료
                                </td>
                                <td className="px-4 py-3 text-sm text-neutral-600">
                                    이력서 및 계획 제출 → 멘토링 진행 → 결과보고서 제출 → 수당 지급
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 flex items-start">
                        <Clock className="w-5 h-5 text-neutral-600 mr-3 flex-shrink-0" />
                        <div>
                            <h4 className="text-sm font-bold text-neutral-900 mb-1">소요 시간 안내</h4>
                            <p className="text-sm text-neutral-600">신청 승인 및 최종 결제 완료까지 <strong>약 1~3주 가량 소요</strong>됩니다. 일정을 고려하여 미리 신청해 주시기 바랍니다.</p>
                        </div>
                    </div>

                    <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 flex items-start">
                        <Calendar className="w-5 h-5 text-neutral-600 mr-3 flex-shrink-0" />
                        <div>
                            <h4 className="text-sm font-bold text-neutral-900 mb-1">최종 집행 기한</h4>
                            <p className="text-sm text-neutral-600">본 프로그램의 최종 예산 집행 마감일은 <strong>12월 31일</strong>입니다. 마감일 이후에는 어떠한 결제도 불가합니다.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
