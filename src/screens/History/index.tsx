import { useEffect, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, ScrollView, TouchableOpacity, Alert, Pressable } from 'react-native';
import { HouseLine, Trash } from 'phosphor-react-native';
import Animated, { Layout, SlideInRight, SlideOutRight } from 'react-native-reanimated';

import { Header } from '../../components/Header';
import { HistoryCard, HistoryProps } from '../../components/HistoryCard';

import { styles } from './styles';
import { historyGetAll, historyRemove } from '../../storage/quizHistoryStorage';
import { Loading } from '../../components/Loading';
import { THEME } from '../../styles/theme';
import { Swipeable } from 'react-native-gesture-handler';

export function History() {

  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<HistoryProps[]>([])
  const swipeableRef = useRef<Swipeable[]>([])//fechar menu
  const { goBack } = useNavigation();

  async function fetchHistory() {
    const response = await historyGetAll();
    setHistory(response);
    setIsLoading(false);
  }

  async function remove(id: string) {
    await historyRemove(id);

    fetchHistory();
  }

  function handleRemove(id: string, index: number) {

    swipeableRef.current?.[index].close()//antes de aparecer a msg fechar o trash

    Alert.alert(
      'Remover',
      'Deseja remover esse registro?',
      [
        {
          text: 'Sim', onPress: () => remove(id)
        },
        { text: 'Não', style: 'cancel' }
      ]
    );

  }

  useEffect(() => {
    fetchHistory();
  }, []);

  if (isLoading) {
    return <Loading />
  }

  return (
    <View style={styles.container}>
      <Header
        title="Histórico"
        subtitle={`Seu histórico de estudos${'\n'}realizados`}
        icon={HouseLine}
        onPress={goBack}
      />

      <ScrollView
        contentContainerStyle={styles.history}
        showsVerticalScrollIndicator={false}
      >
        {
          history.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={SlideInRight}//entrada pela direita
              exiting={SlideOutRight}//saida pela direita
              layout={Layout.springify()}//efeito mola
            >
              <Swipeable // puxa a lixeira e fica do lado equerdo
                ref={(ref) => {
                  if (ref) {
                    swipeableRef.current.push(ref)//lixeira sumir antes da msg usa ref
                  }
                }}
                overshootLeft={false}
                containerStyle={styles.swipeableContainer}
                leftThreshold={10}//tam de abertura para excluir
                renderRightActions={() => null}//bloqueira ios ação do lado direito
                onSwipeableOpen={() => handleRemove(item.id, index)}
                renderLeftActions={() => (
                  <View style={styles.swipeableRemove}>
                    <Trash size={32} color={THEME.COLORS.GREY_100} />
                  </View>
                )}
              >
                <HistoryCard data={item} />
              </Swipeable>
            </Animated.View>

          ))
        }
      </ScrollView>
    </View>
  );
}