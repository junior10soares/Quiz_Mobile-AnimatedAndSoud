import { StatusBar } from 'react-native';
import { useFonts, Roboto_400Regular, Roboto_700Bold } from '@expo-google-fonts/roboto';
import 'react-native-gesture-handler';

import { Routes } from './src/routes';
import { Loading } from './src/components/Loading';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

//npx expo install react-native-svg
//npm i react-native-svg-transformer --save-dev

export default function App() {
  const [fontsLoaded] = useFonts({ Roboto_400Regular, Roboto_700Bold });

  if (!fontsLoaded) {
    return (
      <Loading />
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <Routes />
    </GestureHandlerRootView>//biblioteca de gestos
  );
}