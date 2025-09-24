// Login screen with email OTP authentication using Clerk and navigation to tabs on success
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import React, { useRef, useState } from "react";
import { useSignUp, useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import LinearGradient from "react-native-linear-gradient";
import { HelloWave } from "@/components/HelloWave";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, RouteProp } from "@react-navigation/native";
import { insertUser } from "@/Database/supabaseData";
import { useNavigation, NavigationProp, CommonActions } from "@react-navigation/native";

// Types for the OTP input component props
type OTPInputProps = {
  length?: number;
  onComplete: (code: string) => void;
  otpError: string;
};

// Route params type (expects optional questionnaire answers for new user sign-up)
type LoginRouteParams = {
  allAnswers: any;
};



// OTP input component that renders N single-character inputs and calls onComplete when filled
const OTP: React.FC<OTPInputProps> = ({ length = 6, onComplete, otpError }) => {


  // Holds the OTP digits as an array of characters
  const [code, setCode] = useState(new Array(length).fill(""));
  // Refs to each TextInput to manage focus programmatically
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Handle text change for a specific OTP box
  const handleChange = (text: string, index: number) => {
    const newOtp = [...code];
    newOtp[index] = text;
    setCode(newOtp);

    // Move focus to the next input when a digit is entered
    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const finalOtp = newOtp.join("");
    // When all digits are filled, notify parent to verify
    if (finalOtp.length === length) {
      onComplete(finalOtp); // Trigger verification when OTP is complete
    }
  };

  // Allow backspace to move focus back to the previous input
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 20 }}>
      {code.map((_, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            inputRefs.current[index] = ref;
          }}
          style={{
            width: 50,
            height: 70,
            borderBottomWidth: 1,
            borderColor: otpError === "2" ? "#D3412F" : otpError === "1" ? "#70B23C" : "#000",
            textAlign: "center",
            fontSize: 20,
            marginHorizontal: 5,
            borderRadius: 10,
            borderBottomColor: "#D4D4D4",
          }}
          keyboardType="number-pad"
          maxLength={1}
          value={code[index]}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
        />


      ))}
    </View>
  );
};

