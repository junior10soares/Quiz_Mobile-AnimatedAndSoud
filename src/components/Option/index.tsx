import { Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import {
  BlurMask,
  Canvas,
  Circle,
  Easing,
  Path,
  Skia,
  runTiming,
  useValue
} from '@shopify/react-native-skia';

import { styles } from './styles';
import { THEME } from '../../styles/theme';
import { useEffect } from 'react';

type Props = TouchableOpacityProps & {
  checked: boolean;
  title: string;
}

const CHECK_SIZE = 28;
const CHECK_STROKE = 2;

export function Option({ checked, title, ...rest }: Props) {

  const percentage = useValue(0) // no skia se usa useValue
  const circle = useValue(0);

  const RADIUS = (CHECK_SIZE - CHECK_STROKE) / 2;
  const CENTER_CIRCLE = RADIUS / 2;

  const path = Skia.Path.Make();
  path.addCircle(CHECK_SIZE, CHECK_SIZE, RADIUS)//tam do checkbox

  useEffect(() => {
    if (checked) {
      runTiming(percentage, 1, { duration: 700 }) // no skia se usa runTiming msm coisa que withTiming
      runTiming(circle, CENTER_CIRCLE, { easing: Easing.bounce }) // efeito interno do checkbox ele da um salto
    } else {
      runTiming(percentage, 0, { duration: 700 })// no skia se usa runTiming msm coisa que withTiming
      runTiming(circle, 0, { duration: 300 }) // tira o efeito interno do checkbox
    }
  }, [checked])

  return (
    <TouchableOpacity
      style={
        [
          styles.container,
          checked && styles.checked
        ]
      }
      {...rest}
    >
      <Text style={styles.title}>
        {title}
      </Text>

      <Canvas style={{ height: CHECK_SIZE * 2, width: CHECK_SIZE * 2 }}>
        <Path //checkbox fixo cinza
          path={path}
          color={THEME.COLORS.GREY_500}
          style="stroke"
          strokeWidth={CHECK_STROKE}
        />

        <Path //checkbox green que completa o de cima 
          path={path}
          color={THEME.COLORS.BRAND_LIGHT}
          style="stroke" // tipo do fundo
          strokeWidth={CHECK_STROKE} // larg
          start={0} // começa com 0
          end={percentage} // e vai enxendo o verde
        >
          <BlurMask blur={1} style="solid" />
        </Path >

        <Circle //checkbox interno
          cx={CHECK_SIZE}
          cy={CHECK_SIZE}
          r={circle}
          color={THEME.COLORS.BRAND_LIGHT}
        >
          <BlurMask blur={4} style="solid" />
        </Circle>
      </Canvas>
    </TouchableOpacity>
  );
}