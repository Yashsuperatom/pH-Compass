import React , {useState} from "react";
import { Modal,Text,SafeAreaView,View,TouchableOpacity} from "react-native";

interface CustomModalProps {
    isVisible : boolean;
    content: React.ReactNode;
    onClose : () => void;
}

export default function CustomModal({isVisible,content,onClose}:CustomModalProps){
    return(
         <Modal transparent visible={isVisible} animationType='slide'>
      <View style={{backgroundColor:"#EBEBEB",flex:1,borderRadius:20,top:20}}>
        <View >
          {content}
        </View>
        
      </View>
    </Modal>
        
    )
};