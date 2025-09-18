import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  TextInput,
  ScrollView,
} from "react-native";
import React, { useRef, useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { NavigationProp } from "@react-navigation/native";
import index from ".";
import DropDownPicker from "react-native-dropdown-picker";
import { Consent_modal } from "@/components/Modal/Consent_modal";

type OptionType = string | { type: "jsx"; value: JSX.Element };

export default function GetStarted() {
  const navigation = useNavigation<NavigationProp<any>>();

  // State to store all answers
  const [allAnswers, setAllAnswers] = useState<{
    [key: string]: any;
  }>({});
  const [selectedOptions, setSelectedOptions] = useState<{
    [key: string]: string | string[];
  }>({});
  const screenWidth = Dimensions.get("window").width;
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [data, setData] = useState(false);

  const [form, setForm] = useState({
    name: "",
    age: "",
    weight: "",
    water: "",
  });

  const [dropdown, setDropdown] = useState<DropDownState>({
    gender: {
      open: false,
      value: null,
      items: [
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
      ],
    },
    diet: {
      open: false,
      value: null,
      items: [
        { label: "NV", value: "NV" },
        { label: "Veg", value: "Veg" },
        { label: "Vegan", value: "Vegan" },
      ],
    },
    drinks: {
      open: false,
      value: null,
      items: [
        { label: "Yes", value: "Yes" },
        { label: "No", value: "No" },
      ],
    },
    smoker: {
      open: false,
      value: null,
      items: [
        { label: "Yes", value: "Yes" },
        { label: "No", value: "No" },
      ],
    },
    alcohol: {
      open: false,
      value: null,
      items: [
        { label: "Yes", value: "Yes" },
        { label: "No", value: "No" },
      ],
    },
  });

  const scrollToNext = () => {
    const currentBoard = onBoard[activeIndex];

    if (currentBoard) {
      const isSelectionRequired = currentBoard.Option && currentBoard.Option.length > 0;

      // Check if current question is answered
      const isAnswered = selectedOptions[currentBoard.key]
        || (currentBoard.Question === "Tell us about yourself"
          && form.name && form.age && form.weight && form.water && dropdown.gender.value && dropdown.diet.value
          && dropdown.drinks.value && dropdown.smoker.value && dropdown.alcohol.value);

      if (isSelectionRequired && !isAnswered) {
        alert("Please proceed with all data before continuing");
        return;
      }
    }

    if (activeIndex < onBoard.length - 1) {
      const nextIndex = activeIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex });
      setActiveIndex(nextIndex);
    } else {
      console.log("All Answers:", allAnswers);
      navigation.navigate("Login", { allAnswers });
    }
  };


  // Function to store answers
  const storeAnswer = (question: string, answer: any) => {
    setAllAnswers(prev => ({
      ...prev,
      [question]: answer
    }));
  };

  // Function to handle option selection
  const send = (key: string, option: string) => {
    setSelectedOptions((prev) => {
      let updatedValue;

      if (key === "health_conditions") {
        // Multi-select logic
        const currentSelections = Array.isArray(prev[key]) ? prev[key] : [];
        if (currentSelections.includes(option)) {
          updatedValue = currentSelections.filter((item) => item !== option);
        } else {
          updatedValue = [...currentSelections, option];
        }
      } else {
        updatedValue = option;
      }

      const newState = {
        ...prev,
        [key]: updatedValue,
      };

      storeAnswer(key, updatedValue);
      return newState;
    });

    setData(true);
  };

  type DropDownState = {
    [key: string]: {
      open: boolean;
      value: string | null;
      items: { label: string; value: string }[];
    };
  };




  const updateDropDown = (
    name: string,
    key: "open" | "value" | "items",
    value: any
  ) => {
    setDropdown((prevState) => ({
      ...prevState,
      [name]: {
        ...prevState[name],
        [key]: value,
      },
    }));

    // Store dropdown answers when value changes
    if (key === "value" && value !== null) {
      storeAnswer(name, value);
    }
  };

  // Watch for form changes and store them
  useEffect(() => {
    if (form.name || form.age || form.weight || form.water) {
      storeAnswer("name", form.name);
      storeAnswer("age", form.age);
      storeAnswer("weight", form.weight);
      storeAnswer("daily_water_intake", form.water);
    }
  }, [form]);


  //   // Watch for dropdown changes and store them
  //   useEffect(() => {
  //   Object.keys(dropdown).forEach(key => {
  //     if (dropdown[key].value !== null) {
  //       let dbKey = key;
  //       if (key === "drinks") dbKey = "sweet_drinks";
  //       if (key === "diet") dbKey = "diet_type";
  //       storeAnswer(dbKey, dropdown[key].value);
  //     }
  //   });
  // }, [dropdown]);


  const onBoard = [
    {
      key: "consent",
      Question:
        "Do you consent to provide your health details for customized reports?",
      Option: ["Yes, I Consent", "No, Skip Questionnaire"],
    },
    {
      key: "Personal_info",
      Question: "Tell us about yourself",
      Option: [
        {
          type: "jsx",
          value: (
            <SafeAreaView className=" h-full px-2  gap-4">
              <View className="gap-4">
                <Text>Full Name</Text>
                <TextInput
                  value={form.name}
                  onChangeText={(text) => {
                    setForm((prev) => ({ ...prev, name: text }));
                  }}
                  placeholder="Enter your full name"
                  placeholderTextColor={"gray"}
                  className="h-15 bg-[#D9D9D94D] border border-[#0000001A] rounded-lg p-2 text-black"
                />
              </View>

              <View className="flex-row justify-between gap-5">
                <View className="flex-1 gap-3">
                  <Text>Age</Text>
                  <TextInput
                    value={form.age}
                    onChangeText={(text) => {
                      setForm((prev) => ({ ...prev, age: text }));
                    }}
                    placeholder="Age"
                    placeholderTextColor={"gray"}
                    className="bg-[#D9D9D94D] border border-[#0000001A] rounded-lg p-3"
                    keyboardType="numeric"
                  />
                </View>
                <View
                  className="flex-1 gap-3"
                  style={{ zIndex: dropdown.gender.open ? 2000 : 100 }}
                >
                  <Text>Gender</Text>
                  <DropDownPicker
                    placeholderStyle={{ color: "gray" }}
                    style={{
                      borderColor: "#0000001A",
                      backgroundColor: "#D9D9D94D",
                      zIndex: 100
                    }}
                    open={dropdown.gender.open}
                    value={dropdown.gender.value}
                    items={dropdown.gender.items}
                    setOpen={(open) => updateDropDown("gender", "open", open)}
                    setValue={(callback) =>
                      updateDropDown(
                        "gender",
                        "value",
                        typeof callback === "function"
                          ? callback(dropdown.gender.value)
                          : callback
                      )
                    }
                    setItems={(items) =>
                      updateDropDown("gender", "items", items)
                    }
                    placeholder="Select Gender"
                  />
                </View>
              </View>

              <View className="flex-row gap-5">
                <View className="flex-1 gap-3">
                  <Text>Weight(kg)</Text>
                  <TextInput
                    value={form.weight}
                    onChangeText={(text) => {
                      setForm((prev) => ({ ...prev, weight: text }));
                    }}
                    placeholder="Enter your weight"
                    placeholderTextColor={"gray"}
                    className="bg-[#D9D9D94D] border border-[#0000001A] rounded-lg p-3"
                    keyboardType="numeric"
                  />
                </View>
                <View className="flex-1 gap-3">
                  <Text>Daily Water Intake</Text>
                  <TextInput
                    value={form.water}
                    onChangeText={(text) => {
                      setForm((prev) => ({ ...prev, water: text }));
                    }}
                    placeholder="In Liters"
                    placeholderTextColor={"gray"}
                    className="bg-[#D9D9D94D] text-black border border-[#0000001A] rounded-lg p-3"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View className="flex-row gap-5">
                <View
                  className="flex-1 gap-3"
                  style={{ zIndex: dropdown.diet.open ? 2000 : 100 }}
                >
                  <Text>Diet Type</Text>
                  <DropDownPicker
                    placeholderStyle={{ color: "gray" }}
                    style={{
                      borderColor: "#0000001A",
                      backgroundColor: "#D9D9D94D",

                    }}
                    open={dropdown.diet.open}
                    value={dropdown.diet.value}
                    items={dropdown.diet.items}
                    setOpen={(open) => updateDropDown("diet", "open", open)}
                    setValue={(callback) =>
                      updateDropDown(
                        "diet",
                        "value",
                        typeof callback === "function"
                          ? callback(dropdown.diet.value)
                          : callback
                      )
                    }
                    setItems={(items) => updateDropDown("diet", "items", items)}
                  />
                </View>
                <View
                  className="flex-1 gap-3"
                  style={{ zIndex: dropdown.drinks.open ? 2000 : 100 }}
                >
                  <Text>Sweet Drinks</Text>
                  <DropDownPicker
                    style={{
                      borderColor: "#0000001A",
                      backgroundColor: "#D9D9D94D",
                    }}
                    placeholderStyle={{ color: "gray" }}
                    open={dropdown.drinks.open}
                    value={dropdown.drinks.value}
                    items={dropdown.drinks.items}
                    setOpen={(open) => updateDropDown("drinks", "open", open)}
                    setValue={(callback) =>
                      updateDropDown(
                        "drinks",
                        "value",
                        typeof callback === "function"
                          ? callback(dropdown.drinks.value)
                          : callback
                      )
                    }
                    setItems={(items) =>
                      updateDropDown("drinks", "items", items)
                    }
                  />
                </View>
              </View>

              <View className="flex-row gap-5">
                <View
                  className="flex-1 gap-3"
                  style={{ zIndex: dropdown.smoker.open ? 2000 : 100 }}
                >
                  <Text>Smoker</Text>
                  <DropDownPicker
                    placeholderStyle={{ color: "gray" }}
                    dropDownDirection="TOP"
                    style={{
                      borderColor: "#0000001A",
                      backgroundColor: "#D9D9D94D",
                    }}
                    open={dropdown.smoker.open}
                    value={dropdown.smoker.value}
                    items={dropdown.smoker.items}
                    setOpen={(open) => updateDropDown("smoker", "open", open)}
                    setValue={(callback) =>
                      updateDropDown(
                        "smoker",
                        "value",
                        typeof callback === "function"
                          ? callback(dropdown.smoker.value)
                          : callback
                      )
                    }
                    setItems={(items) =>
                      updateDropDown("smoker", "items", items)
                    }
                  />
                </View>
                <View
                  className="flex-1 gap-3"
                  style={{ zIndex: dropdown.alcohol.open ? 2000 : 100 }}
                >
                  <Text>Alcohol</Text>
                  <DropDownPicker
                    placeholderStyle={{ color: "gray" }}
                    dropDownDirection="TOP"
                    style={{
                      borderColor: "#0000001A",
                      backgroundColor: "#D9D9D94D",
                    }}
                    open={dropdown.alcohol.open}
                    value={dropdown.alcohol.value}
                    items={dropdown.alcohol.items}
                    setOpen={(open) => updateDropDown("alcohol", "open", open)}
                    setValue={(callback) =>
                      updateDropDown(
                        "alcohol",
                        "value",
                        typeof callback === "function"
                          ? callback(dropdown.alcohol.value)
                          : callback
                      )
                    }
                    setItems={(items) =>
                      updateDropDown("alcohol", "items", items)
                    }
                  />
                </View>
              </View>
            </SafeAreaView>
          ),
        },
      ],
    },
    {
      key: "health_conditions",
      Question: "Do you have any existing health conditions?",
      Option: ["Any Cancer Type", "Diabetes", "Gout", "Heart Problems", "Chronic Kidney Disease", "UTI", "Any Other"],
    },
    {
      key: "track_fitness",
      Question: "Do you want to track your general fitness after a change in lifestyle (e.g., food or exercise)?",
      Option: ["Yes", "No"],
    },
    {
      key: "receive_reports",
      Question: "Do you want to receive interpreted reports",
      Option: ["Yes", "No"],
    },
    {
      key: "device_usage",
      Question: "How often do you plan to use the device?",
      Option: ["Daily (Single)", "Daily (Multiple)", "Weekly", "Monthly"],
    },
    {
      key: "reminders",
      Question: "Would you like to receive reminders for pH checks?",
      Option: ["Yes", "No"],
    },
  ]


  useEffect(() => {
    if (Object.values(selectedOptions).includes("No, Skip Questionnaire")) {
      navigation.navigate("Login");
    }
  }, [selectedOptions]);

  return (
    <SafeAreaView style={{ backgroundColor: "#FFFFFF" }}>
      <Consent_modal />
      <View style={{ height: "100%", padding: 20, gap: 20 }}>
        <TouchableOpacity onPress={() => navigation.navigate("index")}>
          <Ionicons
            style={{
              backgroundColor: "#304FFE",
              height: 40,
              width: 40,
              textAlign: "center",
              textAlignVertical: "center",
              borderRadius: 10,
              alignContent: 'center',
              justifyContent: 'center'
            }}
            name={"chevron-back-outline"}
            size={40}
            color={"white"}
          />
        </TouchableOpacity>
        <View>
          <ScrollView showsVerticalScrollIndicator={false} style={{ height: "80%" }} >
            <FlatList
              ref={flatListRef}
              data={onBoard}
              horizontal
              pagingEnabled
              scrollEnabled={false}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.Question}
              renderItem={({ item }) => (
                <View
                  style={{
                    width: screenWidth - 50,
                    padding: 3,
                    marginHorizontal: 5,
                    justifyContent: "flex-start",
                    gap: 30,
                  }}
                >
                  <Text className="text-4xl text-center font-semibold">
                    {item.Question}
                  </Text>
                  {item.Option ? (
                    <FlatList
                      pagingEnabled
                      data={item.Option as OptionType[]}
                      keyExtractor={(option) =>
                        typeof option === "string" ? option : `custom-${index}`
                      }
                      renderItem={({ item: option }) =>
                        typeof option === "string" ? (
                          <TouchableOpacity
                            onPress={() => send(item.key, option)}
                            className="rounded-xl px-3 py-4 border"
                            style={{
                              borderColor: "#0000001A",
                              marginTop: "5%",
                              zIndex: 100,
                              backgroundColor: (item.key === "health_conditions"
                                ? selectedOptions[item.key]?.includes(option)
                                : selectedOptions[item.key] === option)
                                ? "#304FFE"
                                : "#D9D9D94D",

                            }}
                          >
                            <Text
                              className="text-center text-lg "
                              style={{
                                color:
                                  (item.key === "health_conditions"
                                    ? selectedOptions[item.key]?.includes(option)
                                    : selectedOptions[item.key] === option)
                                    ? "white"
                                    : "#8A8A8A",
                              }}
                            >
                              {option}
                            </Text>
                          </TouchableOpacity>
                        ) : (
                          option.value
                        )
                      }
                    />
                  ) : null}
                </View>
              )}
            />

          </ScrollView>
          <TouchableOpacity
            onPress={() => scrollToNext()}
            className="bg-[#304FFE] rounded-xl p-4 "
          >
            <Text className="text-center text-white text-2xl">Continue</Text>
          </TouchableOpacity>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 30,
            }}
          >
            {onBoard.map((_, index) => (
              <View
                key={index}
                style={{
                  width: activeIndex === index ? 15 : 30,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor:
                    activeIndex === index ? "#304FFE" : "#D3D3D3",
                  marginHorizontal: 5,
                }}
              />
            ))}
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
}