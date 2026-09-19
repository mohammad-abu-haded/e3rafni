import { useState } from 'react';
import styles from './RoundSettingsModal.module.css';
import { RoomMember } from '@/types';
import { toast } from 'react-toastify';
import ActionButton from '../ActionButton/ActionButton';
import StartIcon from '@/public/start.svg';

interface IProps {
    currentRound: number;
    roomCode: string;
    roomMembers: RoomMember[];
    onClose: () => void;
}

const RoundSettingsModal = ({ currentRound, onClose, roomCode }: IProps) => {

    const handleSubmit = async () => {
    }

    return (
        <div>
            <form action={handleSubmit}>

                <ActionButton title='تأكيد الحكم' className='btn btn-primary' Icon={StartIcon} />
                <button onClick={() => onClose()}>
                    اغلاق
                </button>
            </form>
        </div>
    )
}

export default RoundSettingsModal;
/*
 const [roundDuration, setRoundDuration] = useState<number | string>('');
    const [roundMode, setRoundMode] = useState<RoundMode>(RoundMode.SINGLE_QUESTION);
    const [ruler, setRuler] = useState<number>();
    const [player1, setPlayer1] = useState<number>();
    const [player2, setPlayer2] = useState<number>();
    const [viewers, setViewers] = useState<number[]>();
    const [player1Word, setPlayer1Word] = useState();
    const [player2Word, setPlayer2Word] = useState();

    const handleSubmit = async () => {

        if (!Number.isInteger(roundDuration)) {
            toast.error("مدة الجولة غير صالحة او لم تحددها");
            return;
        }

        if (!ruler) {
            toast.error("يرجى إختيار الحكم");
            return;
        }

        if (!player1) {
            toast.error("يرجى إختيار اللاعب الأول");
            return;
        }

        if (!player2) {
            toast.error("يرجى إختيار اللاعب الثاني");
            return;
        }

        if (!player1Word) {
            toast.error("يرجى تحديد  كلمة اللاعب الأول");
            return;
        }

        if (!player2Word) {
            toast.error("يرجى تحديد  كلمة اللاعب الثاني");
            return;
        }
    }

    */