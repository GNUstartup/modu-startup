import { useState } from 'react';
import { Info, AlertCircle, FileText, Plane, Box, Briefcase, UserCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

// Design Components
const SectionBadge = ({ title, color = "indigo" }: { title: string, color?: "indigo" | "blue" | "green" | "purple" | "orange" }) => {
    const colorMap = {
        indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
        blue: "bg-blue-50 text-blue-700 border-blue-200",
        green: "bg-green-50 text-green-700 border-green-200",
        purple: "bg-purple-50 text-purple-700 border-purple-200",
        orange: "bg-orange-50 text-orange-700 border-orange-200"
    };
    return (
        <span className={`inline-flex items-center px-3 py-1 mb-3 rounded-full text-sm font-bold border ${colorMap[color]} shadow-sm`}>
            {title}
        </span>
    );
};

const NoticeCard = ({ children, color = "neutral" }: { children: React.ReactNode, color?: "neutral" | "red" | "blue" | "green" | "purple" | "orange" }) => {
    const colorMap = {
        neutral: "bg-neutral-50 border-neutral-200 text-neutral-800",
        red: "bg-red-50 border-red-200 text-red-900",
        blue: "bg-blue-50 border-blue-200 text-blue-900",
        green: "bg-green-50 border-green-200 text-green-900",
        purple: "bg-purple-50 border-purple-200 text-purple-900",
        orange: "bg-orange-50 border-orange-200 text-orange-900"
    };
    const iconColorMap = {
        neutral: "text-neutral-500",
        red: "text-red-500",
        blue: "text-blue-500",
        green: "text-green-500",
        purple: "text-purple-500",
        orange: "text-orange-500"
    };

    return (
        <div className={`p-4 mb-5 rounded-xl border flex items-start gap-3 shadow-sm ${colorMap[color]}`}>
            <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColorMap[color]}`} />
            <div className="flex-1 space-y-2">
                {children}
            </div>
        </div>
    );
};

const ProcessFlow = ({ steps }: { steps: string[] }) => {
    return (
        <div className="flex flex-wrap items-center gap-2 mb-5">
            {steps.map((step, index) => (
                <div key={index} className="flex items-center mt-2">
                    <span className="font-bold text-[13px] text-neutral-800 bg-white px-3 py-1.5 rounded-full shadow-sm border border-neutral-200">
                        {step}
                    </span>
                    {index < steps.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-neutral-400 mx-1 flex-shrink-0" />
                    )}
                </div>
            ))}
        </div>
    );
};

const DocumentTable = ({ headers, rows, color = "indigo" }: { headers: string[], rows: (string | React.ReactNode)[][], color?: string }) => {
    const bgHeaderMap: Record<string, string> = {
        indigo: "bg-indigo-600", blue: "bg-[#0288D1]", green: "bg-[#2E7D32]", purple: "bg-[#7B1FA2]", orange: "bg-[#E65100]"
    };
    const headerClass = bgHeaderMap[color] || "bg-neutral-800";

    return (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm mb-5">
            <table className="min-w-full text-sm sm:text-base border-collapse text-left">
                <thead className={`${headerClass} text-white`}>
                    <tr>
                        {headers.map((h, i) => (
                            <th key={i} scope="col" className={`px-4 py-3 font-semibold ${i === 0 ? 'w-20 sm:w-24 text-center border-r border-white/20' : ''}`}>
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="text-neutral-800 divide-y divide-neutral-100">
                    {rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-neutral-50/50 transition-colors">
                            {row.map((cell, cIdx) => (
                                <td key={cIdx} className={`px-4 py-3 font-medium ${cIdx === 0 ? 'text-center text-neutral-500 border-r border-neutral-100 font-bold whitespace-nowrap' : 'border-r border-neutral-100 last:border-r-0'}`}>
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


export default function ProgramGuide() {
    const [openModal, setOpenModal] = useState<string | null>(null);

    const Modal = ({ category, title, color, children }: { category: string, title: string, color: string, children: React.ReactNode }) => {
        if (openModal !== category) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setOpenModal(null)}>
                <div className="bg-white rounded-2xl shadow-xl w-[90vw] md:w-[80vw] max-w-none max-h-[90vh] overflow-y-auto transform transition-all animate-in fade-in zoom-in-95 duration-200 whitespace-pre-wrap break-keep" onClick={e => e.stopPropagation()}>
                    <div className="sticky top-0 bg-white border-b border-neutral-200 p-5 sm:p-6 flex justify-between items-start sm:items-center z-10 shadow-sm">
                        <div className="flex flex-col gap-1.5">
                            <h2 className={`text-xl sm:text-2xl font-bold text-${color}-800`}>{title}</h2>
                        </div>
                        <button onClick={() => setOpenModal(null)} className="text-neutral-400 hover:text-neutral-900 font-bold p-1 text-2xl leading-none">&times;</button>
                    </div>
                    <div className="p-5 sm:p-8 text-neutral-800 text-sm sm:text-base leading-relaxed">
                        {children}
                    </div>
                    <div className="border-t border-neutral-200 p-5 sm:p-6 bg-neutral-50 flex justify-end sticky bottom-0 z-10 shadow-inner">
                        <button onClick={() => setOpenModal(null)} className="px-6 py-2 bg-neutral-900 text-white rounded-lg font-medium hover:bg-black transition-colors text-sm shadow-sm">
                            닫기
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-neutral-50 py-8 px-4 sm:px-6 lg:px-8 font-sans whitespace-pre-wrap break-keep">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header Section */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-neutral-200 text-center">
                    <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 flex justify-center items-center">
                        <Info className="w-6 h-6 mr-2 text-indigo-600 flex-shrink-0" />
                        프로그램 안내 및 유의사항
                    </h1>
                </div>

                {/* Section 1: 공통 주의사항 및 지원금 성격 */}
                <div className="bg-white border text-sm sm:text-base border-neutral-200 rounded-xl p-6 sm:p-8 shadow-sm text-neutral-800 leading-relaxed">
                    <h2 className="text-xl font-bold text-neutral-900 mb-6 pb-2 border-b border-neutral-100 flex items-center">
                        <CheckCircle2 className="w-5 h-5 mr-2 text-indigo-600" /> 공통 안내사항
                    </h2>

                    <div className="mb-6">
                        <SectionBadge title="개요" color="indigo" />
                        <div className="font-medium text-neutral-800 p-2 bg-indigo-50/30 rounded-lg">여러분이 받게 되는 ‘성장 지원금’은 단순한 장학금이나 지원금이 아니라 정부(중기부) 예산으로 집행되는 ‘사업비’입니다. 따라서 모든 지출(비용)은 사업계획서에 명시된 창업아이템의 개발·사업화 목적에 직접 연관 되어야 하며, ‘사업단이 대신 결제(구매대행)’하는 방식으로만 집행됩니다. 양산 목적의 물품·용역 구매는 불가, 시제품 제작 및 시장조사 관련 사항만 집행 가능.</div>
                    </div>

                    <div className="mb-6">
                        <SectionBadge title="지원금 사용" color="indigo" />
                        <div className="font-medium text-neutral-800 p-2 bg-indigo-50/30 rounded-lg">현금을 참가자에게 지급하는 것이 아닌 참가자의 요청을 받고 사업단에서 대리 결제하는 방식. 즉, 참가자가 ‘필요한 품목’을 제안하면, 사업단이 승인 후 직접 결제하는 구조 (외상 거래 기본, 선결제 불가)</div>
                    </div>

                    <div className="mb-6 p-5 bg-neutral-50 border border-neutral-200 rounded-xl shadow-sm">
                        <div className="flex items-center mb-3">
                            <SectionBadge title="기본 진행 절차" color="indigo" />
                        </div>

                        <strong className="block text-indigo-700 text-sm mb-1">[지원금 사용 (1~3주 소요)]</strong>
                        <ProcessFlow steps={['①사전 신청(월)', '②내부 검토', '③승인 후 진행', '④결제 및 지급']} />

                        <strong className="block text-indigo-700 text-sm mb-1 mt-4">[계획 변경 (1~2주 소요)]</strong>
                        <ProcessFlow steps={['①사전 신청(목)', '②내부 검토', '③승인 후 결재', '④완료 및 반영']} />
                    </div>

                    <NoticeCard color="red">
                        <strong className="block text-red-800 text-lg mb-1">유의사항</strong>
                        <ul className="list-disc pl-5 space-y-1.5 text-red-900 font-medium pb-1 mt-2">
                            <li>회차당 사업비 사용 금액 최대한 크게</li>
                            <li>파일명 규칙: 날짜_팀명_비목_금액</li>
                            <li>사업계획서 미기재 건 신청 불가</li>
                            <li>타 사업 중복지급 불가</li>
                            <li>원본서류 관리 철저</li>
                            <li>기자재(PC, 노트북 등 자산성 물품) 구매 불가</li>
                            <li>개인 명의 결제 불가</li>
                            <li>불명확한 지출은 추후 부적정 판정 가능.</li>
                        </ul>
                    </NoticeCard>
                </div>

                {/* Section 2: 비목별 큰 버튼 Grid (4 categories, 2x2 layout) */}
                <div>
                    <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center justify-center">
                        <FileText className="w-5 h-5 mr-2 text-indigo-600 flex-shrink-0" />
                        지원 비목별 상세 안내 (클릭 시 팝업)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        <button onClick={() => setOpenModal('여비')} className="group flex flex-col items-center justify-center p-6 bg-white border border-[#0288D1]/30 rounded-xl shadow-sm hover:shadow-md hover:border-[#0288D1] hover:bg-[#E1F5FE]/30 transition-all duration-200">
                            <Plane className="w-8 h-8 text-[#0288D1] mb-3 group-hover:scale-110 transition-transform flex-shrink-0" />
                            <span className="text-lg font-bold text-[#0277BD]">여비</span>
                        </button>

                        <button onClick={() => setOpenModal('재료비')} className="group flex flex-col items-center justify-center p-6 bg-white border border-[#2E7D32]/30 rounded-xl shadow-sm hover:shadow-md hover:border-[#2E7D32] hover:bg-[#E8F5E9]/30 transition-all duration-200">
                            <Box className="w-8 h-8 text-[#2E7D32] mb-3 group-hover:scale-110 transition-transform flex-shrink-0" />
                            <span className="text-lg font-bold text-[#1B5E20]">재료비</span>
                        </button>

                        <button onClick={() => setOpenModal('외주용역비')} className="group flex flex-col items-center justify-center p-6 bg-white border border-[#7B1FA2]/30 rounded-xl shadow-sm hover:shadow-md hover:border-[#7B1FA2] hover:bg-[#F3E5F5]/30 transition-all duration-200">
                            <Briefcase className="w-8 h-8 text-[#7B1FA2] mb-3 group-hover:scale-110 transition-transform flex-shrink-0" />
                            <span className="text-lg font-bold text-[#4A148C]">외주용역비</span>
                        </button>

                        <button onClick={() => setOpenModal('지급수수료')} className="group flex flex-col items-center justify-center p-6 bg-white border border-[#F57F17]/30 rounded-xl shadow-sm hover:shadow-md hover:border-[#F57F17] hover:bg-[#FFF8E1]/30 transition-all duration-200">
                            <UserCheck className="w-8 h-8 text-[#F57F17] mb-3 group-hover:scale-110 transition-transform flex-shrink-0" />
                            <span className="text-lg font-bold text-[#E65100]">지급수수료(멘토링)</span>
                        </button>

                    </div>
                </div>

                {/* Modals */}
                <Modal category="여비" title="여비" color="blue">
                    <div className="mb-6">
                        <SectionBadge title="정의" color="blue" />
                        <div className="font-medium text-blue-900 p-2 bg-blue-50/50 rounded-lg">소재지 외 출장 등의 사유로 집행하는 비용.</div>
                    </div>

                    <NoticeCard color="blue">
                        <strong className="block text-lg mb-1">유의사항</strong>
                        <ul className="list-disc pl-5 space-y-1.5 font-medium mt-1">
                            <li>교통영수증 신청일 = 탑승일 일치 필수 (승인 후 개인카드 결제).</li>
                            <li>대중교통 이용 (우등/일반실 이하 실비).</li>
                            <li>단순 미팅 목적의 출장은 여비 지급 불가.</li>
                        </ul>
                    </NoticeCard>

                    <h3 className="text-lg font-bold text-neutral-900 mb-2 mt-6">지출 필요 서류 목록</h3>
                    <DocumentTable color="blue" headers={["순번", "제출 서류"]} rows={[
                        ["1", "계획서 (출장 세부 계획서)"],
                        ["2", "보고서 (출장 보고서)"],
                        ["3", "영수증 및 통장/신분증 사본"]
                    ]} />
                </Modal>

                <Modal category="재료비" title="재료비" color="green">
                    <div className="mb-6">
                        <SectionBadge title="정의" color="green" />
                        <div className="font-medium text-green-900 p-2 bg-green-50/50 rounded-lg">시제품 제작에 소모되는 재료 구매 비용.</div>
                    </div>

                    <NoticeCard color="green">
                        <strong className="block text-lg mb-1">유의사항</strong>
                        <ul className="list-disc pl-5 space-y-1.5 font-medium mt-1">
                            <li>기계장치 등 자산성 물품 절대 구매 불가.</li>
                            <li>해외 직구 및 구독 서비스(어도비 등) 구매 불가.</li>
                            <li>매주 월요일 신청건에 한하여 화~수 구매 진행.</li>
                        </ul>
                    </NoticeCard>

                    <div className="mt-8 space-y-8">
                        <div>
                            <h3 className="text-lg font-bold text-green-800 mb-2 border-l-4 border-green-600 pl-3">[온라인 결제 시] 서류 목록</h3>
                            <DocumentTable color="green" headers={["구분", "제출 서류"]} rows={[
                                ["필수", "구매 신청 계획서 (사전 검토 필수)"],
                                ["필수", "물품 구입 요청서"],
                                ["필수", "물품 증빙사진"]
                            ]} />
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-green-800 mb-2 border-l-4 border-green-600 pl-3">[오프라인 결제 시] 서류 목록</h3>
                            <DocumentTable color="green" headers={["구분", "제출 서류"]} rows={[
                                ["입증", "구매 신청 계획서 (사전 검토 필수)"],
                                ["증빙", "거래명세서"],
                                ["확인", "물품 증빙사진"],
                                ["업체", "사업자등록증, 승낙사항, 청렴계약 이행서약서, 수의계약 체결 제한 여부 확인서, 통장사본"]
                            ]} />
                        </div>
                    </div>
                </Modal>

                <Modal category="외주용역비" title="외주용역비" color="purple">
                    <div className="mb-6">
                        <SectionBadge title="정의" color="purple" />
                        <div className="font-medium text-purple-900 p-2 bg-purple-50/50 rounded-lg">창업 고도화 목적으로 일부 공정을 외부 업체에 의뢰하여 제작하는 비용.</div>
                    </div>

                    <NoticeCard color="purple">
                        <strong className="block text-lg mb-1">유의사항</strong>
                        <ul className="list-disc pl-5 space-y-1.5 font-medium mt-1">
                            <li>외부 전문업체는 1년 이상의 해당 분야 종사 경력/유사아이템 제작 경험 보유 업체 요망.</li>
                            <li className="text-red-600 font-bold">프리랜서 중개 서비스(크몽, 위시켓 등)를 통한 지원금 집행 불가.</li>
                            <li>양산 목적의 금형제작 집행 불가(시금형제작 집행 가능).</li>
                            <li>용역 계약 처리 절차 소요시간(1~2주)을 감안하여 사전 신청 요망.</li>
                        </ul>
                    </NoticeCard>

                    <div className="mt-8 space-y-8">
                        <div>
                            <h3 className="text-lg font-bold text-purple-800 mb-2 border-l-4 border-purple-600 pl-3">[계약 시] 서류 목록</h3>
                            <DocumentTable color="purple" headers={["분류", "상세 제출 서류 목록"]} rows={[
                                ["기본", "표준계약서, 과업지시서"],
                                ["견적", "견적서, 비교견적서"],
                                ["서약", "계약보증금 면제각서, 수의계약 체결 제한 여부 확인서, 청렴계약 이행 서약서"],
                                ["업체", "사업자등록증, 통장사본, 인감증명서"],
                                ["납세", "납세증명서, 지방세 납세 증명서, 4대보험 완납 증명서"]
                            ]} />
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-purple-800 mb-2 border-l-4 border-purple-600 pl-3">[대금 지급 시] 서류 목록</h3>
                            <DocumentTable color="purple" headers={["요건", "상세 제출 서류 목록"]} rows={[
                                ["검수", "거래명세서, 착수계, 완료계, 용역 결과보고서"]
                            ]} />
                        </div>
                    </div>
                </Modal>

                <Modal category="지급수수료" title="지급수수료 (멘토링)" color="orange">
                    <div className="mb-6">
                        <SectionBadge title="정의" color="orange" />
                        <div className="font-medium text-orange-900 p-2 bg-orange-50/50 rounded-lg">비즈니스 모델 고도화, 제품 개선, 행정 자문 등의 목적으로 외부 전문가 멘토링 진행 후 지급하는 비용.</div>
                    </div>

                    <NoticeCard color="orange">
                        <strong className="block text-lg mb-2">유의사항 (멘토 자격 규정)</strong>
                        <p className="mb-2 font-medium">창업/법·행정 전문가 위촉 목적만 허용 (위 사항 미달 시 지급 불가).</p>
                        <ol className="list-decimal pl-5 space-y-1 font-bold bg-orange-50/50 p-3 rounded-lg border border-orange-100 mt-2 text-orange-900">
                            <li>박사학위 소지자</li>
                            <li>석사학위 + 5년 이상 경력</li>
                            <li>학사학위 + 7년 이상 경력</li>
                            <li>조교수 이상의 대학교수</li>
                            <li>5급 공무원 + 5년 경력</li>
                            <li>전문직 종사자(기술사, 변리사, 회계사, 세무사, 변호사 등)</li>
                        </ol>
                    </NoticeCard>

                    <h3 className="text-lg font-bold text-neutral-900 mb-2 mt-6">지출 필요 서류 목록</h3>
                    <DocumentTable color="orange" headers={["번호", "상세 서류"]} rows={[
                        ["1", "전문가 위촉동의서"],
                        ["2", "멘토링 보고서 (현장사진 필수)"],
                        ["3", "신분증 사본 및 통장사본"],
                        ["4", "멘토 이력서"]
                    ]} />
                </Modal>

            </div>
        </div>
    );
}
