import styles from './RoomActions.module.css';
import SelectIcon from '@/public/select.svg';
import ShareIcon from '@/public/share.svg';
import { useState } from 'react';
import { RoomMember } from '@/types';
import RulerSelector from '../RulerSelector/RulerSelector';
interface IProps {
  currentRound: number;
  roomName: string;
  roomCode: string;
  roomMembers: RoomMember[];
}


const RoomActions = (props: IProps) => {
  const roomUrl = `${window.location.origin}/rooms/${props.roomCode.toLocaleLowerCase()}`;
  const [showRoundRulerSelector, setShowRoundRulerSelector] = useState(false);
  const shareRoom = async () => {
    const shareData = {
      title: `🎮 اعرفني | ${props.roomName}`,
      text: `🎮 اعرفني

أنت مدعو للانضمام إلى غرفة "${props.roomName}" على منصة اعرفني!

🔥 ادخل الآن وابدأ اللعب`,
      url: roomUrl,
    };

    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(roomUrl);
    }
  };

  return (
    <div className={styles['room-actions-container']}>
      <h3>إجراءات الغرفة</h3>
      <div className={styles['room-actions']}>
        <button className='btn btn-primary' onClick={() => setShowRoundRulerSelector(true)}>
          <SelectIcon className='icon' />
          إختيار حكم الجولة التالية
        </button>
        <button className='btn btn-unselected' onClick={shareRoom}>
          <ShareIcon className='icon' />
          مشاركة رابط الغرفة
        </button>
      </div>

      {
        showRoundRulerSelector && <RulerSelector currentRound={props.currentRound} roomCode={props.roomCode} roomMembers={props.roomMembers} onClose={() => setShowRoundRulerSelector(false)} />
      }
    </div>
  )
}

export default RoomActions