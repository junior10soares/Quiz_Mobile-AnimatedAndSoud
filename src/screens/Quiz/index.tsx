import { useEffect, useState } from 'react';
import { Alert, BackHandler, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute } from '@react-navigation/native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  interpolate,
  Extrapolate,
  Easing,
  useAnimatedScrollHandler,
  runOnJS
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { Audio } from 'expo-av';

import { styles } from './styles';
import { THEME } from '../../styles/theme';

import { QUIZ } from '../../data/quiz';
import { historyAdd } from '../../storage/quizHistoryStorage';

import { Loading } from '../../components/Loading';
import { Question } from '../../components/Question';
import { QuizHeader } from '../../components/QuizHeader';
import { ConfirmButton } from '../../components/ConfirmButton';
import { OutlineButton } from '../../components/OutlineButton';
import { ProgressBar } from '../../components/ProgressBar';
import { OverlayFeedback } from '../../components/OverlayFeedback';

interface Params {
  id: string;
}

type QuizProps = typeof QUIZ[0];

const CARD_INCLINATION = 10
const CARD_SKIP_AREA = (-200)

export function Quiz() {
  const [points, setPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quiz, setQuiz] = useState<QuizProps>({} as QuizProps);
  const [alternativeSelected, setAlternativeSelected] = useState<null | number>(null);

  const [statusReply, setStatusReply] = useState(0);//fundo transp, reed ou green

  const shake = useSharedValue(0);
  const scrollY = useSharedValue(0);//controla eixo y e a barra de progreso
  const cardPosition = useSharedValue(0);

  const { navigate } = useNavigation();

  const route = useRoute();
  const { id } = route.params as Params;

  async function playSound(isCorrect: boolean) {
    const file = isCorrect ? require('../../assets/correct.mp3') : require('../../assets/wrong.mp3');

    const { sound } = await Audio.Sound.createAsync(file, { shouldPlay: true })

    await sound.setPositionAsync(0);//começar a tocar do 0s
    await sound.playAsync();//tocar
  }

  function handleSkipConfirm() {
    Alert.alert('Pular', 'Deseja realmente pular a questão?', [
      { text: 'Sim', onPress: () => handleNextQuestion() },
      { text: 'Não', onPress: () => { } }
    ]);
  }

  async function handleFinished() {
    await historyAdd({
      id: new Date().getTime().toString(),
      title: quiz.title,
      level: quiz.level,
      points,
      questions: quiz.questions.length
    });

    navigate('finish', {
      points: String(points),
      total: String(quiz.questions.length),
    });
  }

  function handleNextQuestion() {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prevState => prevState + 1)
    } else {
      handleFinished();
    }
  }

  async function handleConfirm() {
    if (alternativeSelected === null) {
      return handleSkipConfirm();
    }

    if (quiz.questions[currentQuestion].correct === alternativeSelected) {
      await playSound(true)
      setStatusReply(1);
      setPoints(prevState => prevState + 1);
      handleNextQuestion();
    } else {
      await playSound(false)
      setStatusReply(2);
      shakeAnimation();//se errar balança a perg
    }

    setAlternativeSelected(null);

  }

  function handleStop() {
    Alert.alert('Parar', 'Deseja parar agora?', [
      {
        text: 'Não',
        style: 'cancel',
      },
      {
        text: 'Sim',
        style: 'destructive',
        onPress: () => navigate('home')
      },
    ]);

    return true;
  }

  async function shakeAnimation() {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)//cel vibrar se errar

    shake.value = withSequence(
      withTiming(3, { duration: 400, easing: Easing.bounce }),
      withTiming(0, undefined, (finished => {//quando a animação acabar
        'worklet';
        if (finished) {// chama a função
          runOnJS(handleNextQuestion)()
        }
      }))
    )
  }

  const shakeStyleAnimated = useAnimatedStyle(() => {
    return {
      transform: [{
        translateX: interpolate(
          shake.value,
          [0, 0.5, 1, 1.5, 2, 2.5, 0],
          [0, -15, 0, 15, 0, -15, 0],
        )
      }]
    }
  })

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y // saber a posição da tela no eixo Y
    }
  })

  const fixedProgressBarStyles = useAnimatedStyle(() => { //barra que vem de cima
    return {
      position: 'absolute',
      paddingTop: 50,
      zIndex: 1, // para dar prioridade a frente dos itens
      backgroundColor: THEME.COLORS.GREY_500,
      width: '110%',//passar 1 pouco da tela direita
      left: '-5%',//passar 1 pouco da tela esquerda
      opacity: interpolate(scrollY.value, [50, 90], [0, 10], Extrapolate.CLAMP),//mudar a opacidade
      transform: [
        { translateY: interpolate(scrollY.value, [50, 100], [-40, 0], Extrapolate.CLAMP) }//mudar a opacidade
      ]
    }
  })

  const headerStyles = useAnimatedStyle(() => {//barra de progreso fixa do estilo inicial
    return {
      opacity: interpolate(scrollY.value, [60, 90], [1, 0], Extrapolate.CLAMP)
    }
  })

  const onPan = Gesture
    .Pan() // efeito de arrastar p lado esq
    .activateAfterLongPress(200)// só vai conseguir arrastar p lado se segurar, p usuario conseguir arrastar p cima tbm
    .onUpdate((event) => {
      const moveToLeft = event.translationX < 0;// mover só p esq dessa forma trava o lado dir

      if (moveToLeft) {// se mover p lado esq
        cardPosition.value = event.translationX // vc coloca o valor
      }
    })
    .onEnd((event) => {  // quando acabar de arrastar p lado esq
      if (event.translationX < CARD_SKIP_AREA) { // se o tam de x for < -200
        runOnJS(handleSkipConfirm)(); // vc executa a funcão de pular runOnJS p nao dar erro de trhead
      }

      cardPosition.value = withTiming(0)// voltar devagar eixo 0
    })

  const dragStyles = useAnimatedStyle(() => {
    const rotateZ = cardPosition.value / CARD_INCLINATION;
    return {
      transform: [
        { translateX: cardPosition.value }, // rodar
        { rotateZ: `${rotateZ}deg` } // rodar
      ]
    }
  })

  useEffect(() => {
    const quizSelected = QUIZ.filter(item => item.id === id)[0];
    setQuiz(quizSelected);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleStop) // se apartar no botao de voltar android chama a função perg se quer parar

    return () => backHandler.remove();
  }, [])

  if (isLoading) {
    return <Loading />
  }

  return (
    <View style={styles.container}>

      <OverlayFeedback status={statusReply} />

      <Animated.View
        style={fixedProgressBarStyles}
      >
        <Text style={styles.title}>{quiz.title}</Text>
        <ProgressBar total={quiz.questions.length} current={currentQuestion + 1} />
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.question}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <Animated.View style={[styles.header, headerStyles]}>
          <QuizHeader
            title={quiz.title}
            currentQuestion={currentQuestion + 1}
            totalOfQuestions={quiz.questions.length}
          />
        </Animated.View>

        <GestureDetector gesture={onPan}>
          <Animated.View style={[shakeStyleAnimated, dragStyles]}>
            <Question
              key={quiz.questions[currentQuestion].title}
              question={quiz.questions[currentQuestion]}
              alternativeSelected={alternativeSelected}
              setAlternativeSelected={setAlternativeSelected}
              onUnmount={() => setStatusReply(0)} // seta o valor p 0 para ficar transparent o fundo
            />
          </Animated.View>
        </GestureDetector>

        <View style={styles.footer}>
          <OutlineButton title="Parar" onPress={handleStop} />
          <ConfirmButton onPress={handleConfirm} />
        </View>
      </Animated.ScrollView>
    </View >
  );
}