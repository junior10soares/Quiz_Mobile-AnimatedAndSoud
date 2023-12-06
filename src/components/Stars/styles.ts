import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        justifyContent: 'flex-end',//testar
        alignItems: 'center'
    },
    canvas: {
        width: 257,
        height: 249,
        position: 'absolute',
        zIndex: 1 //toma a frente
    }
})