import { useAnimatedNumber } from "../hooks/useAnimatedNumber";

interface AnimatedNumberProps {
  value: number;
  formatter: (value: number) => string;
}

export const AnimatedNumber = ({ value, formatter }: AnimatedNumberProps) => {
  const animatedValue = useAnimatedNumber(value);

  return <>{formatter(animatedValue)}</>;
};
