import { useSelector } from 'react-redux';

export default function useDecimalValue() {
  const { controlRoomSettings } = useSelector((state: any) => state.global);

  const roundToDecimalPlaces = (value: number): number => {
    const factor = Math.pow(10, (controlRoomSettings?.decimalValueCount, 2));
    return Math.round(value * factor) / factor;
  };

  return { roundToDecimalPlaces };
}