export default function Login() {
  // Clerk hooks for sign-up and sign-in flows
  const { isLoaded: isSignUpLoaded, signUp, setActive } = useSignUp();
  const { isLoaded: isSignInLoaded, signIn } = useSignIn();
  // Local UI state
  const [otpCode, setOtpCode] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [pending, setPending] = useState(false);
  const [isSignUpFlow, setIsSignUpFlow] = useState(false);
  const [otpError, setOtpError] = useState("");
  const navigation = useNavigation<NavigationProp<any>>();

  // Read any params passed to this screen (e.g., questionnaire data for new users)
  const route = useRoute<RouteProp<Record<string, LoginRouteParams>, string>>();
  const { allAnswers } = route.params || {};

  // Sends OTP to the provided email. If user doesn't exist, starts sign-up flow instead.
  const sendCode = async () => {
    if (!isSignUpLoaded || !isSignInLoaded || !signIn || !signUp) return;

    try {
      // Try sign-in first (existing user)
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
      });

      const emailFactor = signInAttempt.supportedFirstFactors?.find(
        (factor) => factor.strategy === "email_code"
      );

      if (!emailFactor || !("emailAddressId" in emailFactor)) {
        throw new Error("Email factor not found or emailAddressId missing");
      }

      await signInAttempt.prepareFirstFactor({
        strategy: "email_code",
        emailAddressId: emailFactor.emailAddressId,
      });

      console.log("OTP sent for existing user login.");
      setPending(true);
      setIsSignUpFlow(false);
      setOtpError("");
    } catch (error: any) {
      // If the user is not found, switch to sign-up flow (requires allAnswers)
      if (error.errors?.[0]?.code === "form_identifier_not_found") {
        console.log("User does not exist. Creating an account.")
        if (!allAnswers) {
          alert("User not found. Please sign up from new user.");
          return;
        } else {
          try {
            // Create Clerk user and send verification email OTP
            await signUp.create({
              emailAddress,
            });

            await signUp.prepareEmailAddressVerification({
              strategy: "email_code",
            });

            console.log("OTP sent for new user signup.");
            setPending(true);
            setIsSignUpFlow(true);
            setOtpError("");
          } catch (signUpError) {
            console.error("Error creating new user:", signUpError);
            alert("Error creating account. Please try again.");
          }
        }
      } else {
        console.error("Error sending code:", error);
        alert("Error sending verification code. Please try again.");
      }
    }
  };

  // Verifies the OTP. Handles both sign-up and sign-in flows.
  const onVerify = async (code: string) => {
    if (!isSignUpLoaded || !isSignInLoaded || !signUp || !signIn) return;

    setOtpCode(code);

    try {
      if (isSignUpFlow) {
        // Complete sign-up with the email verification code
        const signUpAttempt = await signUp.attemptEmailAddressVerification({
          code,
        });

        if (signUpAttempt.status === "complete" && signUpAttempt.createdSessionId) {
          await setActive({ session: signUpAttempt.createdSessionId });
          setOtpError("1");
          // Persist new user profile to Supabase
          const userData = {
            email: emailAddress,
            ...allAnswers,
          };
          const result = await insertUser(userData);
          console.log("Inserted user into Supabase:", result);
          console.log("Sign-up successful!");
          // Navigate to main tabs and reset history
          setTimeout(() => navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: '(tabs)' }],
            })

          )
            , 1000);
        } else {
          console.error("Sign-up verification incomplete:", signUpAttempt);
          setOtpError("2");
        }
      } else {
        // Complete sign-in with the email OTP
        const signInAttempt = await signIn.attemptFirstFactor({
          strategy: "email_code",
          code,
        });

        if (signInAttempt.status === "complete" && signInAttempt.createdSessionId) {
          await setActive({ session: signInAttempt.createdSessionId });
          setOtpError("1");
          console.log("Sign-in successful!");
          // Navigate to main tabs and reset history
          setTimeout(() => navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: '(tabs)' }],
            })

          )
            , 1000);
        } else {
          console.error("Sign-in verification incomplete:", signInAttempt);
          setOtpError("2");
        }
      }
    } catch (err) {
      console.error("Verification error:", err);
      setOtpError("2");
    }
  };

  // Clears state and re-sends a new OTP
  const resendCode = () => {
    setOtpCode("");
    setOtpError("");
    sendCode();
  };

  return (
    <SafeAreaView className="bg-white">
      {!pending ? (
        {/* Initial screen: collect email and send verification code */}
        <View className="h-full top-[18%] gap-14 p-12 ">
          <View className="items-center">
            <View className="flex flex-row items-center">
              <Text className="text-4xl font-bold">Hey,Hello</Text>
              <HelloWave />
            </View>
            <View>
              <Text className="p-4 text-center text-xl">
                Enter your credentials to access your account
              </Text>
            </View>
          </View>
          <View className="gap-12">
            <View className="gap-4">
              <Text className="text-lg">Email Address</Text>
              <TextInput
                value={emailAddress}
                onChangeText={setEmailAddress}
                style={{
                  borderColor: "#D4D4D4",
                  padding: 10,
                  backgroundColor: "white",
                  borderRadius: 10,
                  borderWidth: 1,
                }}
                keyboardType="email-address"
                placeholder="Email"
              />
            </View>
            <TouchableOpacity onPress={sendCode}>
              <LinearGradient
                style={{
                  alignContent: "center",
                  borderRadius: 10,
                  height: 50, 
                  justifyContent: "center",
                }}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                colors={["#0983C8", "#023E77"]}
              >
                <Text className="text-center text-white">Send Verification</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        {/* OTP verification screen */}
        <View className="h-full justify-between p-4">
          <TouchableOpacity onPress={() => setPending(false)}>
            <Ionicons
             style={{
              backgroundColor: "#304FFE",
              height: 40,
              width: 40,
              textAlign: "center",
              textAlignVertical: "center",
              borderRadius: 10,
              alignContent:'center',
              justifyContent:'center'
            }}
              name="chevron-back"
              size={40}
              color={"white"}
            />
          </TouchableOpacity>
          <View>
            <Text className="text-center text-2xl font-bold">OTP Verification</Text>
            <Text className="text-center">
              Please enter the 6-digit verification code sent to your email
            </Text>
          </View>
          <View style={{ height: "60%", justifyContent: "space-between" }}>
            <View>
              {/* The 6-digit OTP input */}
              <OTP length={6} onComplete={onVerify} otpError={otpError} />
              {otpError && (
                <Text
                  style={{
                    color: otpError === "2" ? "#D3412F" : "#70B23C",
                    textAlign: "center",
                    marginTop: 20,
                  }}
                >
                  {otpError === "2"
                    ? "The OTP you entered is incorrect, please check again or resend it now"
                    : "The OTP you entered is correct, please proceed to  your account"}
                </Text>
              )}
              <TouchableOpacity onPress={resendCode}>
                <Text
                  style={{
                    color: "#0983C8",
                    textAlign: "center",
                    marginTop: 50,
                    textDecorationLine: "underline",
                  }}
                >
                  Didn’t receive code? Resend Now
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity className="mb-10" onPress={() => onVerify(otpCode)}>
              <LinearGradient
                style={{
                  alignContent: "center",
                  borderRadius: 10,
                  height: 50, 
                  justifyContent: "center",
                }}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                colors={["#0983C8", "#023E77"]}
              >
                <Text className="text-center text-white">Proceed</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}