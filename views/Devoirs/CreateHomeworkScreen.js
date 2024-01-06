import React, { useEffect, useLayoutEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, Image, Alert, StatusBar, TextInput, Modal, ActivityIndicator, KeyboardAvoidingView } from 'react-native';

import { Text } from 'react-native-paper';
import GetUIColors from '../../utils/GetUIColors';
import PapillonInsetHeader from '../../components/PapillonInsetHeader';
import { SFSymbol } from 'react-native-sfsymbols';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { ContextMenuButton } from 'react-native-ios-context-menu';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';

import { getSavedCourseColor } from '../../utils/ColorCoursName';

import { useAppContext } from '../../utils/AppContext';
import PapillonLoading from '../../components/PapillonLoading';

import formatCoursName from '../../utils/FormatCoursName';

import AlertBottomSheet from '../../interface/AlertBottomSheet';
import { AlertTriangle } from 'lucide-react-native';

const CreateHomeworkScreen = ({ route, navigation }) => {
  const UIColors = GetUIColors();
  const { date } = route.params;
  const [loading, setLoading] = useState(false);

  const appctx = useAppContext();

  const [selectedSubject, setSelectedSubject] = useState(0);
  const [nativeSubjects, setNativeSubjects] = useState([]);

  const [titleMissingAlert, setTitleMissingAlert] = useState(false);

  const [homeworkTitle, setHomeworkTitle] = useState('');

  function addSubject() {
    Alert.prompt(
      "Ajouter une matière",
      "Veuillez entrer le nom de la matière que vous souhaitez ajouter.",
      [
        {
          text: "Annuler",
          onPress: () => {},
          style: "destructive"
        },
        {
          text: "Ajouter",
          onPress: (text) => {
            if (text.trim() == "") {
              Alert.alert("Erreur", "Veuillez entrer un nom de matière valide.");
              return;
            }

            AsyncStorage.getItem('savedColors').then((savedColors) => {
              let colors = {};
              if (savedColors) {
                colors = JSON.parse(savedColors);
              }

              let newColor = {
                systemCourseName: text.toLowerCase().replace(' ','').normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
                originalCourseName: text.toUpperCase(),
                color: UIColors.primary,
              }

              colors[newColor.systemCourseName] = newColor;

              AsyncStorage.setItem('savedColors', JSON.stringify(colors)).then(() => {
                // add before the last item
                setNativeSubjects ((prev) => [
                  ...prev.slice(0, prev.length - 1),
                  {
                    actionKey: newColor.systemCourseName,
                    actionTitle: formatCoursName(newColor.originalCourseName),
                    menuAttributes: ['default'],
                  },
                  {
                    actionKey: 'new',
                    actionTitle: 'Ajouter une matière',
                    menuAttributes: ['destructive'],
                    icon: {
                      iconType: 'SYSTEM',
                      iconValue: 'plus',
                    },
                  }
                ]);
              });
            });
          },
          style: "primary"
        }
      ],
      "plain-text",
      ""
    );
  }

  function addHomework() {
    if (homeworkTitle.trim() == "") {
      setTitleMissingAlert(true);
      return;
    }

    // add homework to the database
    AsyncStorage.getItem('customHomeworks').then((customHomeworks) => {
      let hw = [];
      if (customHomeworks) {
        hw = JSON.parse(customHomeworks);
      }

      console.log(hw);

      let newHw = {
        id: Math.random().toString(36).substring(7),
        local_id: Math.random().toString(36).substring(7),
        subject: {
            id: Math.random().toString(36).substring(7),
            name: nativeSubjects[selectedSubject]?.actionTitle,
            groups: false
        },
        description: homeworkTitle,
        background_color: getSavedCourseColor(nativeSubjects[selectedSubject]?.actionTitle, UIColors.primary),
        done: false,
        date: new Date(date).toISOString(),
        files: [],
        custom: true,
      }

      hw.push(newHw);

      AsyncStorage.setItem('customHomeworks', JSON.stringify(hw)).then(() => {
        navigation.goBack();
      });
    });
    
  }

  useEffect(() => {
    setLoading(true);
    AsyncStorage.getItem('savedColors').then((savedColors) => {
      if (savedColors) {
        savedColors = JSON.parse(JSON.parse(savedColors));
        let savedColorsKeys = Object.keys(savedColors);

        console.log(savedColors);

        for (let i = 0; i < savedColorsKeys.length; i++) {
          let item = savedColors[savedColorsKeys[i]];
          if(savedColorsKeys[i].trim() == "") continue;
          if(savedColorsKeys[i].trim() == "0") continue;
          if(savedColorsKeys[i].trim() == "ajouterunematiere") continue;

          setNativeSubjects ((prev) => [
            ...prev,
            {
              actionKey: item.systemCourseName,
              actionTitle: formatCoursName(item.originalCourseName),
              menuAttributes: ['default'],
            }
          ]);
        }

        setNativeSubjects ((prev) => [
          ...prev,
          {
            actionKey: 'new',
            actionTitle: 'Ajouter une matière',
            menuAttributes: ['destructive'],
            icon: {
              iconType: 'SYSTEM',
              iconValue: 'plus',
            },
          }
        ]);

        setTimeout(() => {
          setLoading(false);
        }, 200);
      }
    });
  }, []);

  // change the header title
  useEffect(() => {
    navigation.setOptions({
      headerTitle: Platform.OS === 'ios' ? () => (
        <PapillonInsetHeader
          icon={<SFSymbol name="plus" />}
          title="Nouveau devoir"
          color={UIColors.text}
        />
      ) : 'Nouveau devoir',
      headerStyle: {
        backgroundColor: UIColors.element,
      },
      headerShadowVisible: false,
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 5 }}
          onPress={() => {
            addHomework();
          }}
        >
          <Text style={{ color: UIColors.primary, fontSize: 17, fontWeight: '600', fontFamily: 'Papillon-Medium' }}>Ajouter</Text>
        </TouchableOpacity>
      ),
    });
  }, [UIColors]);

  return (
    <KeyboardAvoidingView style={{flex: 1}}>
    { loading && (
        <View style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: UIColors.element,
          gap: 10,
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
          paddingBottom: '10%',
        }}>
          <ActivityIndicator />
          <NativeText heading="p" style={{color: UIColors.text}}>
            Chargement des matières...
          </NativeText>
        </View>
    )}

    <View style={{ backgroundColor: UIColors.element, borderBottomColor: UIColors.border, borderBottomWidth: 0.5, gap: 9, paddingBottom: 16 }}>
      <View style={[styles.newHwInput, {backgroundColor: UIColors.text + '12'}]}>
        <SFSymbol style={[styles.newHwIcon]} size={20} color={UIColors.text + '80'} name="square.and.pencil" />
        <TextInput
          placeholder="Titre du devoir"
          placeholderTextColor={UIColors.text + '80'}
          multiline
          style={[
            styles.newHwTextInput,
            {
              color: UIColors.text
            }
          ]}
          value={homeworkTitle}
          onChangeText={(text) => {
            setHomeworkTitle(text);
          }}
        />
      </View>

      <View style={[styles.newHwSubjectInput, {backgroundColor: UIColors.text + '12'}]}>
        <View
          style={{
            width: 15,
            height: 15,
            borderRadius: 12,
            backgroundColor: getSavedCourseColor(nativeSubjects[selectedSubject]?.actionTitle, UIColors.primary),
          }}
        />

        <ContextMenuButton
          menuConfig={{
            menuTitle: 'Matières disponibles',
            menuItems: nativeSubjects,
          }}
          isMenuPrimaryAction={true}
          onPressMenuItem={({nativeEvent}) => {
            if (nativeEvent.actionKey === 'new') {
              addSubject();
              return;
            }

            // find id from nativeEvent.actionKey
            let id = nativeEvent.actionKey;
            let index = nativeSubjects.findIndex((item) => item.actionKey === id);
            setSelectedSubject(index);
          }}
        >
          <Text
            style={styles.newHwSubject}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {nativeSubjects[selectedSubject]?.actionTitle || 'Aucune matière'}
          </Text>
        </ContextMenuButton>
      </View>
      
    </View>
    <ScrollView
      style={{ flex: 1, backgroundColor: UIColors.modalBackground }}
      contentContainerStyle={{ flexGrow: 1, paddingTop: '16%', }}
    >
      <StatusBar animated backgroundColor="#fff" barStyle="light-content" />

      <PapillonLoading
        title="Ajouter un devoir"
        subtitle={"Indiquez un titre et une matière pour votre devoir personnalisé le " + new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', month: 'long', day: 'numeric' }) + "."}
        icon={<SFSymbol color={UIColors.text} name="book" size={26} style={{marginBottom:15}} />}
      />
    </ScrollView>
    <AlertBottomSheet
      visible={titleMissingAlert}
      title="Titre manquant"
      subtitle="Veuillez entrer un titre pour votre devoir."
      icon={<AlertTriangle />}
      cancelAction={() => {
        setTitleMissingAlert(false);
      }}
    />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  newHwInput: {
    marginHorizontal: 16,

    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
    borderRadius: 10,
    borderCurve: 'continuous',

    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: 13,
  },
  newHwIcon : {
    marginTop: 8,
  },
  newHwTextInput: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '400',
    color: '#000',
    width: '100%',
    paddingRight: 10,

    marginTop: "auto",
    marginBottom: "auto",
    
    marginTop: -5,
    paddingBottom: 4,
  },
  newHwSubjectInput: {
    marginHorizontal: 16,

    paddingHorizontal: 17,
    paddingVertical: 8,
    borderRadius: 10,
    borderCurve: 'continuous',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 16,
  },
  newHwSubject: {
    fontSize: 16,
    fontWeight: '400',
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginLeft: -10,
    borderRadius: 7,
    borderCurve: 'continuous',
    overflow: 'hidden',
    paddingRight: 26,
  },
});

export default CreateHomeworkScreen;