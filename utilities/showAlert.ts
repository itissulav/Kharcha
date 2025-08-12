import { Alert } from "react-native";

type Props = {
  alertTitle: string;
  alertMsg: string;
  button1: string;
  button2: string;
  button3: string;
  onButton1: () => void;
  onButton2: () => void;
  onButton3: () => void;
};

export const createThreeButtonAlert = ({
  alertTitle,
  alertMsg,
  button1,
  button2,
  button3,
  onButton1,
  onButton2,
  onButton3,
}: Props) =>
  Alert.alert(alertTitle, alertMsg, [
    {
      text: button1,
      onPress: () => {
        onButton1();
      },
    },
    {
      text: button2,
      onPress: () => {
        onButton2();
      },
      style: "cancel",
    },
    {
      text: button3,
      onPress: () => {
        onButton2();
      },
    },
  ]);
