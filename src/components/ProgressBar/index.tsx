import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { styles } from './styles';

interface Props {
  total: number;
  current: number;
}

export function ProgressBar({ total, current }: Props) {

  const percentage = Math.round((current / total) * 100)//barra porcentagem

  const sharedProgress = useSharedValue(percentage);

  const styledAnimated = useAnimatedStyle(() => {
    return {
      width: `${sharedProgress.value}%`
    }
  })

  useEffect(() => {
    sharedProgress.value = withTiming(percentage);
  }, [current])

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.progress, styledAnimated]} />
    </View>
  );
}