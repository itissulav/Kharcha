import { useState } from "react";
import { Keyboard, Platform, TouchableWithoutFeedback, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

type Props = {
  value: string | null;
  setValue: React.Dispatch<React.SetStateAction<string | null>>;
};

export default function GraphDropdown({ value, setValue }: Props) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: "Past Year", value: "year" },
    { label: "Past Month", value: "month" },
    { label: "Past Week", value: "week" },
  ]);

  const closeDropdownOnTapOutside = () => {
    Keyboard.dismiss();
    if (open) setOpen(false);
  };

  return (
    <TouchableWithoutFeedback onPress={closeDropdownOnTapOutside}>
      <View className="flex-1 justify-center items-center bg-primary px-4">
        <View
          style={{
            zIndex: 1000,
            position: "relative",
            width: "50%",
          }}
        >
          <DropDownPicker
            open={open}
            value={value}
            items={items}
            setOpen={setOpen}
            setValue={setValue}
            setItems={setItems}
            placeholder="Select Period"
            style={{
              backgroundColor: "#1E1E2E",
              borderColor: "#52525b",
            }}
            dropDownContainerStyle={{
              backgroundColor: "#1E1E2E",
              borderColor: "#52525b",
              zIndex: 1100,
              elevation: Platform.OS === "android" ? 12 : 0,
            }}
            textStyle={{ color: "#F1F5F9", fontSize: 16 }}
            listItemLabelStyle={{ color: "#F1F5F9" }}
            selectedItemLabelStyle={{ color: "#AB8BFF", fontWeight: "bold" }}
            placeholderStyle={{ color: "#94A3B8" }}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
