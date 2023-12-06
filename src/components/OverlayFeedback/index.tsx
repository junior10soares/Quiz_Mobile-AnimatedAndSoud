import { useWindowDimensions } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { Canvas, Rect, BlurMask } from '@shopify/react-native-skia';
import { THEME } from '../../styles/theme';
import { useEffect } from 'react';

const STATUS = ['transparent', THEME.COLORS.BRAND_LIGHT, THEME.COLORS.DANGER_LIGHT]

type Props = {
    status: number;
}

export function OverlayFeedback({ status }: Props) {

    const opactity = useSharedValue(0);

    const { height, width } = useWindowDimensions();

    const styleAnimated = useAnimatedStyle(() => {
        return {
            opacity: opactity.value
        }
    })

    const color = STATUS[status]

    useEffect(() => {
        opactity.value = withSequence(
            withTiming(1, { duration: 400, easing: Easing.bounce }),//opacidade em 1 com tempo
            withTiming(0) // opacidade em 0 n faz nada só tira o efeito
        )
    }, [status])

    return (
        <Animated.View style={[{ width, height, position: 'absolute' }, styleAnimated]}>
            <Canvas style={{ flex: 1 }}>
                <Rect
                    x={0}//posição do quadrado no 0 inicia lá em cima eixo
                    y={0}//posição do quadrado no 0 inicia lá em cima eixo
                    width={width}
                    height={height}
                    color={color}
                >
                    <BlurMask blur={50} style="inner" />
                </Rect>
            </Canvas>
        </Animated.View>
    )
}