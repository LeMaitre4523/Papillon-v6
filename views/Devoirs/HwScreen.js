import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { PressableScale } from 'react-native-pressable-scale';

import { Check, Link, File } from 'lucide-react-native';

import * as WebBrowser from 'expo-web-browser';
import ParsedText from 'react-native-parsed-text';

import { useTheme } from 'react-native-paper';

import GetUIColors from '../../utils/GetUIColors';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';
import formatCoursName from '../../utils/FormatCoursName';
import { useAppContext } from '../../utils/AppContext';

function HomeworkScreen({ route, navigation }) {
  const theme = useTheme();
  const UIColors = GetUIColors();

  const { homework } = route.params;
  const [thisHwChecked, setThisHwChecked] = React.useState(homework.done);
  const [thisHwLoading, setThisHwLoading] = React.useState(false);

  const openURL = async (url) => {
    await WebBrowser.openBrowserAsync(url, {
      dismissButtonStyle: 'done',
      presentationStyle: 'pageSheet',
      controlsColor: UIColors.primary,
    });
  };

  const appctx = useAppContext();

  const changeHwState = () => {
    appctx.dataprovider
      .changeHomeworkState(!thisHwChecked, homework.date, homework.local_id)
      .then((result) => {

        if (result.status === 'not found') {
          setTimeout(() => {
            setThisHwChecked(homework.done);
          }, 100);
        } else if (result.status === 'ok') {
          setThisHwChecked(!thisHwChecked);
          setThisHwLoading(false);

          if (appctx.dataprovider.service === 'Pronote') {
            AsyncStorage.getItem('homeworksCache').then((homeworksCache) => {
              // find the homework
              const cachedHomeworks = JSON.parse(homeworksCache);

              for (let i = 0; i < cachedHomeworks.length; i++) {
                for (let j = 0; j < cachedHomeworks[i].timetable.length; j++) {
                  if (
                    cachedHomeworks[i].timetable[j].local_id ===
                    homework.local_id
                  ) {
                    cachedHomeworks[i].timetable[j].done =
                      !cachedHomeworks[i].timetable[j].done;
                  }
                }
              }

              AsyncStorage.setItem(
                'homeworksCache',
                JSON.stringify(cachedHomeworks)
              );
            });
          }
        }
        
        // sync with home page
        AsyncStorage.setItem('homeUpdated', 'true');
        // sync with devoirs page
        AsyncStorage.setItem('homeworksUpdated', 'true');

        // if tomorrow, update badge
        let tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        let checked = thisHwChecked;

        // if this homework is for tomorrow
        if (new Date(homework.date).getDate() === tomorrow.getDate()) {
          AsyncStorage.getItem('badgesStorage').then((value) => {
            let currentSyncBadges = JSON.parse(value);

            if (currentSyncBadges === null) {
              currentSyncBadges = {
                homeworks: 0,
              };
            }

            let newBadges = currentSyncBadges;
            newBadges.homeworks = checked ? newBadges.homeworks + 1 : newBadges.homeworks - 1;

            AsyncStorage.setItem('badgesStorage', JSON.stringify(newBadges));
          });
        }
      })
  };

  // add checkbox in header
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Devoir en " + formatCoursName(homework.subject.name),
    });
  }, [navigation, homework]);

  const handleUrlPress = (url, matchIndex) => {
    openURL(url);
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: UIColors.background }]}
      contentInsetAdjustmentBehavior="automatic"
    >
      {Platform.OS === 'ios' ? (
        <StatusBar animated barStyle="light-content" />
      ) : (
        <StatusBar
          animated
          barStyle={theme.dark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
        />
      )}

      <View style={{ height: 6 }} />

      <NativeList header="Contenu du devoir" inset>
        <NativeItem>
          <ParsedText
            style={[styles.hwContentText, {color: UIColors.text}]}
            selectable={true}
            parse={
              [
                {
                  type: 'url',
                  style: [styles.url, {color: UIColors.primary}],
                  onPress: handleUrlPress
                },
                {
                  type: 'email',
                  style: [styles.url, {color: UIColors.primary}],
                },
              ]
            }
          >
            {homework.description}
          </ParsedText>
        </NativeItem>
      </NativeList>

      <View style={{ height: 6 }} />

      <NativeList inset header="Statut du devoir">
        <NativeItem
          leading={
            <HwCheckbox
              checked={thisHwChecked}
              theme={theme}
              pressed={() => {
                setThisHwLoading(true);
                changeHwState();
              }}
              UIColors={UIColors}
              loading={thisHwLoading}
            />
          }
          onPress={() => {
            setThisHwLoading(true);
            changeHwState();
          }}
        >
          <NativeText heading="b">
            Marquer comme fait
          </NativeText>
        </NativeItem>
        <NativeItem
          trailing={
            <NativeText heading="p2">
              {new Date(homework.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </NativeText>
          }
        >
          <NativeText>
            A rendre pour le
          </NativeText>
        </NativeItem>
      </NativeList>

      <View style={{ height: 6 }} />

      { homework.files.length > 0 ? (
        <NativeList inset header="Fichiers">
          {homework.files.map((file, index) => {
            let fileIcon = <Link size={24} color={UIColors.text} />
            if (file.type === 1) {
              fileIcon = <File size={24} color={UIColors.text} />
            }

            return (
              <NativeItem
                key={index}
                onPress={() => {
                  openURL(file.url);
                }}
                leading={fileIcon}
              >
                <View style={{marginRight: 80, paddingLeft: 6}}>
                  <NativeText heading="h4">
                    {file.name}
                  </NativeText>
                  <NativeText numberOfLines={1}>
                    {file.url}
                  </NativeText>
                </View>
              </NativeItem>
            );

          })}
        </NativeList>
      ) : null }

    </ScrollView>
  );
}

function HwCheckbox({ checked, theme, pressed, UIColors, loading }) {
  return !loading ? (
    <PressableScale
      style={[
        styles.checkContainer,
        { borderColor: theme.dark ? '#333333' : '#c5c5c5' },
        checked ? styles.checkChecked : null,
        checked
          ? { backgroundColor: UIColors.primary, borderColor: UIColors.primary }
          : null,
      ]}
      weight="light"
      activeScale={0.7}
      onPress={() => {
        pressed();
      }}
    >
      {checked ? <Check size={20} color="#ffffff" /> : null}
    </PressableScale>
  ) : (
    <ActivityIndicator size={26} />
  );
}

const styles = StyleSheet.create({
  optionsList: {
    marginTop: 16,
  },

  checkboxContainer: {},
  checkContainer: {
    width: 26,
    height: 26,
    borderRadius: 16,
    borderCurve: 'continuous',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 1,
  },
  checkChecked: {
    backgroundColor: '#159C5E',
    borderColor: '#159C5E',
  },

  hwContent: {
    padding: 12,
    borderRadius: 12,
    borderCurve: 'continuous',
  },
  hwContentText: {
    fontSize: 16,
    paddingRight: 16,
  },

  homeworkFile: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    borderRadius: 12,
    borderCurve: 'continuous',
  },

  homeworkFileData: {
    gap: 2,
    flex: 1,
  },

  homeworkFileText: {
    fontSize: 17,
    fontWeight: 400,
    fontFamily: 'Papillon-Semibold',
  },
  homeworkFileUrl: {
    fontSize: 15,
    fontWeight: 400,
    fontFamily: 'Papillon-Medium',
    opacity: 0.5,
  },

  url: {
    textDecorationLine: 'underline',
  },
});

export default HomeworkScreen;
