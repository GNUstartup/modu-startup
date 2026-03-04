import { useState } from 'react';
import { Info, AlertCircle, FileText, ChevronRight, ChevronDown, ArrowRight } from 'lucide-react';

export default function ProgramGuide() {
    const [openSection, setOpenSection] = useState<string | null>('재료비');

    const toggleSection = (section: string) => {
        setOpenSection(openSection === section ? null : section);
    };

    const ProcessFlow = ({ steps }: { steps: string[] }) => (
        <div className="flex flex-wrap items-center gap-2 mb-4 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100/50">
            {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                    <span className="font-semibold text-sm text-indigo-800 bg-white px-3 py-1.5 rounded-full shadow-sm border border-indigo-100">
                        {step}
                    </span>
                    {index < steps.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-indigo-400 mx-2" />
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-neutral-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
                    <h1 className="text-2xl font-bold text-neutral-900 flex items-center mb-4">
                        <Info className="w-6 h-6 mr-2 text-indigo-600" />
                        프로그램 안내 및 유의사항
                    </h1>

                    <div className="mb-4">
                        <h4 className="text-sm font-bold text-neutral-700 mb-2">공통 진행 프로세스</h4>
                        <ProcessFlow steps={['신청(참가자)', '검토(사업단)', '진행(사업단)', '보고(참가자)']} />
                    </div>

                    <p className="mt-2 text-sm text-neutral-500">
                        기존의 카카오톡 접수 방식은 종료되었으며, <strong>웹페이지 내 [새 신청서 작성]을 통해 접수</strong>해 주시기 바랍니다.
                    </p>
                </div>

                {/* Section 1: 공통 주의사항 및 지원금 성격 */}
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start mb-4">
                        <AlertCircle className="w-6 h-6 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                            <h2 className="text-lg font-bold text-red-900 mb-2">[필독] 공통 주의사항 및 지원금 성격</h2>
                            <p className="text-base text-red-800 leading-relaxed font-medium">
                                성장 지원금은 단순 장학금이 아닌 <strong>정부(중기부) 예산 '사업비'</strong>입니다.<br />
                            </p>
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="bg-white/80 p-4 rounded-xl border border-red-200/50 flex flex-col items-center text-center">
                                    <span className="text-red-700 font-bold mb-1">💸 구매대행 원칙</span>
                                    <span className="text-xs text-red-600">사업단 직접 결제 원칙.<br /><strong>개인 카드/계좌 이체 절대 불가</strong></span>
                                </div>
                                <div className="bg-white/80 p-4 rounded-xl border border-red-200/50 flex flex-col items-center text-center">
                                    <span className="text-red-700 font-bold mb-1">🧾 명의 통일</span>
                                    <span className="text-xs text-red-600">모든 영수증 및 세금계산서는<br /><strong>[경상국립대학교 산학협력단]</strong> 발행 필수</span>
                                </div>
                                <div className="bg-white/80 p-4 rounded-xl border border-red-200/50 flex flex-col items-center text-center">
                                    <span className="text-red-700 font-bold mb-1">📅 12월 31일 기한</span>
                                    <span className="text-xs text-red-600">12월 31일까지 <strong>모든 지출 완료</strong><br />(원인행위는 1주일 전까지 마감)</span>
                                </div>
                                <div className="bg-white/80 p-4 rounded-xl border border-red-200/50 flex flex-col items-center text-center">
                                    <span className="text-red-700 font-bold mb-1">🚫 3대 금지사항</span>
                                    <span className="text-xs text-red-600">자산성 물품(PC·노트북) 구매 불가.<br />타 사업 중복수혜 불가.<br />원본 서류 분실 주의.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: 비목별 프로세스 및 서류 */}
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                    <div className="bg-indigo-50 border-b border-indigo-100 p-5">
                        <h3 className="text-lg font-bold text-indigo-900 flex items-center">
                            <FileText className="w-5 h-5 mr-2" />
                            [비목별 상세 안내 및 필수 제출 서류]
                        </h3>
                    </div>
                    <div className="divide-y divide-neutral-100">

                        {/* 여비 Accordion */}
                        <div>
                            <button
                                onClick={() => toggleSection('여비')}
                                className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors focus:outline-none"
                            >
                                <div className="flex items-center">
                                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold text-[#0288D1] bg-[#E1F5FE] border border-[#B3E5FC]">
                                        여비
                                    </span>
                                    <span className="ml-3 text-sm font-bold text-neutral-700">증빙 기반 실비 지급 (출장 신청 절차)</span>
                                </div>
                                {openSection === '여비' ? <ChevronDown className="w-5 h-5 text-neutral-400" /> : <ChevronRight className="w-5 h-5 text-neutral-400" />}
                            </button>
                            {openSection === '여비' && (
                                <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-200">
                                    <div className="mb-4">
                                        <h4 className="text-sm font-bold text-neutral-700 mb-2">진행 프로세스</h4>
                                        <ProcessFlow steps={['사전신청 (출장 전주)', '사업단 검토', '출장 진행', '증빙서류 제출', '실비 지급']} />
                                    </div>
                                    <div className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden mb-4">
                                        <table className="min-w-full divide-y divide-neutral-200 text-sm">
                                            <thead className="bg-neutral-100">
                                                <tr>
                                                    <th scope="col" className="px-4 py-3 text-center font-bold text-neutral-600 w-16">순번</th>
                                                    <th scope="col" className="px-4 py-3 text-left font-bold text-neutral-600">여비 필수 제출 서류 (4종)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-neutral-200">
                                                {[
                                                    "출장계획서 (사전 제출)", "출장보고서", "증빙사진 및 영수증 실비 내역", "개인 통장 사본 및 신분증 사본"
                                                ].map((doc, idx) => (
                                                    <tr key={idx} className="hover:bg-neutral-50">
                                                        <td className="px-4 py-2.5 text-center font-medium text-neutral-500">{idx + 1}</td>
                                                        <td className="px-4 py-2.5 text-neutral-800 font-medium">{doc}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="bg-[#E1F5FE]/50 p-4 rounded-xl text-sm text-[#0277BD]">
                                        <strong>[실비 지급 기준 상세]</strong><br />
                                        KTX는 <strong>일반실</strong>에 한하며, 버스는 <strong>우등버스 이하</strong> 등급 실비만 지급됩니다. (KTX 특실, 프리미엄 고속버스 등 초과 비용 지원 불가)
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 재료비 Accordion */}
                        <div>
                            <button
                                onClick={() => toggleSection('재료비')}
                                className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors focus:outline-none"
                            >
                                <div className="flex items-center">
                                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold text-[#2E7D32] bg-[#E8F5E9] border border-[#C8E6C9]">
                                        재료비
                                    </span>
                                    <span className="ml-3 text-sm font-bold text-neutral-700">시제품 제작 소모품 (필수 서류 표 10종)</span>
                                </div>
                                {openSection === '재료비' ? <ChevronDown className="w-5 h-5 text-neutral-400" /> : <ChevronRight className="w-5 h-5 text-neutral-400" />}
                            </button>
                            {openSection === '재료비' && (
                                <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-200">
                                    <div className="mb-4">
                                        <h4 className="text-sm font-bold text-neutral-700 mb-2">진행 프로세스</h4>
                                        <ProcessFlow steps={['매주 월요일 신청', '화~수 일괄구매', '검수 및 사진촬영', '서류 제출 완료']} />
                                    </div>
                                    <div className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden">
                                        <table className="min-w-full divide-y divide-neutral-200 text-sm">
                                            <thead className="bg-neutral-100">
                                                <tr>
                                                    <th scope="col" className="px-4 py-3 text-center font-bold text-neutral-600 w-16">순번</th>
                                                    <th scope="col" className="px-4 py-3 text-left font-bold text-neutral-600">재료비 필수 제출 서류 (10종 전체)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-neutral-200">
                                                {[
                                                    "구매계획서", "물품구입요청서", "견적서", "비교견적서 (2곳 이상)", "영수증",
                                                    "검수사진", "사업자등록증", "통장사본", "거래명세서", "청구서"
                                                ].map((doc, idx) => (
                                                    <tr key={idx} className="hover:bg-neutral-50">
                                                        <td className="px-4 py-2.5 text-center font-medium text-neutral-500">{idx + 1}</td>
                                                        <td className="px-4 py-2.5 text-neutral-800 font-medium">{doc}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 외주용역비 Accordion */}
                        <div>
                            <button
                                onClick={() => toggleSection('외주용역비')}
                                className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors focus:outline-none"
                            >
                                <div className="flex items-center">
                                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold text-[#7B1FA2] bg-[#F3E5F5] border border-[#E1BEE7]">
                                        외주용역비
                                    </span>
                                    <span className="ml-3 text-sm font-bold text-neutral-700">시제품 고도화 외부 계약 (계약 12종 / 완료 6종)</span>
                                </div>
                                {openSection === '외주용역비' ? <ChevronDown className="w-5 h-5 text-neutral-400" /> : <ChevronRight className="w-5 h-5 text-neutral-400" />}
                            </button>
                            {openSection === '외주용역비' && (
                                <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-200">
                                    <div className="mb-4">
                                        <h4 className="text-sm font-bold text-neutral-700 mb-2">계약 처리 절차 (1~2주 소요)</h4>
                                        <ProcessFlow steps={['용역 신청서 접수', '사업단 사전 검토', '3자 서면 계약 체결', '용역 수행 완료 보고', '비용 지출']} />
                                    </div>
                                    <div className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden mb-4">
                                        <table className="min-w-full divide-y divide-neutral-200 text-sm">
                                            <thead className="bg-[#F3E5F5]/70">
                                                <tr>
                                                    <th scope="col" className="px-4 py-3 text-center font-bold text-[#6A1B9A] w-16">순번</th>
                                                    <th scope="col" className="px-4 py-3 text-left font-bold text-[#6A1B9A]">[계약 진행 시] 필수 서류 12종</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-neutral-200">
                                                {[
                                                    "표준계약서 (모든 장에 간인 및 날인 필수)", "과업지시서", "세부산출내역서", "비교견적서",
                                                    "업체이력서 (포트폴리오 등 업력 증빙)", "사업자등록증", "통장사본", "인감증명서",
                                                    "사용인감계", "완납증명서 (국세)", "완납증명서 (지방세)", "완납증명서 (4대보험)"
                                                ].map((doc, idx) => (
                                                    <tr key={idx} className="hover:bg-neutral-50">
                                                        <td className="px-4 py-2 text-center font-medium text-neutral-500">{idx + 1}</td>
                                                        <td className="px-4 py-2 text-neutral-800 font-medium">{doc}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden">
                                        <table className="min-w-full divide-y divide-neutral-200 text-sm">
                                            <thead className="bg-[#F3E5F5]/70">
                                                <tr>
                                                    <th scope="col" className="px-4 py-3 text-center font-bold text-[#6A1B9A] w-16">순번</th>
                                                    <th scope="col" className="px-4 py-3 text-left font-bold text-[#6A1B9A]">[용역 완료 시] 추가 제출 서류 6종</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-neutral-200">
                                                {[
                                                    "결과보고서", "완료 사진 자료", "검수확인서", "전자세금계산서 (산학협력단 발행)", "거래명세서", "청구서"
                                                ].map((doc, idx) => (
                                                    <tr key={idx} className="hover:bg-neutral-50">
                                                        <td className="px-4 py-2 text-center font-medium text-neutral-500">{idx + 1}</td>
                                                        <td className="px-4 py-2 text-neutral-800 font-medium">{doc}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 지급수수료 Accordion */}
                        <div>
                            <button
                                onClick={() => toggleSection('지급수수료')}
                                className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors focus:outline-none"
                            >
                                <div className="flex items-center">
                                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold text-[#F57F17] bg-[#FFF8E1] border border-[#FFECB3]">
                                        지급수수료
                                    </span>
                                    <span className="ml-3 text-sm font-bold text-neutral-700">전문가 활용비 (멘토링) 및 시험·인증비</span>
                                </div>
                                {openSection === '지급수수료' ? <ChevronDown className="w-5 h-5 text-neutral-400" /> : <ChevronRight className="w-5 h-5 text-neutral-400" />}
                            </button>
                            {openSection === '지급수수료' && (
                                <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-200">

                                    <div className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden mb-4">
                                        <table className="min-w-full divide-y divide-neutral-200 text-sm">
                                            <thead className="bg-[#FFF8E1]/80">
                                                <tr>
                                                    <th scope="col" className="px-4 py-3 text-left font-bold text-[#E65100]">전문가활용비 (멘토 자격 요건 6가지)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-neutral-200">
                                                {[
                                                    "1. 관련 분야 박사학위 소지자",
                                                    "2. 대학 조교수 이상 전임 교원",
                                                    "3. 관련 분야 기술사, 건축사, 공인회계사, 세무사, 변호사, 변리사 등 공인 자격증 소지자",
                                                    "4. 관련 분야 석사학위 소지 후 3년 이상 경력자",
                                                    "5. 관련 분야 학사학위 소지 후 5년 이상 경력자",
                                                    "6. 기타 위 항목과 동등한 자격이 있다고 사업단이 인정하는 자"
                                                ].map((req, idx) => (
                                                    <tr key={idx} className="hover:bg-neutral-50">
                                                        <td className="px-4 py-2.5 text-neutral-800 font-medium">{req}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden mb-4">
                                        <table className="min-w-full divide-y divide-neutral-200 text-sm">
                                            <thead className="bg-[#FFF8E1]/80">
                                                <tr>
                                                    <th scope="col" className="px-4 py-3 text-center font-bold text-[#E65100] w-24">구분</th>
                                                    <th scope="col" className="px-4 py-3 text-left font-bold text-[#E65100]">상세 제출 서류</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-neutral-200">
                                                <tr className="hover:bg-neutral-50">
                                                    <td className="px-4 py-3 text-center font-bold text-neutral-700 bg-neutral-50/50">멘토링 서류</td>
                                                    <td className="px-4 py-3 text-neutral-800 font-medium whitespace-pre-line leading-relaxed">
                                                        • <strong>전문가 이력서</strong> (자격 증빙 포트폴리오 첨부필)<br />
                                                        • 자문(멘토링) 신청 및 계획서 (지출 전 사전 승인 필수)<br />
                                                        • 전문가 자문(멘토링) 결과보고서<br />
                                                        • 전문가 본인 명의 통장 사본 / 신분증 사본
                                                    </td>
                                                </tr>
                                                <tr className="hover:bg-neutral-50">
                                                    <td className="px-4 py-3 text-center font-bold text-neutral-700 bg-neutral-50/50">시험·인증비</td>
                                                    <td className="px-4 py-3 text-neutral-800 font-medium whitespace-pre-line leading-relaxed">
                                                        • <strong>유의사항:</strong> 시제품 제작과 직접적으로 관련된 필수 시험 및 공인 인증 비용만 한정 지원.<br />
                                                        • <strong>제출서류:</strong> 견적서, 전자세금계산서, 청구서, 결과(인증)서빙 등
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 광고선전비 Accordion */}
                        <div>
                            <button
                                onClick={() => toggleSection('광고선전비')}
                                className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors focus:outline-none"
                            >
                                <div className="flex items-center">
                                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold text-[#00695C] bg-[#E0F2F1] border border-[#B2DFDB]">
                                        광고선전비
                                    </span>
                                    <span className="ml-3 text-sm font-bold text-neutral-700">홈페이지, 영상 제작, 홍보물 인쇄 등 (9종)</span>
                                </div>
                                {openSection === '광고선전비' ? <ChevronDown className="w-5 h-5 text-neutral-400" /> : <ChevronRight className="w-5 h-5 text-neutral-400" />}
                            </button>
                            {openSection === '광고선전비' && (
                                <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-200">

                                    <div className="bg-[#E0F2F1]/50 p-4 rounded-xl text-sm text-[#00695C] mb-4">
                                        <strong>[지원 범위 안내]</strong><br />
                                        창업 아이템의 직접적인 홍보를 위한 홈페이지 구축, 홍보 영상 제작 관리, 브로슈어 및 팸플릿 인쇄 등
                                    </div>

                                    <div className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden">
                                        <table className="min-w-full divide-y divide-neutral-200 text-sm">
                                            <thead className="bg-[#E0F2F1]/80">
                                                <tr>
                                                    <th scope="col" className="px-4 py-3 text-center font-bold text-[#00695C] w-16">순번</th>
                                                    <th scope="col" className="px-4 py-3 text-left font-bold text-[#00695C]">광고선전비 필수 제출 서류 (9종)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-neutral-200">
                                                {[
                                                    "집행계획서 및 품의서 (홈페이지/영상 시방서 등 포함)",
                                                    "견적서",
                                                    "비교견적서 (2곳 이상)",
                                                    "사업자등록증",
                                                    "통장사본",
                                                    "과업지시서 및 3자 계약서 (금액/업체 규모 판단에 따라 추가 가능)",
                                                    "전자세금계산서",
                                                    "거래명세서 / 청구서",
                                                    "결과보고서 및 성과물 (캡처, 영상 파일, 완성 이미지 등)"
                                                ].map((doc, idx) => (
                                                    <tr key={idx} className="hover:bg-neutral-50">
                                                        <td className="px-4 py-2.5 text-center font-medium text-neutral-500">{idx + 1}</td>
                                                        <td className="px-4 py-2.5 text-neutral-800 font-medium">{doc}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
