import { useState } from 'react';
import { Info, FileText, Plane, Box, Briefcase, UserCheck } from 'lucide-react';

export default function ProgramGuide() {
    const [openModal, setOpenModal] = useState<string | null>(null);

    const Modal = ({ category, title, children }: { category: string, title: string, children: React.ReactNode }) => {
        if (openModal !== category) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setOpenModal(null)}>
                <div className="bg-white rounded-2xl shadow-xl w-[90vw] md:w-[80vw] max-w-none max-h-[90vh] overflow-y-auto transform transition-all animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                    <div className="sticky top-0 bg-white border-b border-neutral-200 p-5 sm:p-6 flex justify-between items-start sm:items-center z-10 shadow-sm">
                        <div className="flex flex-col gap-1.5">
                            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 break-keep whitespace-pre-wrap">{title}</h2>
                        </div>
                        <button onClick={() => setOpenModal(null)} className="text-neutral-400 hover:text-neutral-900 font-bold p-1 text-2xl leading-none">&times;</button>
                    </div>
                    <div className="p-5 sm:p-8 text-neutral-800 text-sm sm:text-base leading-relaxed break-keep whitespace-pre-wrap">
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
        <div className="min-h-screen bg-neutral-50 py-8 px-4 sm:px-6 lg:px-8 font-sans break-keep whitespace-pre-wrap">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header Section */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-neutral-200 text-center">
                    <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 flex justify-center items-center break-keep whitespace-pre-wrap">
                        <Info className="w-6 h-6 mr-2 text-indigo-600 flex-shrink-0" />
                        프로그램 안내 및 유의사항
                    </h1>
                </div>

                {/* Section 1: 공통 주의사항 및 지원금 성격 */}
                <div className="bg-white border text-sm sm:text-base border-neutral-200 rounded-xl p-6 sm:p-8 shadow-sm break-keep whitespace-pre-wrap text-neutral-800 leading-relaxed">
                    <h2 className="text-xl font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-100">[[공통]]</h2>
                    <div className="mb-6 font-bold text-indigo-900 bg-indigo-50 p-4 rounded-lg">
                        ((개요))여러분이 받게 되는 ‘성장 지원금’은 단순한 장학금이나 지원금이 아니라 정부(중기부) 예산으로 집행되는 ‘사업비’입니다. 따라서 모든 지출(비용)은 사업계획서에 명시된 창업아이템의 개발·사업화 목적에 직접 연관 되어야 하며, ‘사업단이 대신 결제(구매대행)’하는 방식으로만 집행됩니다.{"\n\n"}
                        양산 목적의 물품·용역 구매는 불가, 시제품 제작 및 시장조사 관련 사항만 집행 가능.{"\n\n"}
                        <span className="text-red-600">※ 모든 거래의 세금계산서와 영수증은 ‘경상국립대학교 산학협력단’ 명의로 발행되어야 합니다.{"\n"}
                            ※ 참가자가 개인카드로 결제하거나, 개인 계좌로 송금한 경우 사업비로 인정되지 않습니다.</span>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="font-bold text-neutral-900 text-lg mb-2">((지원금 사용))</h3>
                            - 현금을 참가자에게 지급하는 것이 아닌 참가자의 요청을 받고 사업단에서 대리 결제하는 방식{"\n"}
                            즉, 참가자가 ‘필요한 품목’을 제안하면, 사업단이 승인 후 직접 결제하는 구조{"\n"}
                            (외상 거래 기본, 선결제(선지급급) 불가)
                        </div>

                        <div>
                            <h3 className="font-bold text-neutral-900 text-lg mb-2">((기본 진행 절차))</h3>
                            <strong className="text-indigo-700 block mb-1">[지원금 사용 프로세스]</strong>
                            ① 사전 신청(매주 월) → ② 내부 검토 및 → ③ 승인 후 진행 → ④ 결제 및 지급{"\n"}
                            *실제 대금 지급까지 약 1~3주 소요 될 수 있음.{"\n"}
                            ① 사전 신청: 신청서와 견적서를 포함하여 담당자에게 제출{"\n\n"}

                            <strong className="text-indigo-700 block mb-1">[계획 변경 프로세스]</strong>
                            ① 사전 신청(매주 목) → ② 내부 검토 → ③ 승인 후 결재 진행 → ④ 결재 완료 및 반영{"\n"}
                            *실제 변경까지 약 1~2주 소요 될 수 있음.{"\n"}
                            **금액의 변경이 아닌 내용 변경의 경우, 큰 기조가 변경되지 않는 한 그대로 진행
                        </div>

                        <div>
                            <h3 className="font-bold text-red-700 text-lg mb-2">((유의사항))</h3>
                            <ul className="list-disc pl-5 space-y-1.5 marker:text-red-500">
                                <li>회차당 사업비 사용 금액 최대한 크게</li>
                                <li>모든 서류는 1:1 카카오톡 대화를 통해 접수</li>
                                <li>파일명 규칙: 날짜_팀명_비목_금액 예) 251103_홍길동_재료비_3,000,000원</li>
                                <li>사업계획서상, 자금 활용 계획서에 기재되지 않은 건은 사전 신청이 불가하며, 사전 신청 접수되지 않은 결제 건은 집행 불가</li>
                                <li>타 사업(패키지 등)과 중복지급 불가</li>
                                <li>원본서류 분실 시 지급이 되지 않거나 재작성되어야 하는 번거로움이 발생 될 수 있으므로 원본서류 관리 철저.</li>
                                <li>사업 종료 시점에 결과보고서와 사업자등록증 출원 모두 필수</li>
                                <li className="text-red-600 font-bold">기간 내 미제출 시, 지원금 전액 환수 가능</li>
                                <li className="text-red-600 font-bold">기자재 구매 불가(PC, 노트북, 테블릿 등 자산성 물품)</li>
                                <li>(최종)보고서에는 "어떤 비목으로 무엇을 제작·출원·인증했는지"를 구체적으로 기재해야 함</li>
                                <li>사업단은 증빙 누락 시 사업비 지급 또는 정산을 보류할 수 있음</li>
                                <li className="font-bold text-red-600">개인 명의 결제 불가, 모든 거래는 사업단을 통해 진행</li>
                                <li>지출 전 반드시 품목요청서 제출 → 승인 후 구매 절차 준수</li>
                                <li className="font-bold text-red-600">증빙서류(세금계산서, 계약서, 납품확인서 등)는 반드시 경상국립대 산학협력단 명의로 발행</li>
                                <li>불명확한 지출은 추후 환수 또는 부적정 판정</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Section 2: 비목별 큰 버튼 Grid (4 categories, 2x2 layout) */}
                <div>
                    <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center justify-center break-keep whitespace-pre-wrap">
                        <FileText className="w-5 h-5 mr-2 text-indigo-600 flex-shrink-0" />
                        지원 비목별 상세 안내 (클릭 시 팝업)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        <button onClick={() => setOpenModal('여비')} className="group flex flex-col items-center justify-center p-6 bg-white border border-[#0288D1]/30 rounded-xl shadow-sm hover:shadow-md hover:border-[#0288D1] hover:bg-[#E1F5FE]/30 transition-all duration-200">
                            <Plane className="w-8 h-8 text-[#0288D1] mb-3 group-hover:scale-110 transition-transform flex-shrink-0" />
                            <span className="text-lg font-bold text-[#0277BD] mb-1 break-keep">여비</span>
                        </button>

                        <button onClick={() => setOpenModal('재료비')} className="group flex flex-col items-center justify-center p-6 bg-white border border-[#2E7D32]/30 rounded-xl shadow-sm hover:shadow-md hover:border-[#2E7D32] hover:bg-[#E8F5E9]/30 transition-all duration-200">
                            <Box className="w-8 h-8 text-[#2E7D32] mb-3 group-hover:scale-110 transition-transform flex-shrink-0" />
                            <span className="text-lg font-bold text-[#1B5E20] mb-1 break-keep">재료비</span>
                        </button>

                        <button onClick={() => setOpenModal('외주용역비')} className="group flex flex-col items-center justify-center p-6 bg-white border border-[#7B1FA2]/30 rounded-xl shadow-sm hover:shadow-md hover:border-[#7B1FA2] hover:bg-[#F3E5F5]/30 transition-all duration-200">
                            <Briefcase className="w-8 h-8 text-[#7B1FA2] mb-3 group-hover:scale-110 transition-transform flex-shrink-0" />
                            <span className="text-lg font-bold text-[#4A148C] mb-1 break-keep">외주용역비</span>
                        </button>

                        <button onClick={() => setOpenModal('지급수수료')} className="group flex flex-col items-center justify-center p-6 bg-white border border-[#F57F17]/30 rounded-xl shadow-sm hover:shadow-md hover:border-[#F57F17] hover:bg-[#FFF8E1]/30 transition-all duration-200">
                            <UserCheck className="w-8 h-8 text-[#F57F17] mb-3 group-hover:scale-110 transition-transform flex-shrink-0" />
                            <span className="text-lg font-bold text-[#E65100] mb-1 break-keep">지급수수료(멘토링)</span>
                        </button>

                    </div>
                </div>

                {/* Modals */}
                <Modal
                    category="여비"
                    title="[[여비]]"
                >
                    <div className="space-y-5">
                        <div className="bg-indigo-50 p-4 rounded-lg font-medium text-indigo-900">
                            <strong>((정의))</strong>여비는 소재지를 벗어나 타 지역 출장 등의 사유로 집행하는 비용을 말한다.
                        </div>

                        <div>
                            <strong className="text-lg text-neutral-900 block mb-2">((유의사항))</strong>
                            교통영수증의 경우 사업단의 출장 승인 이후 팀 구성원별 개인카드로 결제하여야 한다.(출장신청일자와 탑승일자는 동일해야 한다.){"\n\n"}
                            여비는 출장 후, 팀 구성원별 각각 개인계좌로 실비 지급된다.{"\n\n"}
                            교통영수증은 진주-출장지/출장지-진주(각 1장 씩)가 표기된 실제 영수증을 제출하여야 한다. 단, 영수증 상 출장지, 출장일자, 금액이 반드시 포함되어있는 자료를 제출해야 한다. 출장지 이동을 위한 교통편은 반드시 대중교통을 이용해야 한다.{"\n\n"}
                            <strong className="block mb-1">참고 사항</strong>
                            버스운임은 우등요금 이하의 실비로 지급되며, 프리미엄 버스나 심야 버스를 이용하더라도 우등요금으로 지급된다. (일반버스 탑승 경우 해당금액으로 지급됨){"\n"}
                            철도운임은 KTX 일반실 이하 이용 가능(KTX 특실은 불가, SRT 및 새마을호 등은 가능)하며, 실비를 지급한다.{"\n\n"}
                            출장 증빙사진은 출장지에서 활동하는 사진을 촬영하여 증빙서식에 맞게 작성하여 제출해야 한다.{"\n\n"}
                            <span className="text-red-600 font-bold">단순 미팅을 위한 여행의 여비는 지급 불가.</span>
                        </div>

                        <div className="bg-neutral-100 p-5 rounded-lg border border-neutral-200">
                            <strong className="text-lg text-neutral-900 block mb-3">((지출 필요 서류 목록))</strong>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>출장 세부 계획서(사전 제출 및 승인 필요)</li>
                                <li>출장 보고서(사후 제출)</li>
                                <li>영수증 및 통장/신분증 사본</li>
                            </ul>
                        </div>
                    </div>
                </Modal>

                <Modal
                    category="재료비"
                    title="[[재료비]]"
                >
                    <div className="space-y-5">
                        <div className="bg-green-50 p-4 rounded-lg font-medium text-green-900 border border-green-100">
                            <strong>((정의))</strong>재료비는 사업계획서 상의 사업화를 위해 소모되는 재료 또는 원료 등을 구매하는 비용을 말한다.
                        </div>

                        <div>
                            <strong className="text-lg text-neutral-900 block mb-2">((유의사항))</strong>
                            <span className="text-red-600 font-bold">취득성 재화(기계·장치) 및 MVP를 제작함에 소모되지 않는 품목은 구매 불가.{"\n"}
                                해외 직구 상품 및 구독 서비스(어도비 등) 구매 불가</span>{"\n\n"}
                            재료비는 사업단에서 매주 월요일 일괄 신청 접수 후 화 ~ 수 일괄 구매 한다.{"\n"}
                            신청 가능 기간은 매주 월요일까지로, 사업단에 구매신청 계획서, 물품 구입 요청서, 견적서를 제출해야 한다.{"\n"}
                            구매신청 계획서 및 물품 구입 요청서와 견적서의 내용이 일치해야 한다.{"\n"}
                            재료를 수령하고 물품별 검수 사진을 촬영 후, 관련 증빙 서식에 맞추어 제출한다.{"\n\n"}
                            구매 품목은 구매 수량이 분명하게 드러나게 검수 촬영하여야 한다.
                        </div>

                        <div className="bg-neutral-100 p-5 rounded-lg border border-neutral-200">
                            <strong className="text-lg text-neutral-900 block mb-4">((지출 필요 서류 목록 - 온라인과 오프라인 구분하여 구현))</strong>

                            <strong className="block text-indigo-700 mb-2">[온라인 결제 시]</strong>
                            1. 구매 신청 계획서(사전 검토 필수), 2. 물품 구입 요청서(온라인 결제 시 해당), 4. 물품 증빙사진.{"\n\n"}

                            <strong className="block text-indigo-700 mb-2">[오프라인 결제 시]</strong>
                            1. 구매 신청 계획서(사전 검토 필수), 3. 거래명세서(오프라인 결제 시 해당), 4. 물품 증빙사진, 5. 사업자등록증(오프라인 결제 시 해당), 6. 승낙사항(오프라인 결제 시 해당), 7. 청렴계약 이행서약서(오프라인 결제 시 해당), 8. 수의계약 체결 제한 여부 확인서(오프라인 결제 시 해당), 9. 통장사본(오프라인 결제 시 해당).
                        </div>
                    </div>
                </Modal>

                <Modal
                    category="외주용역비"
                    title="[[외주용역비]]"
                >
                    <div className="space-y-5">
                        <div className="bg-purple-50 p-4 rounded-lg font-medium text-purple-900 border border-purple-100">
                            <strong>((정의))</strong>외주용역비는 사업계획서 상의 창업아이템을 고도화하거나 사업계획을 수행하기 위한 목적으로 일부 공정을 외부 업체에 의뢰하여 제작하고, 이에 대한 대가를 지급하는 비용을 말한다.
                        </div>

                        <div>
                            <strong className="text-lg text-neutral-900 block mb-2">((유의사항))</strong>
                            외부 전문업체는 1년 이상의 해당 분야 종사경력 및 외주용역대상 창업아이템과 유사한 아이템의 제작 경험 보유 필요{"\n\n"}
                            외주업체의 사업자등록증 상 적정 업종(업태·종목) 여부를 필히 확인{"\n\n"}
                            <span className="text-red-600 font-bold">프리랜서 중개 서비스(크몽, 위시켓 등)를 통한 지원금 집행 불가</span>{"\n\n"}
                            양산목적의 금형제작비는 집행 불가 (시금형제작 집행 가능){"\n\n"}
                            용역 계약 처리 절차에 소요되는 시간(1~2주)을 감안하여 계획보다 일찍 사전 신청 필요
                        </div>

                        <div className="bg-neutral-100 p-5 rounded-lg border border-neutral-200">
                            <strong className="text-lg text-neutral-900 block mb-4">((지출 필요 서류 목록 - 계약 시와 대금 지급 시를 시각적으로 구분하여 구현))</strong>

                            <strong className="block text-purple-700 mb-2">(계약 시)</strong>
                            1. 표준 계약서, 2. 과업지시서, 3. 견적서, 4. 비교견적서, 5. 계약보증금 면제각서, 6. 수의계약 체결 제한 여부 확인서, 7. 청렴계약 이행 서약서, 8. 사업자등록증, 9. 통장사본, 10. 인감증명서, 11. 납세증명서, 12. 지방세 납세 증명서, 13. 4대보험 완납 증명서.{"\n\n"}

                            <strong className="block text-purple-700 mb-2">(대금 지급 시)</strong>
                            1. 거래명세서, 2. 착수계, 3. 완료계, 4. 용역 결과보고서.
                        </div>
                    </div>
                </Modal>

                <Modal
                    category="지급수수료"
                    title="[[지급수수료(멘토링)]]"
                >
                    <div className="space-y-5">
                        <div className="bg-orange-50 p-4 rounded-lg font-medium text-orange-900 border border-orange-100">
                            <strong>((정의))</strong>전문가활용비(멘토링)는 사업모델 개발, 제품 개선 등을 위한 멘토링 진행 후 지급하는 비용을 말한다.
                        </div>

                        <div>
                            <strong className="text-lg text-neutral-900 block mb-2">((유의사항))</strong>
                            - 사업아이템 고도화를 위한 창업 전문가 또는, 사업자등록증 출원 등 법·행정 전문가를 위촉할 때 소요되는 비용이어야 함.{"\n\n"}
                            <strong className="block text-orange-700 mb-1">멘토 자격: </strong>
                            1. 박사학위 소지자, 2. 석사학위 소지자 중 해당 분야 5년 이상 경력자, 3. 학사학위 소지자 중 해당 분야 7년 이상 경력자, 4. 조교수 이상의 대학교수, 5. 5급 또는 이에 상당하는 공무원으로 해당분야 5년 이상 경력자, 6. 기술사, 변리사, 기술지도사, 경영지도사, 공인회계사, 세무사, 변호사, 공인노무사 등 전문직 종사자. ※ 위 사항에 적합하지 않은 자에게는 멘토링비 지급 불가.
                        </div>

                        <div className="bg-neutral-100 p-5 rounded-lg border border-neutral-200">
                            <strong className="text-lg text-neutral-900 block mb-3">((지출 필요 서류 목록))</strong>
                            1. 전문가 위촉동의서(6장), 2. 멘토링 보고서(현장사진 필수, 온라인의 경우 멘토링 시작시간과 끝시간이 나오도록), 3. 멘토 신분증, 통장사본, 4. 이력서.
                        </div>
                    </div>
                </Modal>

            </div>
        </div>
    );
}
