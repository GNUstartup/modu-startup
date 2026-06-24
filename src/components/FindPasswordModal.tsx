import { X, Lock } from 'lucide-react';
import Modal from './common/Modal';

interface FindPasswordModalProps {
    onClose: () => void;
}

// 1차 버전: 비밀번호는 보안상 화면에 직접 보여주지 않습니다.
// 분실 시 관리자에게 문의하여 재설정하는 방식으로 안내합니다.
export default function FindPasswordModal({ onClose }: FindPasswordModalProps) {
    return (
        <Modal isOpen={true} onClose={onClose} className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
                    <h3 className="text-lg font-bold text-neutral-900 flex items-center">
                        <Lock className="w-5 h-5 mr-2 text-indigo-600" />
                        비밀번호 찾기
                    </h3>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="px-6 py-6 text-center">
                    <p className="text-sm text-neutral-600 leading-relaxed">
                        보안을 위해 비밀번호는 화면에 표시되지 않습니다.<br />
                        비밀번호를 잊으신 경우 <span className="font-semibold text-indigo-600">담당 관리자</span>에게
                        문의하여 재설정해 주세요.
                    </p>
                    <button
                        onClick={onClose}
                        className="mt-6 w-full py-2.5 px-4 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                    >
                        확인
                    </button>
                </div>
            </div>
        </Modal>
    );
}
