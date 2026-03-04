import { useState } from 'react';
import { Info, AlertCircle, FileText, ChevronRight, ArrowRight, Plane, Box, Briefcase, UserCheck, Megaphone } from 'lucide-react';

export default function ProgramGuide() {
    const [openModal, setOpenModal] = useState<string | null>(null);

    const ProcessFlow = ({ steps }: { steps: string[] }) => (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 bg-indigo-50/50 p-4 rounded-lg border border-indigo-100/50">
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

    const Modal = ({ category, title, children }: { category: string, title: string, children: React.ReactNode }) => {
        if (openModal !== category) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setOpenModal(null)}>
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                    <div className="sticky top-0 bg-white border-b border-neutral-100 p-6 flex justify-between items-center z-10">
                        <h2 className="text-2xl font-bold text-neutral-900">{title} 상세 안내</h2>
                        <button onClick={() => setOpenModal(null)} className="text-neutral-500 hover:text-neutral-900 font-bold p-2 text-xl">&times;</button>
                    </div>
                    <div className="p-6">
                        {children}
                    </div>
                    <div className="border-t border-neutral-100 p-6 bg-neutral-50 flex justify-end sticky bottom-0 z-10">
                        <button onClick={() => setOpenModal(null)} className="px-6 py-2.5 bg-neutral-800 text-white rounded-xl font-bold hover:bg-neutral-900 transition-colors">
                            닫기
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-neutral-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-200 text-center">
                    <h1 className="text-3xl font-extrabold text-neutral-900 flex justify-center items-center mb-4">
                        <Info className="w-8 h-8 mr-3 text-indigo-600" />
                        프로그램 안내 및 유의사항
                    </h1>
                    <p className="mt-4 text-base font-medium text-neutral-600 bg-indigo-50 inline-block px-6 py-3 rounded-2xl border border-indigo-100">
                        기존의 카톡 접수 방식은 종료되었습니다.<br />
                        <strong className="text-indigo-800 text-lg">웹페이지 상단 [새 신청서 작성] 메뉴에서 접수</strong>해 주시기 바랍니다.
                    </p>
                </div>

                {/* Section 1: 공통 주의사항 및 지원금 성격 */}
                <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-3xl p-8 shadow-sm">
                    <div className="flex flex-col items-center mb-6 text-center">
                        <AlertCircle className="w-10 h-10 text-red-600 mb-3" />
                        <h2 className="text-2xl font-bold text-red-900 mb-2">[필독] 공통 주의사항</h2>
                        <p className="text-base text-red-800 font-medium">
                            성장 지원금은 단순 장학금이 아닌 <strong>정부(중기부) 예산 '사업비'</strong>입니다.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-6 rounded-2xl border border-red-200 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                            <span className="text-3xl mb-3">💳</span>
                            <span className="text-red-800 font-bold text-lg mb-2">구매대행 원칙</span>
                            <span className="text-sm text-red-600 font-medium">사업단 직접 결제만 가능<br />(개인 카드/계좌이체 절대 불가)</span>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-red-200 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                            <span className="text-3xl mb-3">🏢</span>
                            <span className="text-red-800 font-bold text-lg mb-2">명의 통일</span>
                            <span className="text-sm text-red-600 font-medium">모든 증빙은<br /><strong>'경상국립대학교 산학협력단'</strong><br />명의 발행 필수</span>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-red-200 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                            <span className="text-3xl mb-3">⏳</span>
                            <span className="text-red-800 font-bold text-lg mb-2">기한 및 소요 시간</span>
                            <span className="text-sm text-red-600 font-medium">12월 31일 집행 마감<br />실제 지급까지 1~3주 소요</span>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-red-200 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                            <span className="text-3xl mb-3">🚫</span>
                            <span className="text-red-800 font-bold text-lg mb-2">금지사항</span>
                            <span className="text-sm text-red-600 font-medium">PC, 노트북 등<br />자산성 물품 구매 불가</span>
                        </div>
                    </div>
                </div>

                {/* Section 2: 비목별 큰 버튼 Grid */}
                <div>
                    <h3 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center justify-center">
                        <FileText className="w-6 h-6 mr-3 text-indigo-600" />
                        지원 비목별 상세 안내
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">

                        <button onClick={() => setOpenModal('여비')} className="group flex flex-col items-center justify-center p-8 bg-white border-2 border-[#B3E5FC] rounded-3xl shadow-sm hover:shadow-xl hover:bg-[#E1F5FE] hover:border-[#0288D1] transition-all duration-300 transform hover:-translate-y-1">
                            <Plane className="w-12 h-12 text-[#0288D1] mb-4 group-hover:scale-110 transition-transform" />
                            <span className="text-xl font-extrabold text-[#0277BD] mb-2">여비</span>
                            <span className="text-sm text-neutral-500 font-medium text-center">증빙 기반 실비 지급<br />(출장 신청 절차)</span>
                        </button>

                        <button onClick={() => setOpenModal('재료비')} className="group flex flex-col items-center justify-center p-8 bg-white border-2 border-[#C8E6C9] rounded-3xl shadow-sm hover:shadow-xl hover:bg-[#E8F5E9] hover:border-[#2E7D32] transition-all duration-300 transform hover:-translate-y-1">
                            <Box className="w-12 h-12 text-[#2E7D32] mb-4 group-hover:scale-110 transition-transform" />
                            <span className="text-xl font-extrabold text-[#1B5E20] mb-2">재료비</span>
                            <span className="text-sm text-neutral-500 font-medium text-center">시제품 제작 소모품<br />(필수 서류 10종)</span>
                        </button>

                        <button onClick={() => setOpenModal('외주용역비')} className="group flex flex-col items-center justify-center p-8 bg-white border-2 border-[#E1BEE7] rounded-3xl shadow-sm hover:shadow-xl hover:bg-[#F3E5F5] hover:border-[#7B1FA2] transition-all duration-300 transform hover:-translate-y-1">
                            <Briefcase className="w-12 h-12 text-[#7B1FA2] mb-4 group-hover:scale-110 transition-transform" />
                            <span className="text-xl font-extrabold text-[#4A148C] mb-2">외주용역비</span>
                            <span className="text-sm text-neutral-500 font-medium text-center">시제품 고도화 외부 계약<br />(계약 12종 / 완료 6종)</span>
                        </button>

                        <button onClick={() => setOpenModal('지급수수료')} className="group flex flex-col items-center justify-center p-8 bg-white border-2 border-[#FFECB3] rounded-3xl shadow-sm hover:shadow-xl hover:bg-[#FFF8E1] hover:border-[#F57F17] transition-all duration-300 transform hover:-translate-y-1 lg:col-start-2">
                            <UserCheck className="w-12 h-12 text-[#F57F17] mb-4 group-hover:scale-110 transition-transform" />
                            <span className="text-xl font-extrabold text-[#E65100] mb-2">지급수수료</span>
                            <span className="text-sm text-neutral-500 font-medium text-center">전문가 멘토링 비용<br />및 시험·인증비</span>
                        </button>

                        <button onClick={() => setOpenModal('광고선전비')} className="group flex flex-col items-center justify-center p-8 bg-white border-2 border-[#B2DFDB] rounded-3xl shadow-sm hover:shadow-xl hover:bg-[#E0F2F1] hover:border-[#00695C] transition-all duration-300 transform hover:-translate-y-1">
                            <Megaphone className="w-12 h-12 text-[#00695C] mb-4 group-hover:scale-110 transition-transform" />
                            <span className="text-xl font-extrabold text-[#004D40] mb-2">광고선전비</span>
                            <span className="text-sm text-neutral-500 font-medium text-center">홈페이지, 영상 제작,<br />홍보물 인쇄 등 (9종)</span>
                        </button>
                    </div>
                </div>

                {/* Modals */}
                <Modal category="여비" title="[여비]">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-[#0288D1] mb-2">여비 프로세스</h3>
                            <ProcessFlow steps={['사전신청', '출장', '증빙제출', '실비지급']} />
                        </div>
                        <div className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-neutral-200 text-sm">
                                <thead className="bg-[#E1F5FE]">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-center font-bold text-[#0277BD] w-16">순번</th>
                                        <th scope="col" className="px-4 py-3 text-left font-bold text-[#0277BD]">필수 제출 서류</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-neutral-200 text-neutral-800">
                                    <tr className="hover:bg-neutral-50">
                                        <td className="px-4 py-3 text-center font-medium text-neutral-500">1</td>
                                        <td className="px-4 py-3 font-medium">출장계획서</td>
                                    </tr>
                                    <tr className="hover:bg-neutral-50">
                                        <td className="px-4 py-3 text-center font-medium text-neutral-500">2</td>
                                        <td className="px-4 py-3 font-medium">보고서</td>
                                    </tr>
                                    <tr className="hover:bg-neutral-50">
                                        <td className="px-4 py-3 text-center font-medium text-neutral-500">3</td>
                                        <td className="px-4 py-3 font-medium">영수증</td>
                                    </tr>
                                    <tr className="hover:bg-neutral-50">
                                        <td className="px-4 py-3 text-center font-medium text-neutral-500">4</td>
                                        <td className="px-4 py-3 font-medium">증빙사진</td>
                                    </tr>
                                    <tr className="hover:bg-neutral-50">
                                        <td className="px-4 py-3 text-center font-medium text-neutral-500">5</td>
                                        <td className="px-4 py-3 font-medium">신분증 사본 / 통장 사본</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start">
                            <Info className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-900 font-medium">
                                <strong>[실비 기준]</strong> KTX 일반실, 우등버스 이하 등급의 실비만 지급됩니다. (초과 비용 지원 불가)
                            </p>
                        </div>
                    </div>
                </Modal>

                <Modal category="재료비" title="[재료비]">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-[#2E7D32] mb-2">재료비 프로세스</h3>
                            <ProcessFlow steps={['월요일 신청', '화~수 구매', '검수', '서류 제출']} />
                        </div>
                        <div className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-neutral-200 text-sm">
                                <thead className="bg-[#E8F5E9]">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-center font-bold text-[#1B5E20] w-16">순번</th>
                                        <th scope="col" className="px-4 py-3 text-left font-bold text-[#1B5E20]">필수 제출 서류 (10종)</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-neutral-200 text-neutral-800">
                                    {[
                                        "구매계획서", "구입요청서", "견적서", "비교견적서 (2곳 이상)", "영수증",
                                        "검수사진", "사업자등록증", "통장사본", "거래명세서", "청구서"
                                    ].map((doc, idx) => (
                                        <tr key={idx} className="hover:bg-neutral-50">
                                            <td className="px-4 py-3 text-center font-medium text-neutral-500">{idx + 1}</td>
                                            <td className="px-4 py-3 font-medium">{doc}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Modal>

                <Modal category="외주용역비" title="[외주용역비]">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-[#7B1FA2] mb-2">외주용역비 프로세스</h3>
                            <ProcessFlow steps={['신청', '계약', '진행', '완료보고']} />
                        </div>
                        <div className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-neutral-200 text-sm">
                                <thead className="bg-[#F3E5F5]">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-center font-bold text-[#4A148C] w-16">순번</th>
                                        <th scope="col" className="px-4 py-3 text-left font-bold text-[#4A148C]">필수 제출 서류 (총 18종)</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-neutral-200 text-neutral-800">
                                    {[
                                        "표준계약서 (간인 필수)", "과업지시서", "견적서", "비교견적서",
                                        "사업자등록증", "통장사본", "인감증명서", "국세 완납증명서",
                                        "지방세 완납증명서", "4대보험 완납증명서",
                                        "세금계산서", "완료보고서",
                                        "세부산출내역서", "업체이력서 (포트폴리오 포함)", "사용인감계",
                                        "완료 사진 자료 (완료 시)", "검수확인서 (완료 시)", "거래명세서 / 청구서 (완료 시)"
                                    ].map((doc, idx) => (
                                        <tr key={idx} className="hover:bg-neutral-50">
                                            <td className="px-4 py-2.5 text-center font-medium text-neutral-500">{idx + 1}</td>
                                            <td className="px-4 py-2.5 font-medium">{doc}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Modal>

                <Modal category="지급수수료" title="[지급수수료]">
                    <div className="space-y-6">

                        <div className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-neutral-200 text-sm">
                                <thead className="bg-[#FFF8E1]">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-center font-bold text-[#E65100]">멘토링 전문가 자격 요건 (다음 중 하나 이상 충족: 6가지)</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-neutral-200 text-neutral-800">
                                    {[
                                        "1. 관련 분야 박사학위 소지자",
                                        "2. 대학 조교수 이상 전임 교원",
                                        "3. 관련 분야 기술사, 공인회계사, 세무사, 변호사, 변리사 등 공인 자격증 소지자",
                                        "4. 관련 분야 석사학위 소지 후 5년 이상 경력자",
                                        "5. 관련 분야 학사학위 소지 후 5년 이상 경력자",
                                        "6. 기타 위 항목과 동등한 자격이 있다고 사업단이 인정하는 자"
                                    ].map((item, idx) => (
                                        <tr key={idx} className="hover:bg-neutral-50">
                                            <td className="px-4 py-2.5 font-medium">{item}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-neutral-200 text-sm">
                                <thead className="bg-[#FFF8E1]">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-center font-bold text-[#E65100] w-1/4">구분</th>
                                        <th scope="col" className="px-4 py-3 text-left font-bold text-[#E65100]">유의사항 및 서류</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-neutral-200 text-neutral-800">
                                    <tr className="hover:bg-neutral-50">
                                        <td className="px-4 py-3 text-center font-bold text-neutral-700 bg-neutral-50/50">멘토링 서류 (4종)</td>
                                        <td className="px-4 py-3 font-medium">
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>위촉동의서</li>
                                                <li>이력서</li>
                                                <li>자문 신청 및 계획서</li>
                                                <li>결과보고서 (통장/신분증 사본 포함)</li>
                                            </ul>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-neutral-50">
                                        <td className="px-4 py-3 text-center font-bold text-neutral-700 bg-neutral-50/50">시험·인증비 (6종)</td>
                                        <td className="px-4 py-3 font-medium">
                                            <p className="mb-2 text-sm text-neutral-500">※ 시제품 제작과 직접적으로 관련된 필수 인증 비용만 지원</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>견적서</li>
                                                <li>비교견적서</li>
                                                <li>세금계산서</li>
                                                <li>청구서</li>
                                                <li>거래명세서</li>
                                                <li>결과(인증)서빙</li>
                                            </ul>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                    </div>
                </Modal>

                <Modal category="광고선전비" title="[광고선전비]">
                    <div className="space-y-6">
                        <div className="bg-[#E0F2F1]/50 p-4 rounded-xl text-sm text-[#00695C] border border-[#B2DFDB]">
                            <strong>[지원 범위 안내]</strong><br />
                            아이템 홍보를 위한 홈페이지 구축, 홍보 영상 제작 관리, 브로슈어 및 팸플릿 인쇄 등
                        </div>

                        <div className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-neutral-200 text-sm">
                                <thead className="bg-[#E0F2F1]">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-center font-bold text-[#004D40] w-16">순번</th>
                                        <th scope="col" className="px-4 py-3 text-left font-bold text-[#004D40]">필수 제출 서류 (9종)</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-neutral-200 text-neutral-800">
                                    {[
                                        "세금계산서",
                                        "견적서",
                                        "비교견적서",
                                        "거래명세서",
                                        "검수조서",
                                        "사업자등록증",
                                        "통장사본",
                                        "집행계획서 및 품의서",
                                        "과업지시서 및 3자 계약서 (필요 시 / 성과물 포함)"
                                    ].map((doc, idx) => (
                                        <tr key={idx} className="hover:bg-neutral-50">
                                            <td className="px-4 py-2.5 text-center font-medium text-neutral-500">{idx + 1}</td>
                                            <td className="px-4 py-2.5 font-medium">{doc}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Modal>

            </div>
        </div>
    );
}
